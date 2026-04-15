from flask import Flask, jsonify, request
from datetime import datetime, timedelta
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# { user_id: {"lat": float, "lng": float, "last_updated": datetime} }
active_users = {}

stall_queues = {}

@app.route('/api/heartbeat', methods=['POST'])
def heartbeat():
    data = request.json
    user_id = data.get('user_id')
    lat = data.get('lat')
    lng = data.get('lng')
    speed = data.get('speed', 0)
    
    if not user_id or lat is None or lng is None:
        return jsonify({"error": "user_id, lat, and lng required"}), 400
        
    active_users[user_id] = {
        "lat": lat,
        "lng": lng,
        "last_updated": datetime.now()
    }
    
    print(f"[HEARTBEAT] User {user_id} | Lat: {lat}, Lng: {lng} | Speed: {speed} m/s")
    return jsonify({"status": "Heartbeat logged successfully"})

@app.route('/api/status/<user_id>', methods=['GET'])
def user_status(user_id):
    user_data = active_users.get(user_id)
    if not user_data:
        return jsonify({"status": "INACTIVE"}), 404
        
    if datetime.now() - user_data["last_updated"] <= timedelta(minutes=5):
        return jsonify({"status": "ACTIVE"})
    else:
        return jsonify({"status": "INACTIVE"})

@app.route('/api/heatmap', methods=['GET'])
def get_heatmap():
    # Filter out users who haven't sent a heartbeat in 10 minutes
    valid_users = []
    for uid, data in list(active_users.items()):
        if datetime.now() - data["last_updated"] <= timedelta(minutes=10):
            valid_users.append({
                "lat": data["lat"],
                "lng": data["lng"]
            })
    return jsonify({"users": valid_users})

@app.route('/api/queue/join', methods=['POST'])
def join_queue():
    data = request.json
    user_id = data.get('user_id')
    stall_id = data.get('stall_id')
    
    if not user_id or not stall_id:
        return jsonify({"error": "user_id and stall_id required"}), 400
        
    if stall_id not in stall_queues:
        stall_queues[stall_id] = []
        
    if user_id not in stall_queues[stall_id]:
        stall_queues[stall_id].append(user_id)
        
    return jsonify({"status": "joined", "queue_length": len(stall_queues[stall_id])})

@app.route('/api/mock-swarm', methods=['GET'])
def mock_swarm():
    # Bounds: [[33.675, -116.242], [33.686, -116.232]]
    # Lat: 33.675 to 33.686
    # Lng: -116.242 to -116.232
    for i in range(100):
        uid = f"mockbot_{i}"
        lat = random.uniform(33.675, 33.686)
        lng = random.uniform(-116.242, -116.232)
        active_users[uid] = {
            "lat": lat,
            "lng": lng,
            "last_updated": datetime.now()
        }
    return jsonify({"status": "Swarm deployed", "count": 100})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
