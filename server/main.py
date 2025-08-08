from flask import Flask, request
from flask_socketio import SocketIO, join_room, leave_room, emit
import random
import pyautogui
import keyboard


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


room_id = str(random.randint(1000, 9999))
connected_clients = set()  
print(f"✅ Server is ready. The secret room ID is: {room_id}")

def is_member_of_room(sid):
    """Check if a client is in the room."""
    return sid in connected_clients

def handle_client_action(sid, action, data=None):
    """Helper function to handle client actions."""
    if is_member_of_room(sid):
        if action == "gyro_data":
            handle_gyro_data(sid, data)
        elif action == "mouse_left":
            pyautogui.click(button="left")
            print(f"🔲 {sid} simulated a left mouse click.")
        elif action == "mouse_right":
            pyautogui.click(button="right")
            print(f"🔲 {sid} simulated a right mouse click.")
        elif action == "keyboard_left":
            keyboard.press_and_release("left")
            print(f"⏪ {sid} simulated a left arrow key press.")
        elif action == "keyboard_right":
            keyboard.press_and_release("right")
            print(f"⏩ {sid} simulated a right arrow key press.")
        elif action == "trackpad_action":
            pyautogui.click()
            print(f"🖱️ {sid} simulated a trackpad click.")
        elif action == "trackpad_touch":
            handle_trackpad_touch(sid, data)
        elif action == "trackpad_touch_end":
            print(f"🖱️ {sid} simulated a trackpad click at the end of touch.")
    else:
        print(f"⚠️ {sid} tried to perform '{action}' without being in the room.")

def handle_gyro_data(sid, data):
    """Handles gyroscope data sent from clients."""
    if is_member_of_room(sid):
        alpha, beta, gamma = data.get("alpha", 0), data.get("beta", 0), data.get("gamma", 0)
        screen_width, screen_height = pyautogui.size()

        move_x = gamma
        move_y = -beta

        print(f"Moving mouse to: {move_x}, {move_y}")
        pyautogui.moveRel(move_x, move_y, duration=0, tween=pyautogui.linear)

        socketio.emit("gyro_data", data, room=room_id, skip_sid=sid)
    else:
        print(f"⚠️ {sid} tried to send gyroscope data without being in the room.")

def handle_trackpad_touch(sid, data):
    """Handle trackpad touch events."""
    if is_member_of_room(sid):
        touch_x = data.get("x", 0) * 5
        touch_y = data.get("y", 0) * 5

        pyautogui.moveRel(touch_x, touch_y)
    else:
        print(f"⚠️ {sid} tried to send trackpad touch data without being in the room.")

@app.route('/')
def index():
    return "Socket.IO Server is Running!"

@socketio.on('connect')
def on_connect():
    sid = request.sid
    print(f"🔌 Client connected: {sid}")

@socketio.on('disconnect')
def on_disconnect():
    sid = request.sid
    connected_clients.discard(sid)  
    print(f"🔌 Client disconnected: {sid}")

@socketio.on('join')
def on_join(data):
    sid = request.sid
    if not isinstance(data, dict) or "room" not in data:
        print(f"❌ {sid} sent an invalid join request.")
        emit("join_status", {"status": "error", "message": "Invalid request format."})
        return
    
    client_room_id = data["room"]
    if client_room_id == room_id:
        join_room(room_id)
        connected_clients.add(sid)  
        print(f"✅ {sid} successfully joined room {room_id}")
        emit("join_status", {"status": "success", "message": f"Successfully joined room {room_id}."})
    else:
        print(f"❌ {sid} failed to join room. Provided: '{client_room_id}', Required: '{room_id}'")
        emit("join_status", {"status": "error", "message": "Incorrect room ID."})

@socketio.on('broadcast')
def on_broadcast(data):
    sid = request.sid
    if is_member_of_room(sid):
        emit("broadcast", data, room=room_id, skip_sid=sid)
        print(f"📢 Broadcast from {sid} to room {room_id}: {data}")
    else:
        print(f"⚠️ {sid} tried to broadcast without being in the room.")

@socketio.on('gyro_data')
def on_gyro_data(data):
    sid = request.sid
    handle_client_action(sid, "gyro_data", data)

@socketio.on('mouse_left')
def on_mouse_left():
    sid = request.sid
    handle_client_action(sid, "mouse_left")

@socketio.on('mouse_right')
def on_mouse_right():
    sid = request.sid
    handle_client_action(sid, "mouse_right")

@socketio.on('keyboard_left')
def on_keyboard_left():
    sid = request.sid
    handle_client_action(sid, "keyboard_left")

@socketio.on('keyboard_right')
def on_keyboard_right():
    sid = request.sid
    handle_client_action(sid, "keyboard_right")

@socketio.on('trackpad_action')
def on_trackpad_action():
    sid = request.sid
    handle_client_action(sid, "trackpad_action")

@socketio.on('trackpad_touch')
def on_trackpad_touch(data):
    sid = request.sid
    handle_client_action(sid, "trackpad_touch", data)

@socketio.on('trackpad_touch_end')
def on_trackpad_touch_end():
    sid = request.sid
    handle_client_action(sid, "trackpad_touch_end")

if __name__ == '__main__':
    socketio.run(app, host="localhost", port=8765, debug=True)
