import os
import json
import base64
import datetime
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 
CORS(app, resources={r"/*": {"origins": "*"}})

MONGO_URI = os.getenv("MONGODB_URI")
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

def get_db():
    try:
        client = MongoClient(
            MONGO_URI, 
            tlsAllowInvalidCertificates=True, 
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000
        )
        client.admin.command('ping')
        print("✅ Database Connected")
        return client['Dizrologin']
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return None

def send_order_to_discord(data):
    try:
        if not DISCORD_WEBHOOK_URL:
            print("❌ Webhook URL missing in .env")
            return False

        image_base64 = data.get('imageFile')
        if not image_base64:
            print("❌ No image file provided")
            return False
            
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        img_data = base64.b64decode(image_base64)
        
        message = (
            f"💰 **[Dizro Shop] New Order!**\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"👤 User: `{data.get('username')}`\n"
            f"🎮 Game: `{data.get('gameName')}`\n"
            f"🆔 In-game: `{data.get('roleName')}`\n"
            f"📦 Package: **{data.get('package')}**\n"
            f"💰 Price: `{data.get('price')} THB`\n"
            f"------------------------------------\n"
            f"📌 UID: `{data.get('uid')}`\n"
            f"🔑 AID: `{data.get('aid')}`\n"
            f"🌐 Server: `{data.get('server')}`\n"
            f"------------------------------------\n"
            f"⏰ Time: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n"
            f"━━━━━━━━━━━━━━━━━━━━"
        )
        
        files = {"file": ("slip.png", img_data)}
        payload = {"content": message}
        
        response = requests.post(DISCORD_WEBHOOK_URL, data=payload, files=files, timeout=30)
        
        if response.status_code in [200, 204]:
            print("✅ Discord sent successfully")
            return True
        else:
            print(f"❌ Discord API error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Discord system error: {str(e)}")
        return False

@app.route('/api/buy', methods=['POST'])
def handle_buy():
    data = request.json
    print(f"📦 Processing order for: {data.get('username')}")
    
    if send_order_to_discord(data):
        return jsonify({
            "status": "success", 
            "transId": f"DZ-{datetime.datetime.now().strftime('%M%S')}"
        })
    else:
        return jsonify({"status": "error", "message": "Failed to send data to Discord"}), 500

@app.route('/api/index', methods=['POST', 'OPTIONS'])
def handle_request():
    if request.method == 'OPTIONS': 
        return jsonify({"status": "ok"}), 200
    
    data = request.json
    action = data.get('action') 
    user = data.get('username', '').lower().strip()
    pw = data.get('password', '').strip() 

    try:
        db = get_db()
        if db is None: return jsonify({"status": "error", "message": "DB Connection Fail"}), 500
        
        if action == 'register':
            if db.users.find_one({"username": user}):
                return jsonify({"status": "error", "message": "Username already exists"}), 400
            db.users.insert_one({"username": user, "password": pw, "role": "user"})
            return jsonify({"status": "success"})
        else:
            account = db.users.find_one({"username": user})
            if account and str(account.get('password')) == pw:
                return jsonify({"status": "success", "role": account.get('role'), "username": user})
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # ระบบ Cloud จะเป็นคนกำหนด Port ให้เราเองครับ
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)