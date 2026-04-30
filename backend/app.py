from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Flask Backend Running Successfully!"

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

files_data = []

@app.route('/files', methods=['GET'])
def get_files():
    return jsonify(files_data)

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    file_info = {
        "id": len(files_data) + 1,
        "name": file.filename,
        "size": str(round(os.path.getsize(filepath)/1024,2)) + " KB"
    }

    files_data.append(file_info)

    return jsonify({"message": "Uploaded successfully"})

@app.route('/preview/<path:filename>')
def preview_file(filename):
    return send_from_directory(
        UPLOAD_FOLDER,
        filename,
        as_attachment=False
    )


@app.route('/download/<path:filename>')
def download_file(filename):
    return send_from_directory(
        UPLOAD_FOLDER,
        filename,
        as_attachment=True
    )

@app.route('/delete/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    global files_data
    files_data = [f for f in files_data if f["id"] != file_id]
    return jsonify({"message": "Deleted"})

@app.route('/create-file', methods=['POST'])
def create_file():
    data = request.json

    filename = data.get("filename")
    content = data.get("content", "")

    if not filename:
        return jsonify({"error": "Filename required"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    file_info = {
        "id": len(files_data) + 1,
        "name": filename,
        "size": str(round(os.path.getsize(filepath)/1024, 2)) + " KB",
        "date": "2026-04-30"
    }

    files_data.append(file_info)

    return jsonify({"message": "File created successfully"})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)