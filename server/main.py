import socketio
import random
import aiohttp.web
import pyautogui
import keyboard

sio = socketio.AsyncServer(async_mode="aiohttp", cors_allowed_origins="*")
app = aiohttp.web.Application()
sio.attach(app)

room_id = str(random.randint(1000, 9999))
print(f"✅ Server is ready. The secret room ID is: {room_id}")

def is_member_of_room(sid):
    """Check if a client is in the room."""
    return room_id in sio.rooms(sid)

async def handle_client_action(sid, action, data=None):
    """Helper function to handle client actions."""
    if is_member_of_room(sid):
        if action == "gyro_data":
            await handle_gyro_data(sid, data)  
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
            await handle_trackpad_touch(sid, data)  
        elif action == "trackpad_touch_end":
            print(f"🖱️ {sid} simulated a trackpad click at the end of touch.")
    else:
        print(f"⚠️ {sid} tried to perform '{action}' without being in the room.")

async def handle_gyro_data(sid, data):
    """Handles gyroscope data sent from clients."""
    if is_member_of_room(sid):
        alpha, beta, gamma = data.get("alpha", 0), data.get("beta", 0), data.get("gamma", 0)
        screen_width, screen_height = pyautogui.size()

        move_x = (gamma / 90) * screen_width
        move_y = (beta / 180) * screen_height

        print(f"Moving mouse to: {move_x}, {move_y}")
        pyautogui.moveRel(move_x, move_y, duration=0, tween=pyautogui.linear)

        await sio.emit("gyro_data", data, room=room_id, skip_sid=sid)
    else:
        print(f"⚠️ {sid} tried to send gyroscope data without being in the room.")

async def handle_trackpad_touch(sid, data):
    """Handle trackpad touch events."""
    if is_member_of_room(sid):
        touch_x = data.get("x", 0)
        touch_y = data.get("y", 0)

        pyautogui.moveRel(touch_x, touch_y, duration=0, tween=pyautogui.linear)
        print(f"Trackpad touch detected: X: {touch_x}, Y: {touch_y}")
    else:
        print(f"⚠️ {sid} tried to send trackpad touch data without being in the room.")

@sio.event
async def connect(sid, environ):
    print(f"🔌 Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")

@sio.event
async def join(sid, data):
    if not isinstance(data, dict) or "room" not in data:
        print(f"❌ {sid} sent an invalid join request.")
        await sio.emit("join_status", {"status": "error", "message": "Invalid request format."}, to=sid)
        return
    
    client_room_id = data["room"]
    if client_room_id == room_id:
        await sio.enter_room(sid, room_id)
        print(f"✅ {sid} successfully joined room {room_id}")
        await sio.emit("join_status", {"status": "success", "message": f"Successfully joined room {room_id}."}, to=sid)
    else:
        print(f"❌ {sid} failed to join room. Provided: '{client_room_id}', Required: '{room_id}'")
        await sio.emit("join_status", {"status": "error", "message": "Incorrect room ID."}, to=sid)

@sio.event
async def broadcast(sid, data):
    if is_member_of_room(sid):
        await sio.emit("broadcast", data, room=room_id, skip_sid=sid)
        print(f"📢 Broadcast from {sid} to room {room_id}: {data}")
    else:
        print(f"⚠️ {sid} tried to broadcast without being in the room.")

@sio.event
async def gyro_data(sid, data):
    await handle_client_action(sid, "gyro_data", data)

@sio.event
async def mouse_left(sid):
    await handle_client_action(sid, "mouse_left")

@sio.event
async def mouse_right(sid):
    await handle_client_action(sid, "mouse_right")

@sio.event
async def keyboard_left(sid):
    await handle_client_action(sid, "keyboard_left")

@sio.event
async def keyboard_right(sid):
    await handle_client_action(sid, "keyboard_right")

@sio.event
async def trackpad_action(sid):
    await handle_client_action(sid, "trackpad_action")

@sio.event
async def trackpad_touch(sid, data):
    await handle_client_action(sid, "trackpad_touch", data)

@sio.event
async def trackpad_touch_end(sid):
    await handle_client_action(sid, "trackpad_touch_end")

if __name__ == "__main__":
    aiohttp.web.run_app(app, host="localhost", port=8765)
