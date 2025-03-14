# Importing required modules
from flask import Flask, request, jsonify, render_template, redirect, url_for
import mysql.connector
from mysql.connector import Error

# Flask constructor takes the name of 
# current module (__name__) as argument.
app = Flask(__name__)

# Database connection settings
host = "localhost"
database = "todoApiDb"
user = "root"
password = "root"

# Function to connect to the database
def connect_to_database():
    try:
        connection = mysql.connector.connect(
            host=host,
            database=database,
            user=user,
            password=password
        )
        if connection.is_connected():
            print("Connected to MySQL database")
        return connection
    except Error as e:
        print(f"Error: {e}")
        return None


@app.route('/test_db', methods=['GET'])
def test_db():
    conn = connect_to_database()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SHOW tables;")  
        tables = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"tables": tables})
    else:
        return jsonify({"error": "Failed to connect to database"}), 500

@app.route('/add_todo', methods=['POST'])
def add_todo():
    conn = connect_to_database()
    if conn:
        cursor = conn.cursor()
        try:
            data = request.get_json()
        except Exception as e:
            return jsonify({"error": f"Failed to parse JSON data: {e}"}), 400
        
        title = data['title']
        description = data['description']
        cursor.execute(f"INSERT INTO todoApiTb (todoTitle, todoDescription) VALUES ('{title}', '{description}');")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Todo added successfully"})
    else:
        return jsonify({"error": "Failed to connect to database"}), 500
    
@app.route('/get_todos', methods=['GET'])
def get_todos():
    conn = connect_to_database()
    if conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM todoApiTb;")
        todos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"todos": todos})
    else:
        return jsonify({"error": "Failed to connect to database"}), 500
    

@app.route('/delete_todo', methods=['DELETE'])
def delete_todo():
    conn = connect_to_database()
    if conn:
        cursor = conn.cursor()
        try:
            data = request.get_json()
        except Exception as e:
            return jsonify({"error": f"Failed to parse JSON data: {e}"}), 400
        
        todo_id = data['todo_id']
        cursor.execute(f"DELETE FROM todoApiTb WHERE todoId = {todo_id};")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Todo deleted successfully"})
    else:
        return jsonify({"error": "Failed to connect to database"}), 500
    
@app.route('/update_todo', methods=['PUT'])
def update_todo():
    conn = connect_to_database()
    if conn:
        cursor = conn.cursor()
        try:
            data = request.get_json()
        except Exception as e:
            return jsonify({"error": f"Failed to parse JSON data: {e}"}), 400
        
        todo_id = data['todo_id']
        title = data['title']
        description = data['description']
        cursor.execute(f"UPDATE todoApiTb SET todoTitle = '{title}', todoDescription = '{description}' WHERE todoId = {todo_id};")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Todo updated successfully"})
    else:
        return jsonify({"error": "Failed to connect to database"}), 500
    


# Main driver function
if __name__ == '__main__':
    
    app.run(debug=True)
