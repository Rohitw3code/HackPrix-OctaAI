# talk_ai.py - Updated Flask API with Agent + Memory + Tools (Fixed URL Regex)

from flask import Flask, Blueprint, request, jsonify
import requests
import base64
import re
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.embeddings import OpenAIEmbeddings
from langchain.agents import initialize_agent, AgentType, tool
import os

repo_talk = Blueprint('repo_talk', __name__)

# Global state
current_repo_data = {
    'owner': None,
    'repo': None,
    'url': None,
    'vectorstore': None,
    'agent': None
}

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
headers = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

valid_extensions = {".py", ".js", ".ts", ".java", ".cpp", ".c", ".cs", ".go", ".rs", ".php",
                    ".html", ".css", ".json", ".xml", ".yaml", ".yml", ".md", ".txt", ".gitignore", ".dockerignore"}
important_files = {"Dockerfile", "Makefile", "README", "LICENSE"}

# === Tools ===
@tool
def add_numbers(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

owner = ""
repo = ""

@tool
def get_git_commits() -> str:
    """Get the latest commits from a GitHub repository."""
    global owner, repo
    print("Fetching commits for repository:", owner, repo)
    
    if not owner or not repo:
        return "Owner or repository not set. Please load the repository first using /set-repo."

    url = f"https://api.github.com/repos/{owner}/{repo}/commits"
    params = {
        "sha": "main",
        "per_page": 10
    }

    # Ensure headers are set for authenticated requests
    response = requests.get(url, params=params, headers=headers)
    print("Response status code:", response.status_code)

    if response.status_code != 200:
        print("Response:", response.text)
        return f"Error fetching commits: {response.status_code} - {response.json().get('message', 'Unknown error')}"

    data = response.json()
    commit_lines = []
    for item in data:
        line = f"{item['commit']['author']['date']} - {item['commit']['author']['name']}: {item['commit']['message']} ({item['sha'][:7]})"
        commit_lines.append(line)

    return "\n".join(commit_lines) if commit_lines else "No commits found."

@tool
def search_repo(query: str) -> str:
    """Answer questions about the loaded GitHub repository."""
    qa = current_repo_data.get('qa_chain')
    if not qa:
        return "No repository loaded. Please load one with /set-repo."
    result = qa.invoke({"query": query})
    return result["result"]

# === Utilities ===
def is_relevant(file_name):
    return (
        any(file_name.endswith(ext) for ext in valid_extensions) or
        any(file_name == name or file_name.startswith(name) for name in important_files)
    )

def fetch_content(file_url):
    res = requests.get(file_url, headers=headers)
    if res.status_code == 200 and "content" in res.json():
        return base64.b64decode(res.json()["content"]).decode("utf-8", errors="ignore")
    return None

def get_repo_documents(owner, repo, branch="main", path=""):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}"
    res = requests.get(url, headers=headers)
    docs = []
    if res.status_code != 200:
        return []
    for item in res.json():
        if item["type"] == "file" and is_relevant(item["name"]):
            content = fetch_content(item["url"])
            if content:
                doc = Document(
                    page_content=content,
                    metadata={"path": item["path"], "file_name": item["name"]}
                )
                docs.append(doc)
        elif item["type"] == "dir":
            docs.extend(get_repo_documents(owner, repo, branch, item["path"]))
    return docs

def initialize_repo_context(repo_url):
    global owner, repo
    from langchain.chains import RetrievalQA
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)(?:\.git)?/?$", repo_url)
    if not match:
        raise ValueError("Invalid GitHub repository URL")
    owner, repo = match.groups()
    if (current_repo_data['owner'] == owner and current_repo_data['repo'] == repo and current_repo_data['agent']):
        return current_repo_data['agent']

    print(f"Loading repository: {owner}/{repo}")
    memory.clear()
    repo_docs = get_repo_documents(owner, repo)
    if not repo_docs:
        raise ValueError("No documents found in repository or repository is private/doesn't exist")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_documents(repo_docs)
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    vectorstore = FAISS.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever()

    from langchain.chains import RetrievalQA
    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(openai_api_key=OPENAI_API_KEY),
        retriever=retriever,
        return_source_documents=True,
    )

    tools = [add_numbers,get_git_commits, search_repo]
    llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY)
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        memory=memory,
        verbose=True,
    )

    current_repo_data.update({
        'owner': owner,
        'repo': repo,
        'url': repo_url,
        'vectorstore': vectorstore,
        'qa_chain': qa_chain,
        'agent': agent
    })
    print(f"Repository {owner}/{repo} loaded successfully")
    return agent

# === Memory ===
memory = ConversationBufferMemory(
    memory_key="chat_history",
    input_key="input",
    return_messages=True
)

# === Flask Routes ===
@repo_talk.route('/set-repo', methods=['POST'])
def set_repository():
    try:
        data = request.get_json()
        repo_url = data.get('url')
        if not repo_url:
            return jsonify({"error": "Repository URL is required"}), 400
        initialize_repo_context(repo_url)
        return jsonify({
            "success": True,
            "message": f"Repository {current_repo_data['owner']}/{current_repo_data['repo']} loaded successfully",
            "owner": current_repo_data['owner'],
            "repo": current_repo_data['repo'],
            "url": current_repo_data['url']
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@repo_talk.route('/test', methods=['POST'])
def test():
    return jsonify({
        "success": True,
        "message": "Welcome to the OctaAI Repository Talk API. Use the /query endpoint to ask questions about the repository."
    }), 200

@repo_talk.route('/query', methods=['POST'])
def query_repo():
    try:
        data = request.get_json()
        query = data.get('query')
        repo_url = data.get('repo_url')
        if not query:
            return jsonify({"error": "Query is required"}), 400
        if repo_url:
            initialize_repo_context(repo_url)
        if current_repo_data['agent'] is None:
            return jsonify({"error": "No repository loaded."}), 400
        result = current_repo_data['agent'].run(query)
        return jsonify({"answer": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@repo_talk.route('/current-repo', methods=['GET'])
def get_current_repo():
    if current_repo_data['owner'] and current_repo_data['repo']:
        return jsonify({
            "success": True,
            "owner": current_repo_data['owner'],
            "repo": current_repo_data['repo'],
            "url": current_repo_data['url']
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "No repository currently loaded"
        }), 200
