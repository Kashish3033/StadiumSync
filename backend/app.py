from flask import Flask, jsonify, request
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock database
# user_id: last_location_update_time (datetime object)
user_locations = {}

# Virtual Queues
stall_queues = {
    # seed a mock stall queue so the user starts behind 6 dummy users
    "stall_1": ["mock_user_1", "mock_user_2", "mock_user_3", "mock_user_4", "mock_user_5", "mock_user_6"]
}

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "success",
        "message": "StadiumSync API is running!"
    })

@app.route('/api/location/update', methods=['POST'])
def update_location():
    data = request.json
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    
    user_locations[user_id] = datetime.now()
    return jsonify({"status": "Location updated successfully"})

@app.route('/api/heartbeat', methods=['POST'])
def heartbeat():
    data = request.json
    user_id = data.get('user_id')
    lat = data.get('lat')
    lng = data.get('lng')
    speed = data.get('speed', 0)
    interval = data.get('interval', 0)
    
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
        
    print(f"[HEARTBEAT] User {user_id} | Lat: {lat}, Lng: {lng} | Speed: {speed} m/s | Interval: {interval}s")
    
    # Also update location for kinetic ticket
    user_locations[user_id] = datetime.now()
    
    return jsonify({"status": "Heartbeat logged successfully"})

@app.route('/api/ticket/status', methods=['GET'])
def ticket_status():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    
    last_update = user_locations.get(user_id)
    if not last_update:
        return jsonify({"status": "Ticket Deactivated", "message": "No location data found"}), 404
    
    # Check if last update is within 10 minutes
    if datetime.now() - last_update <= timedelta(minutes=10):
        return jsonify({"status": "ACTIVE"})
    else:
        return jsonify({"status": "Ticket Deactivated"})

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

@app.route('/api/queue/status', methods=['GET'])
def queue_status():
    user_id = request.args.get('user_id')
    stall_id = request.args.get('stall_id')
    
    if not user_id or not stall_id:
        return jsonify({"error": "user_id and stall_id required"}), 400
        
    if stall_id not in stall_queues or user_id not in stall_queues[stall_id]:
        return jsonify({"status": "not_in_queue"}), 404
        
    position = stall_queues[stall_id].index(user_id)
    eta_minutes = position * 2 
    
    return jsonify({
        "status": "in_queue",
        "position": position,
        "eta_minutes": eta_minutes
    })

@app.route('/api/queue/advance', methods=['POST'])
def advance_queue():
    data = request.json
    stall_id = data.get('stall_id')
    
    if not stall_id:
        return jsonify({"error": "stall_id required"}), 400
        
    if stall_id in stall_queues and len(stall_queues[stall_id]) > 0:
        popped_user = stall_queues[stall_id].pop(0)
        return jsonify({"status": "advanced", "served": popped_user, "remaining": len(stall_queues[stall_id])})
    
    return jsonify({"status": "empty", "message": "Queue is already empty"})

import random

@app.route('/api/routing/heatmap', methods=['GET'])
def routing_heatmap():
    # Mock Gate Data
    gates = [
        {"id": "North Gate", "distance": random.randint(100, 500), "density": random.randint(20, 200), "throughput": random.randint(15, 40)},
        {"id": "South Gate", "distance": random.randint(100, 500), "density": random.randint(20, 200), "throughput": random.randint(15, 40)},
        {"id": "East Gate",  "distance": random.randint(100, 500), "density": random.randint(20, 200), "throughput": random.randint(15, 40)},
        {"id": "West Gate",  "distance": random.randint(100, 500), "density": random.randint(20, 200), "throughput": random.randint(15, 40)}
    ]
    
    # Calculate Total Time for each gate
    # Walk Speed: average ~80 meters per minute
    WALK_SPEED_MPM = 80 
    
    fastest_time = float('inf')
    recommended_gate = None
    
    for gate in gates:
        walk_time = gate["distance"] / WALK_SPEED_MPM
        wait_time = gate["density"] / gate["throughput"]
        gate["walk_time"] = round(walk_time, 1)
        gate["wait_time"] = round(wait_time, 1)
        gate["total_time"] = round(walk_time + wait_time, 1)
        
        # Color intensity for Heatmap UI (0 to 1 scale based on density)
        gate["heat_level"] = min(1.0, gate["density"] / 150.0) 
        
        if gate["total_time"] < fastest_time:
            fastest_time = gate["total_time"]
            recommended_gate = gate["id"]
            
    for gate in gates:
        gate["is_recommended"] = (gate["id"] == recommended_gate)
        
    return jsonify({
        "status": "success",
        "gates": gates,
        "recommended_gate": recommended_gate
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)

