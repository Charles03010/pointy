import socketio
import random
import aiohttp.web


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
    """
    Allows a client to join the room only if they provide the correct room ID.
    """
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
    """
    Broadcasts a message only to clients in the room.
    """

    if room_id in sio.rooms(sid):
        await sio.emit("broadcast", data, room=room_id, skip_sid=sid)
        print(f"📢 Broadcast from {sid} to room {room_id}: {data}")
    else:
        print(f"⚠️ {sid} tried to broadcast without being in the room.")

if __name__ == "__main__":
    aiohttp.web.run_app(app, host="localhost", port=8765)