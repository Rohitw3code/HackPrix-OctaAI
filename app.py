from flask import Flask
from flask_cors import CORS
from routes.readme_generator import readme_bp


app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# Register blueprints
app.register_blueprint(readme_bp, url_prefix='/api')

@app.route('/api', methods=['GET'])
def index():
    return {"success":True,"message":"Welcome to the API"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)


