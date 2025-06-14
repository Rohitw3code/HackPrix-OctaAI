from flask import Flask, Blueprint, request, jsonify
import requests
import base64
import re
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA
import os


repo_talk = Blueprint('repo_talk', __name__)

# Global variables to store current repository context
current_repo_data = {
    'owner': None,
    'repo': None,
    'url': None,
    'vectorstore': None,
    'qa_chain': None
}

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

headers = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# === File Filters ===
valid_extensions = {".py", ".js", ".ts", ".java", ".cpp", ".c", ".cs", ".go", ".rs", ".php",
                    ".html", ".css", ".json", ".xml", ".yaml", ".yml", ".md", ".txt", ".gitignore", ".dockerignore"}
important_files = {"Dockerfile", "Makefile", "README", "LICENSE"}

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
    """Initialize the repository context for chat"""
    # Extract owner and repo from URL
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        raise ValueError("Invalid GitHub repository URL")
    
    owner, repo = match.groups()
    
    # Check if we already have this repo loaded
    if (current_repo_data['owner'] == owner and 
        current_repo_data['repo'] == repo and 
        current_repo_data['qa_chain'] is not None):
        return current_repo_data['qa_chain']
    
    print(f"Loading repository: {owner}/{repo}")
    
    # Load repository documents
    repo_docs = get_repo_documents(owner, repo)
    if not repo_docs:
        raise ValueError("No documents found in repository or repository is private/doesn't exist")
    
    print(f"Found {len(repo_docs)} documents in repository")
    
    # Create embeddings and vectorstore
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_documents(repo_docs)
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    vectorstore = FAISS.from_documents(chunks, embeddings)
    
    # Create QA chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(openai_api_key=OPENAI_API_KEY),
        retriever=vectorstore.as_retriever(),
        return_source_documents=True
    )
    
    # Update global context
    current_repo_data.update({
        'owner': owner,
        'repo': repo,
        'url': repo_url,
        'vectorstore': vectorstore,
        'qa_chain': qa_chain
    })
    
    print(f"Repository {owner}/{repo} loaded successfully")
    return qa_chain

@repo_talk.route('/set-repo', methods=['POST'])
def set_repository():
    """Set the repository for chat context"""
    try:
        data = request.get_json()
        repo_url = data.get('url')
        
        if not repo_url:
            return jsonify({"error": "Repository URL is required"}), 400
        
        qa_chain = initialize_repo_context(repo_url)
        
        return jsonify({
            "success": True,
            "message": f"Repository {current_repo_data['owner']}/{current_repo_data['repo']} loaded successfully",
            "owner": current_repo_data['owner'],
            "repo": current_repo_data['repo'],
            "url": current_repo_data['url']
        }), 200
        
    except Exception as e:
        print(f"Error setting repository: {str(e)}")
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
        repo_url = data.get('repo_url')  # Add repo_url parameter
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        # If repo_url is provided, initialize the context
        if repo_url:
            try:
                initialize_repo_context(repo_url)
            except Exception as e:
                return jsonify({"error": f"Failed to load repository: {str(e)}"}), 400
        
        # Check if we have a repository context
        if current_repo_data['qa_chain'] is None:
            return jsonify({
                "error": "No repository loaded. Please provide a repository URL or set a repository first using /set-repo endpoint."
            }), 400
        
        print(f"Processing query: {query}")
        print(f"Current repo: {current_repo_data['owner']}/{current_repo_data['repo']}")
        
        result = current_repo_data['qa_chain'](query)
        return jsonify({
            "answer": result["result"],
            "source_documents": [doc.metadata for doc in result["source_documents"]]
        }), 200
        
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        return jsonify({"error": str(e)}), 500

@repo_talk.route('/current-repo', methods=['GET'])
def get_current_repo():
    """Get information about the currently loaded repository"""
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