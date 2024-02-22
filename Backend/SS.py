from flask import request,Flask,jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
app = Flask(__name__)
CORS(app)
ui = "mongodb+srv://Shop:120660@cluster0.rm5y0cu.mongodb.net/"
client = MongoClient(ui,server_api = ServerApi('1'))
client.admin.command('ping')
db = client['Shoppro']
collection = db['product']

@app.route("/")
def greet():
    return "<p>Welcome to Shop Notebook </p>"

# ----------------------------------------

@app.route("/notebook", methods=["GET"])
def get_all_notebook():
    notebook = list(collection.find() ) 
    return jsonify({"notebook": notebook})


@app.route("/student/<int:notebook_id>", methods=["GET"])
def get_notebook(notebook_id):
    notebook = collection.find_one({"id": notebook_id}, {"_id": 0})
    if notebook:
        return jsonify(notebook)
    else:
        return jsonify({"error": "Notebook not found"}), 404
    
# ---------------------------------

@app.route("/notebook", methods=["POST"])
def create_notebook():
    data = request.get_json()
    
    if collection.find_one({"_id":data["_id"]}):
        return jsonify({"error": "Notebook with the same ID already exists"}), 409
    else:
        collection.insert_one(data)
        return jsonify('Sucess'),200
# --------------------------------    

@app.route("/notebook/<int:notebook_id>", methods=["PUT"])
def update_notebook(notebook_id):
    data = request.get_json()

    existing_notebook = collection.find_one({"_id": notebook_id})

    if existing_notebook:
        collection.update_one({"_id": notebook_id}, {"$set": data})
        return jsonify(data)
    else:
        return jsonify({"error": "Notebook not found"}), 404

# --------------------------------------
@app.route("/notebook/<int:notebook_id>", methods=["DELETE"])
def delete_notebook(notebook_id):
    existing_notebook = collection.find_one({"_id": notebook_id})

    if existing_notebook:
        collection.delete_one({"_id": notebook_id})
        return jsonify({"message": "Notebook deleted successfully"}), 200
    else:
        return jsonify({"error": "Notebook not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)