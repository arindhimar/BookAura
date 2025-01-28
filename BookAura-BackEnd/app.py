from flask import Flask
from dotenv import load_dotenv
import os
from flask_cors import CORS 
from controllers.roles_controller import app as roles_app
from controllers.users_controller import app as users_app
from controllers.normal_users_controller import app as normal_users_app
from controllers.platform_administrators_controller import app as platform_administrators_app
from controllers.books_controller import app as books_app
from controllers.auth_controller import auth
from controllers.publisher_controller import app as publisher_app


# Load environment variables from .env
load_dotenv()

# Create the Flask app instance
app = Flask(__name__)
CORS(app)


# Set the SECRET_KEY from the .env file
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')


# Register blueprints with their respective prefixes
app.register_blueprint(roles_app, url_prefix='/roles')
app.register_blueprint(users_app, url_prefix='/users')
app.register_blueprint(normal_users_app, url_prefix='/normal_users')
app.register_blueprint(platform_administrators_app, url_prefix='/platform_administrators')
app.register_blueprint(books_app, url_prefix='/books')
app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(publisher_app, url_prefix='/publishers')


# Main driver function to run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
