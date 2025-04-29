from flask import Flask, request, jsonify
import os, json
import socket
import time

app = Flask(__name__)
BASE_DIR = "./cloud_storage"

@app.route('/upload/<user>/<folder>', methods=['POST'])
def upload(user, folder):
    data = request.get_json()
    path = os.path.join(BASE_DIR, user, folder)
    os.makedirs(path, exist_ok=True)
    with open(os.path.join(path, "data.json"), "w") as f:
        json.dump(data, f)
    return jsonify({"message": "Upload complete"})

@app.route('/download/<user>/<folder>', methods=['GET'])
def download(user, folder):
    path = os.path.join(BASE_DIR, user, folder, "data.json")
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
