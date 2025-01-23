from flask import request, jsonify, Blueprint
from models.roles import RolesModel


app = Blueprint('roles', __name__)
roles_model = RolesModel()

@app.route('/roles', methods=['GET'])
def get_all_roles():
    rows = roles_model.fetch_all_roles()
    roles = [{'role_id': row[0], 'role_name': row[1]} for row in rows]
    return jsonify(roles)

@app.route('/roles/<int:role_id>', methods=['GET'])
def get_role(role_id):
    row = roles_model.fetch_role_by_id(role_id)
    if row is None:
        return jsonify({'error': 'Role not found'}), 404
    role = {'role_id': row[0], 'role_name': row[1]}
    return jsonify(role)

@app.route('/roles', methods=['POST'])
def create_role():
    data = request.get_json()
    if 'role_name' not in data:
        return jsonify({'error': 'Missing required field: role_name'}), 400
    roles_model.create_role(data['role_name'])
    return jsonify({'message': 'Role created successfully'}), 201

@app.route('/roles/<int:role_id>', methods=['DELETE'])
def delete_role(role_id):
    if roles_model.fetch_role_by_id(role_id) is None:
        return jsonify({'error': 'Role not found'}), 404
    roles_model.delete_role(role_id)
    return jsonify({'message': 'Role deleted successfully'}), 200
