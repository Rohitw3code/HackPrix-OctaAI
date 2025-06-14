from flask import Blueprint, request, jsonify
from llm import get_groq_response


readme_bp = Blueprint('readme', __name__)


@readme_bp.route("/generate", methods=["POST"])
def generate_readme():
    data = request.json
    repo_url = data.get('url')
    message = data.get('message', '')  # Optional message

    
    # For now, just print and return the data
    print(f"Repository URL: {repo_url}")
    print(f"Optional Message: {message}")

    from os import environ

    token = environ.get('GITHUB_TOEKN')

    print("token : ",token)


    # token = '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'  # Replace with your token

    print("Processing the repository...")

    # Process the repository to get the folder structure and file details
    repo_tree = process_repo_tree(repo_url, '', token)

    print("Repository Tree: ", repo_tree)
    print("Generating the README...")

    final_prompt = f"""
    You are generating a beautiful README.md for a project repository. The repository details are as follows:

    - **Repository URL**: {repo_url}
    - **Repository Structure**: {repo_tree}
    - **Additional Info**: {message}

    ### Instructions:
    1. **Title & Badges**:
    - Display the project title prominently.
    - If a tech stack is provided, add tech stack logos using the following format for each technology or library used:
    - `[![Tech Stack](https://img.shields.io/badge/<Tech>-<Color>?style=for-the-badge&logo=<Tech>&logoColor=white)](link)`
    - Ensure the tech stack logos are aligned horizontally by placing them in the same line. Use this Markdown format to display logos.

    2. **Overview or About**:
    - Provide a brief project description, explaining its purpose and uniqueness. (Include only if information is provided)

    3. **Key Features**:
    - List main features in a bulleted format with emojis for emphasis. (Include only if provided)

    4. **Technology Stack**:
    - List the technologies used, based on the repository structure and imports.
    - Only mention the name of the tech stack based on the category like backend , Database,fronend,ML,Libs if availbale
    - Do not inlcude the badge here only mention the tech stack name

    5. **Getting Started or Quick Start**:
    - If installation or setup steps are available in the repository, provide clear instructions.
    - Mention how to install and setup the project based the stracture and framworked used


    6. **Usage**:
    - Outline how users can interact with the project (only if usage information is available).

    7. **Configuration**:
    - Provide configuration details like API keys or environment variables, if provided.

    8. **Contributing**:
    - Include contributing guidelines (if mentioned).

    9. **License**:
    - Include the license information (only if provided).

    10. **Project Strcture**:
    - brefily mention the project strcture , if the project strcture is too large then make it small and display it in better and simplified way

    11. **Credit to **
    - Mention Built with ❤️ by UserName or style in different way

    ### Formatting:
    - Avoid `====` for headings; use Markdown styles.
    - Use `*italic*` format for text that should be italicized.

    ### Design Considerations:
    - Ensure readability, use emojis, and make the design attractive but professional.
    - Focus on simplicity while maintaining a clean structure.
    - Align the tech stack horizontally using the Markdown image format, ensuring they are visually balanced.
    """


    # Generate the README.md using your LLM
    readme_md = get_groq_response(final_prompt)

    return jsonify({
        "success": True,
        "data": {
            'readme_md': readme_md
        }
    })

