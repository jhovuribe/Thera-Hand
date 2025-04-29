from flask import Flask, request, jsonify
import os, json
from datetime import datetime

app = Flask(__name__)
BASE_DIR = "./cloud_storage"

@app.route('/upload/<user>', methods=['POST'])
def upload(user):
    data = request.get_json()

    # Generate readable timestamp for filename
    timestamp = datetime.now().strftime("%d-%b-%Y_%H-%M-%S")  # e.g., 24-Apr-2025_17-30-39
    user_dir = os.path.join(BASE_DIR, user)
    os.makedirs(user_dir, exist_ok=True)

    filepath = os.path.join(user_dir, f"{timestamp}.json")
    with open(filepath, "w") as f:
        json.dump(data, f)

    return jsonify({"message": f"Upload saved as {timestamp}.json"})

@app.route('/download/<user>/<filename>', methods=['GET'])
def download(user, filename):
    filepath = os.path.join(BASE_DIR, user, f"{filename}.json")
    if not os.path.exists(filepath):
        return jsonify({"error": "Session not found"}), 404

    with open(filepath, "r") as f:
        return jsonify(json.load(f))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
