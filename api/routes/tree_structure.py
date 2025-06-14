from flask import Blueprint, request, jsonify
from utils.utils import process_repo_tree
import re

tree_bp = Blueprint('tree', __name__)

GITHUB_TOKEN = "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"

@tree_bp.route("/tree", methods=["POST"])
def get_repo_tree():
    """
    Get repository tree structure
    """
    try:
        data = request.json
        repo_url = data.get('url')
        
        if not repo_url:
            return jsonify({
                "success": False,
                "error": "Repository URL is required"
            }), 400
        
        # Validate GitHub URL
        if not re.match(r"https?://github\.com/([^/]+)/([^/]+)", repo_url):
            return jsonify({
                "success": False,
                "error": "Invalid GitHub repository URL. Format: https://github.com/owner/repo"
            }), 400
        
        # Extract owner and repo name
        match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", repo_url)
        owner, repo = match.groups()
        
        # Get repository tree structure
        tree_structure = process_repo_tree(repo_url, '', GITHUB_TOKEN)
        
        return jsonify({
            "success": True,
            "data": {
                "owner": owner,
                "repo": repo,
                "tree_structure": tree_structure,
                "url": repo_url
            }
        })
        
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}"
        }), 500

@tree_bp.route("/tree", methods=["GET"])
def tree_info():
    return jsonify({
        "success": True,
        "message": "Repository Tree Structure API. Use POST method with 'url' parameter to get tree structure."
    })