from flask import Flask, Blueprint, request, jsonify
import requests
import base64
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA
# from creds import GITHUB_TOKEN, OPENAI_API_KEY


repo_talk = Blueprint('repo_talk', __name__)

# === Config ===
owner = "Rohitw3code"          # Replace with the repo owner
repo = "HackPrix-OctaAI"       # Replace with the repo name
branch = "main"


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

def get_repo_documents(path=""):
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
            docs.extend(get_repo_documents(item["path"]))
    return docs

# === Initialize Vectorstore and QA Chain ===
repo_docs = get_repo_documents()
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunks = splitter.split_documents(repo_docs)
embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
vectorstore = FAISS.from_documents(chunks, embeddings)
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(openai_api_key=OPENAI_API_KEY),
    retriever=vectorstore.as_retriever(),
    return_source_documents=True
)

@repo_talk.route('/test', methods=['POST'])
def test():
    return jsonify({
        "success": True,
        "message": "Welcome to the OctaAI Repository Talk API. Use the /query endpoint to ask questions about the repository."
    }), 200


@repo_talk.route('/query', methods=['POST'])
def query_repo():
    data = request.get_json()
    query = data.get('query')
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    try:
        result = qa_chain(query)
        return jsonify({
            "answer": result["result"],
            "source_documents": [doc.metadata for doc in result["source_documents"]]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
