from flask import Blueprint, request, jsonify


readme_bp = Blueprint('readme', __name__)

@readme_bp.route("/hello")
def index():
    return jsonify({"message": "readme generator API"})


@readme_bp.route("/generate", methods=["POST"])
def readme_generator():
    pass
