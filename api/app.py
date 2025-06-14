from flask import Flask
from flask_cors import CORS
from routes.readme_generator import readme_bp
from routes.talk_ai import repo_talk
from routes.tree_structure import tree_bp
from dotenv import load_dotenv

# Load .env file
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Register blueprints
app.register_blueprint(readme_bp, url_prefix='/api')
app.register_blueprint(repo_talk, url_prefix='/api')
app.register_blueprint(tree_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def index():
    return {"success":True,"message":"Welcome to the OcatAI API"}

@app.route('/api', methods=['GET'])
def api():
    return {"success":True,"message":"Welcome to the API"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)