from flask import request, jsonify, Blueprint
from models.categories import CategoriesModel

app = Blueprint('categories', __name__)
categories_model = CategoriesModel()

@app.route('/', methods=['GET'])
def get_all_categories():
    rows = categories_model.fetch_all_categories()
    categories = [{'category_id': row[0], 'category_name': row[1]} for row in rows]
    return jsonify(categories)

@app.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    row = categories_model.fetch_category_by_id(category_id)
    if row is None:
        return jsonify({'error': 'Category not found'}), 404
    category = {'category_id': row[0], 'category_name': row[1]}
    return jsonify(category)

@app.route('/', methods=['POST'])
def create_category():
    data = request.get_json()
    
    if 'category_name' not in data:
        return jsonify({'error': 'Missing required field: category_name'}), 400
    categories_model.create_category(data['category_name'])
    return jsonify({'message': 'Category created successfully'}), 201

@app.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    data = request.get_json()
    print(data)
    if categories_model.fetch_category_by_id(category_id) is None:
        return jsonify({'error': 'Category not found'}), 404
    categories_model.update_category(category_id, data['category_name'])
    return jsonify({'message': 'Category updated successfully'})

@app.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    if categories_model.fetch_category_by_id(category_id) is None:
        return jsonify({'error': 'Category not found'}), 404
    categories_model.delete_category(category_id)
    return jsonify({'message': 'Category deleted successfully'}), 200

