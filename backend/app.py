from flask import Flask, request, jsonify
from flask_cors import CORS

import cloudinary
import cloudinary.uploader
import cloudinary.api

import firebase_admin
from firebase_admin import credentials, firestore

from dotenv import load_dotenv
import os

load_dotenv()

from datetime import datetime



# Flask
app = Flask(__name__)
CORS(app)


# Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET"),
    secure=True
)


# Firebase Firestore
firebase_config = {
    "type": os.getenv("TYPE"),
    "project_id": os.getenv("PROJECT_ID"),
    "private_key_id": os.getenv("PRIVATE_KEY_ID"),
    "private_key": os.getenv("PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("CLIENT_EMAIL"),
    "client_id": os.getenv("CLIENT_ID"),
    "auth_uri": os.getenv("AUTH_URI"),
    "token_uri": os.getenv("TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("CLIENT_X509_CERT_URL"),
    "universe_domain": os.getenv("UNIVERSE_DOMAIN")
}
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred)

database = firestore.client()


# Home
@app.route('/')
def home():
    return "Flask Backend Running Scuccessfully!!"


# Upload File
@app.route('/upload', methods=['POST'])
def upload_file():
    print("UPLOAD STARTED")

    if 'file' not in request.files:
        print("NO FILE")
        return jsonify({"error":"No file"}),400

    file = request.files['file']
    print("FILE:", file.filename)

    try:
        file_bytes = file.read()
        print("SIZE:", len(file_bytes))

        result = cloudinary.uploader.upload(
            file_bytes,
            resource_type="auto"
        )

        print("CLOUDINARY RESULT:", result)

        database.collection("files").add({
            "name": file.filename,
            "size": f"{round(len(file_bytes)/1024,2)} KB",
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "resource_type": result["resource_type"]
        })

        print("FIRESTORE SUCCESS...")
        return jsonify({"message":"Uploaded"})

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error":str(e)}),500


# Get All Files
@app.route('/files', methods=['GET'])
def get_files():
    docs = database.collection("files").stream()
    files = []
    for doc in docs:
        data = doc.to_dict()

        files.append({
            "id": doc.id,
            "name": data.get("name"),
            "size": data.get("size"),
            "url": data.get("url"),
            "public_id": data.get("public_id"),
            "type": data.get("resource_type")
            # "uploadedAt": datetime.utcnow()
        })
    return jsonify(files)


# Preview
@app.route('/preview/<string:file_id>', methods=['GET'])
def preview_file(file_id):
    doc = database.collection("files").document(file_id).get()

    if not doc.exists:
        return jsonify({"error": "File not found"}), 404

    return jsonify(doc.to_dict())

# Create File
@app.route('/create-file', methods=['POST'])
def create_file():
    try:
        data = request.json
        filename = data.get("filename")
        content = data.get("content", "")

        if not filename.endswith(".txt"):
            filename += ".txt"

        if not filename:
            return jsonify({
                "error": "Filename required"
            }), 400

        text_file = BytesIO(content.encode("utf-8"))

        result = cloudinary.uploader.upload(
            text_file,
            resource_type="raw",
            public_id=filename
        )
        print(result)

        file_url = result["secure_url"]
        size_kb = round(len(content.encode("utf-8")) / 1024, 2)
        doc_ref = database.collection("files").add({
            "name": filename,
            "size": f"{size_kb} KB",
            "url": file_url,
            "public_id": result["public_id"],
            "resource_type": result["resource_type"]
        })

        return jsonify({
            "message": "File created successfully",
            "id": doc_ref[1].id,
            "url": file_url
        })

    except Exception as e:
        print("CREATE FILE ERROR:", str(e))
        return jsonify({
            "error": str(e)
        }), 500


# Delete
@app.route('/delete/<string:file_id>', methods=['DELETE'])
def delete_file(file_id):
    try:
        doc_ref = database.collection("files").document(file_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({
                "error": "File not found"
            }), 404

        data = doc.to_dict()
        public_id = data.get("public_id")

        if public_id:

            cloudinary.uploader.destroy(
                public_id,
                resource_type=data.get("resource_type", "image"),
                invalidate=True
            )

        doc_ref.delete()
        return jsonify({
            "message": "Deleted successfully"
        })

    except Exception as e:
        print("DELETE ERROR:", str(e))
        return jsonify({
            "error": str(e)
        }), 500


# Run
if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )