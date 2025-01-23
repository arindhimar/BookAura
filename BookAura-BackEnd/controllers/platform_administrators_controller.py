from flask import request, jsonify, Blueprint
from models.platform_administrators import PlatformAdministratorsModel

app = Blueprint('platform_administrators', __name__)
platform_administrators_model = PlatformAdministratorsModel()

@app.route('/platform_administrators', methods=['GET'])
def get_all_platform_administrators():
    rows = platform_administrators_model.fetch_all_platform_administrators()
    admins = [{'admin_id': row[0], 'user_id': row[1]} for row in rows]
    return jsonify(admins)

@app.route('/platform_administrators/<int:admin_id>', methods=['GET'])
def get_platform_administrator(admin_id):
    row = platform_administrators_model.fetch_platform_administrator_by_id(admin_id)
    if row is None:
        return jsonify({'error': 'Administrator not found'}), 404
    admin = {'admin_id': row[0], 'user_id': row[1]}
    return jsonify(admin)

@app.route('/platform_administrators', methods=['POST'])
def create_platform_administrator():
    data = request.get_json()
    if 'user_id' not in data:
        return jsonify({'error': 'Missing required field: user_id'}), 400
    platform_administrators_model.create_platform_administrator(data['user_id'])
    return jsonify({'message': 'Platform administrator created successfully'}), 201

@app.route('/platform_administrators/<int:admin_id>', methods=['DELETE'])
def delete_platform_administrator(admin_id):
    if platform_administrators_model.fetch_platform_administrator_by_id(admin_id) is None:
        return jsonify({'error': 'Administrator not found'}), 404
    platform_administrators_model.delete_platform_administrator(admin_id)
    return jsonify({'message': 'Platform administrator deleted successfully'}), 200
