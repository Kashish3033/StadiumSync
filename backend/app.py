from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "success",
        "message": "StadiumSync API is running!"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
