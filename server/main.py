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
        await sio.emit(
            "join_status",
            {"status": "error", "message": "Invalid request format."},
            to=sid,
        )
        return
    client_room_id = data["room"]
    if client_room_id == room_id:
        await sio.enter_room(sid, room_id)
        print(f"✅ {sid} successfully joined room {room_id}")
        await sio.emit(
            "join_status",
            {"status": "success", "message": f"Successfully joined room {room_id}."},
            to=sid,
        )
    else:
        print(
            f"❌ {sid} failed to join room. Provided: '{client_room_id}', Required: '{room_id}'"
        )
        await sio.emit(
            "join_status", {"status": "error", "message": "Incorrect room ID."}, to=sid
        )

@sio.event
async def broadcast(sid, data):
    if room_id in sio.rooms(sid):
        await sio.emit("broadcast", data, room=room_id, skip_sid=sid)
        print(f"📢 Broadcast from {sid} to room {room_id}: {data}")
    else:
        print(f"⚠️ {sid} tried to broadcast without being in the room.")

@sio.event
async def gyro_data(sid, data):
    """
    Handles gyroscope data sent from clients. This data is expected to contain
    'alpha', 'beta', and 'gamma' values. These will be used to move the mouse.
    """
    if room_id in sio.rooms(sid):
        alpha = data.get('alpha', 0)
        beta = data.get('beta', 0)
        gamma = data.get('gamma', 0)

        # Get the screen dimensions
        screen_width, screen_height = pyautogui.size()

        # Map the gyroscope values to screen coordinates
        move_x = (gamma / 90) * screen_width
        move_y = (beta / 180) * screen_height

        # Move the mouse to the new position
        print(f"Moving mouse to: {move_x}, {move_y}")
        pyautogui.moveTo(move_x, move_y, duration=0)

        # Broadcast the received gyroscope data to all clients in the room
        await sio.emit("gyro_data", data, room=room_id, skip_sid=sid)
    else:
        print(f"⚠️ {sid} tried to send gyroscope data without being in the room.")

@sio.event
async def mouse_left(sid):
    """Simulate a left mouse click."""
    if room_id in sio.rooms(sid):
        pyautogui.click(button='left')
        print(f"🔲 {sid} simulated a left mouse click.")
    else:
        print(f"⚠️ {sid} tried to send a mouse click without being in the room.")

@sio.event
async def mouse_right(sid):
    """Simulate a right mouse click."""
    if room_id in sio.rooms(sid):
        pyautogui.click(button='right')
        print(f"🔲 {sid} simulated a right mouse click.")
    else:
        print(f"⚠️ {sid} tried to send a mouse click without being in the room.")

@sio.event
async def keyboard_left(sid):
    """Simulate a left arrow key press."""
    if room_id in sio.rooms(sid):
        keyboard.press_and_release('left')
        print(f"⏪ {sid} simulated a left arrow key press.")
    else:
        print(f"⚠️ {sid} tried to send a keyboard action without being in the room.")

@sio.event
async def keyboard_right(sid):
    """Simulate a right arrow key press."""
    if room_id in sio.rooms(sid):
        keyboard.press_and_release('right')
        print(f"⏩ {sid} simulated a right arrow key press.")
    else:
        print(f"⚠️ {sid} tried to send a keyboard action without being in the room.")

@sio.event
async def trackpad_action(sid):
    """Simulate a trackpad (mouse move or click)."""
    if room_id in sio.rooms(sid):
        pyautogui.click()
        print(f"🖱️ {sid} simulated a trackpad click.")
    else:
        print(f"⚠️ {sid} tried to send a trackpad action without being in the room.")

if __name__ == "__main__":
    aiohttp.web.run_app(app, host="localhost", port=8765)
