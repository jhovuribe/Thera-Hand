from flask import Flask, request, jsonify
import os, json
import time

app = Flask(__name__)
BASE_DIR = "./cloud_storage"
API_KEY = "API_cred"  # <-- Add your API key here

@app.route('/upload/<user>/<timestamp>', methods=['POST'])
def upload(user, timestamp):
    # 1. Check for API Key
    api_key = request.headers.get('x-api-key')
    if api_key != API_KEY:
        return jsonify({"error": "Unauthorized"}), 401

    # 2. Save the data
    data = request.get_json()
    path = os.path.join(BASE_DIR, user)
    os.makedirs(path, exist_ok=True)

    file_path = os.path.join(path, f"{timestamp}.json")
    with open(file_path, "w") as f:
        json.dump(data, f)

    return jsonify({"message": "Upload complete"})

@app.route('/download/<user>/<timestamp>', methods=['GET'])
def download(user, timestamp):
    path = os.path.join(BASE_DIR, user, f"{timestamp}.json")
    if not os.path.exists(path):
        return jsonify({"error": "Not found"}), 404

    with open(path, "r") as f:
        return jsonify(json.load(f))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
