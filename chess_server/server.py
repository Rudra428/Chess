from flask import Flask, request
from flask_socketio import SocketIO, join_room, emit
import uuid

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

games = {}

users = {} 

def broadcast_user_list():
    user_list = [{"id": sid, "name": u["name"], "status": u["status"]} for sid, u in users.items()]
    emit("user-list", user_list, broadcast=True)

@socketio.on("connect")
def on_connect():
    print(f"Client connected: {request.sid}")

@socketio.on("disconnect")
def on_disconnect():
    if request.sid in users:
        del users[request.sid]
        broadcast_user_list()
    for game_id, game in games.items():
        if request.sid in game["players"]:
            emit("opponent-disconnected", to=game_id)

@socketio.on("login")
def on_login(username):
    users[request.sid] = {"name": username, "status": "available"}
    broadcast_user_list()


@socketio.on("logout")
def on_logout():
    if request.sid in users:
        del users[request.sid]
        broadcast_user_list()

@socketio.on("get-users")
def on_get_users():
    user_list = [{"id": sid, "name": u["name"], "status": u["status"]} for sid, u in users.items()]
    emit("user-list", user_list, to=request.sid)


@socketio.on("send-challenge")
def on_challenge(data):
    target_sid = data["targetId"]
    challenger_name = users[request.sid]["name"]
    
    if target_sid in users and users[target_sid]["status"] == "available":
        emit("receive-challenge", {
            "challengerId": request.sid, 
            "challengerName": challenger_name
        }, to=target_sid)
    else:
        emit("challenge-failed", {"message": "User is busy or offline"}, to=request.sid)

@socketio.on("respond-challenge")
def on_challenge_response(data):
    challenger_id = data["challengerId"]
    accepted = data["accepted"]
    
    if accepted:
        game_id = f"game_{uuid.uuid4().hex[:8]}"
        users[request.sid]["status"] = "playing"
        if challenger_id in users:
            users[challenger_id]["status"] = "playing"
        broadcast_user_list()
        games[game_id] = {"players": [challenger_id, request.sid], "fen": None}
        emit("game-start", {"gameId": game_id, "color": "w"}, to=challenger_id)
        emit("game-start", {"gameId": game_id, "color": "b"}, to=request.sid)

    else:
        emit("challenge-rejected", to=challenger_id)
@socketio.on("join-game-room")
def on_join_game_room(game_id):
    join_room(game_id)

@socketio.on("move")
def on_move(data):
    game_id = data["gameId"]
    if game_id in games:
        games[game_id]["fen"] = data["fen"]
        emit("state", data["fen"], to=game_id, include_self=False)

@socketio.on("resign")
def on_resign(data):
    emit("opponent-resigned", to=data["gameId"], include_self=False)
    for pid in games[data["gameId"]]["players"]:
        if pid in users: users[pid]["status"] = "available"
    broadcast_user_list()


@socketio.on("draw-offer")
def on_draw_offer(data):
    emit("draw-offer", to=data["gameId"], include_self=False)

# @socketio.on("draw-response")
# def on_draw_response(data):
#     emit("draw-response", {"accepted": data["accepted"]}, to=data["gameId"], include_self=False)

@socketio.on("draw-response")
def on_draw_response(data):
    game_id = data.get("gameId")
    accepted = data.get("accepted")
    if accepted and game_id in games:
        for pid in games[game_id]["players"]:
            if pid in users:
                users[pid]["status"] = "available"
        emit("draw-response", {"accepted": True}, to=game_id)
        broadcast_user_list()
    else:
        emit("draw-response", {"accepted": False}, to=game_id)

@socketio.on("leave-game")
def on_leave_game():
    if request.sid in users:
        users[request.sid]["status"] = "available"
    broadcast_user_list()

if __name__ == "__main__":
    socketio.run(app, port=3001, debug=True)