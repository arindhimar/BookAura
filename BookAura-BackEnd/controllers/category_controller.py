from flask import request, jsonify, Blueprint
from models.categories import CategoriesModel
import traceback

app = Blueprint('categories', __name__)
categories_model = CategoriesModel()

@app.route('/', methods=['GET'])
def get_all_categories():
    try:
        rows = categories_model.fetch_all_categories()
        categories = [{'category_id': row[0], 'category_name': row[1]} for row in rows]
        return jsonify(categories)
    except Exception as e:
        print(f"Error fetching categories: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch categories', 'details': str(e)}), 500

@app.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    try:
        row = categories_model.fetch_category_by_id(category_id)
        if row is None:
            return jsonify({'error': 'Category not found'}), 404
        category = {'category_id': row[0], 'category_name': row[1]}
        return jsonify(category)
    except Exception as e:
        print(f"Error fetching category {category_id}: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch category', 'details': str(e)}), 500

@app.route('/', methods=['POST'])
def create_category():
    try:
        data = request.get_json()
        
        if 'category_name' not in data:
            return jsonify({'error': 'Missing required field: category_name'}), 400
            
        # Check if category already exists
        existing = categories_model.fetch_category_by_name(data['category_name'])
        if existing:
            return jsonify({'error': 'Category with this name already exists'}), 409
            
        categories_model.create_category(data['category_name'])
        return jsonify({'message': 'Category created successfully'}), 201
    except Exception as e:
        print(f"Error creating category: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to create category', 'details': str(e)}), 500

@app.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    try:
        data = request.get_json()
        if not data or 'category_name' not in data:
            return jsonify({'error': 'Missing required field: category_name'}), 400
            
        if categories_model.fetch_category_by_id(category_id) is None:
            return jsonify({'error': 'Category not found'}), 404
            
        # Check if new name already exists for another category
        existing = categories_model.fetch_category_by_name(data['category_name'])
        if existing and existing[0] != category_id:
            return jsonify({'error': 'Category with this name already exists'}), 409
            
        categories_model.update_category(category_id, data['category_name'])
        return jsonify({'message': 'Category updated successfully'})
    except Exception as e:
        print(f"Error updating category {category_id}: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to update category', 'details': str(e)}), 500

@app.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        if categories_model.fetch_category_by_id(category_id) is None:
            return jsonify({'error': 'Category not found'}), 404
        categories_model.delete_category(category_id)
        return jsonify({'message': 'Category deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting category {category_id}: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to delete category', 'details': str(e)}), 500

@app.route('/books', methods=['GET'])
def get_all_books_category_wise():
    try:
        category_wise_books = categories_model.fetch_books_category_wise()
        return jsonify(category_wise_books), 200
    except Exception as e:
        print(f"Error fetching books by category: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch books by category', 'details': str(e)}), 500

