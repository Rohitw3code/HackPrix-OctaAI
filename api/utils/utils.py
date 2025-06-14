import re
import requests
import base64


IGNORED_FOLDERS = [
    # General
    '.git', '.github', '__pycache__', 'env', 'venv', '.idea', '.vscode', 'tmp', 'temp',
    
    # Python
    '.tox', '.pytest_cache', 'htmlcov', '.mypy_cache', '.pytype', '.cache', '*.egg-info',

    # Node.js
    'node_modules', 'bower_components', '.pnp', '.yarn', '.npm',

    # Java
    'target', '.gradle', '.mvn', '*.class',

    # C/C++/Rust
    'build', 'dist', 'out', 'cmake-build-debug', 'cmake-build-release', 'cargo-target',

    # Go
    'bin', 'pkg',

    # Ruby
    '.bundle', 'vendor/bundle',

    # PHP
    'vendor',

    # JavaScript Frameworks
    '.next', '.nuxt', '.angular',

    # Logs and system files
    'logs', '*.log', '.DS_Store', 'Thumbs.db', '.sass-cache', 'npm-debug.log*',

    # Testing and coverage
    'coverage', '.nyc_output', '.coverage',

    # Misc
    '.svn', 'CVS', '.hg', '.bzr', '_build', 'deps', '*.lock', '*.log', '*.pid', '*.seed', '*.bak'
]

FILE_TYPES = {
    "Images": r"\.(png|jpe?g|gif|bmp|svg|webp|ico|tiff)$",
    "Videos": r"\.(mp4|avi|mov|mkv|wmv|flv|webm)$",
    "Audios": r"\.(mp3|wav|aac|ogg|flac|wma)$",
    "Documents": r"\.(pdf|docx?|pptx?|odt|xlsx|csv)$",
    "Archives": r"\.(zip|tar|gz|rar|7z)$",
    "Others": r"\.(log|dat|sqlite|bin|dll)$"
}


def process_repo_tree(repo_url, path='', token=None, depth=0):
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        raise ValueError("Invalid GitHub repository URL. Format: https://github.com/owner/repo")

    owner, repo = match.groups()
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        try:
            data = response.json()

            tree_structure = ''
            import_section = ''  # To store the import section of files
            file_counts = {key: 0 for key in FILE_TYPES}  # Initialize counters for file types

            # Check if the path corresponds to a folder or a file
            if isinstance(data, list):
                indent = '  ' * depth
                tree_structure += f"{indent}{path if path else repo}:\n"
                folder_tree = ''

                for item in data:
                    if item['type'] == 'dir':
                        if item['name'] in IGNORED_FOLDERS:
                            continue
                        folder_tree += process_repo_tree(repo_url, item['path'], token, depth + 1)
                    elif item['type'] == 'file':
                        # Determine the file type and increment the corresponding counter
                        file_type_found = False
                        for file_type, pattern in FILE_TYPES.items():
                            if re.search(pattern, item['name'], re.IGNORECASE):
                                file_counts[file_type] += 1
                                file_type_found = True
                                break

                        if not file_type_found:  # If no matching type, consider as "Others"
                            file_counts["Others"] += 1

                        # Add non-media files to the folder tree and process imports
                        if not file_type_found or file_type != "Images":
                            folder_tree += f"{indent}  {item['name']}\n"
                            file_imports = get_file_imports(repo_url, item['path'], token)
                            if file_imports:
                                import_section += f"{indent}  Imports for {item['name']}:\n{file_imports}\n"

                # Add file type counts to the tree structure
                for file_type, count in file_counts.items():
                    if count > 0:
                        tree_structure += f"{indent}  ({count} {file_type.lower()} files detected)\n"

                tree_structure += folder_tree

            return tree_structure + import_section
        except Exception as e:
            raise ValueError(f"Error processing repository tree: {e}")
    else:
        raise ValueError(f"Failed to fetch data from GitHub API: {response.status_code}")



def get_file_imports(repo_url, path, token=None):
    """
    Fetches the content of a file from GitHub and extracts imports based on the language.
    Supports Python, C++, JavaScript, TypeScript, Java, Kotlin, Rust, and other popular languages.
    Handles Unicode decoding issues gracefully.
    """
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        raise ValueError("Invalid GitHub repository URL. Format: https://github.com/owner/repo")

    owner, repo = match.groups()
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        try:
            data = response.json()
            # Decode content with error handling for Unicode issues
            file_content = base64.b64decode(data['content']).decode('utf-8', errors='replace')

            imports = []
            # Extract imports based on file extension
            if path.endswith('.py'):  # Python
                imports = re.findall(r'^\s*import\s+(\S+)|^\s*from\s+(\S+)\s+import\s+(\S+)', file_content, re.MULTILINE)
                imports = [f"import {imp[0]}" if imp[0] else f"from {imp[1]} import {imp[2]}" for imp in imports]
            elif path.endswith('.cpp') or path.endswith('.h'):  # C++
                imports = re.findall(r'^\s*#include\s+["<](\S+)[">]', file_content, re.MULTILINE)
            elif path.endswith('.js') or path.endswith('.ts'):  # JavaScript/TypeScript
                imports = re.findall(r'^\s*import\s+.*?\s+from\s+["\'](\S+)["\']|^\s*import\s+(\S+)', file_content, re.MULTILINE)
                imports = [imp[0] or imp[1] for imp in imports]
            elif path.endswith('.java'):  # Java
                imports = re.findall(r'^\s*import\s+([\w\.]+);', file_content, re.MULTILINE)
            elif path.endswith('.kt'):  # Kotlin
                imports = re.findall(r'^\s*import\s+([\w\.]+)', file_content, re.MULTILINE)
            elif path.endswith('.rs'):  # Rust
                imports = re.findall(r'^\s*extern\s+crate\s+(\w+)|^\s*use\s+([\w\:]+)', file_content, re.MULTILINE)
                imports = [imp[0] or imp[1] for imp in imports]
            elif path.endswith('.go'):  # Go
                imports = re.findall(r'^\s*import\s+["](\S+)["]', file_content, re.MULTILINE)
            elif path.endswith('.cs'):  # C#
                imports = re.findall(r'^\s*using\s+([\w\.]+);', file_content, re.MULTILINE)
            elif path.endswith('.php'):  # PHP
                imports = re.findall(r'^\s*require\s+["\'](\S+)["\']|^\s*include\s+["\'](\S+)["\']', file_content, re.MULTILINE)
                imports = [imp[0] or imp[1] for imp in imports]

            # Return extracted imports as a string
            if imports:
                return "\n".join(imports)
            return None
        except Exception as e:
            raise ValueError(f"Error processing file content: {e}")
    else:
        raise Exception(f"Error {response.status_code}: {response.json().get('message', 'Unknown error')}")
    