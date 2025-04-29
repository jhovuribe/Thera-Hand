from flask import Flask, request, jsonify
import os, json, time, socket
from datetime import datetime

app = Flask(__name__)
BASE_DIR = "./cloud_storage"

# Replace or expand this dictionary to support multiple authorized ESP clients
API_KEYS = {
    "jhovanny": "abc123xyz",  # client_id : api_key
}

@app.route('/upload/<user>/<timestamp>', methods=['POST'])
def upload(user, timestamp):
    # API key check
    api_key = request.headers.get("X-API-KEY")
    if API_KEYS.get(user) != api_key:
        return jsonify({"error": "Unauthorized"}), 401

    # Timestamp parsing
    try:
        ts = int(timestamp)
        session_time = datetime.fromtimestamp(ts).strftime("Session_%m-%d-%Y_%H-%M-%S")
    except Exception:
        return jsonify({"error": "Invalid timestamp"}), 400

    # Save JSON
    user_dir = os.path.join(BASE_DIR, user)
    os.makedirs(user_dir, exist_ok=True)
    filepath = os.path.join(user_dir, f"{session_time}.json")
    data = request.get_json()

    with open(filepath, "w") as f:
        json.dump(data, f)

    return jsonify({"message": "Upload complete", "file": filepath})

@app.route('/download/<user>/<filename>', methods=['GET'])
def download(user, filename):
    path = os.path.join(BASE_DIR, user, filename)
    if not os.path.exists(path):
        return jsonify({"error": "Not found"}), 404
    with open(path, "r") as f:
        return jsonify(json.load(f))

def check_network_connection():
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        return False

if __name__ == "__main__":
    print("[Cloud Server] Checking Wi-Fi connection...")
    while not check_network_connection():
        print("[Cloud Server] Wi-Fi not available. Retrying in 5 seconds...")
        time.sleep(5)
    
    print("[Cloud Server] Wi-Fi connected! Starting Flask server...")
    app.run(host="0.0.0.0", port=5000)
