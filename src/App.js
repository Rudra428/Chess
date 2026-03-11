import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import ChessBoard from "./ChessBoard";
import { playSound } from "./Sounds";
import socket from "./socket";
import "./App.css";

function App() {
  const [view, setView] = useState("login");
  const [username, setUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [pendingChallenge, setPendingChallenge] = useState(null);

  const [gameId, setGameId] = useState(null);
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState("");

  const [isDrawOffered, setIsDrawOffered] = useState(false);

  useEffect(() => {
    if (view === "login") return;
    const handle = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handle);
    return () => {
      window.removeEventListener("beforeunload", handle);
    };
  }, [view]);

  useEffect(() => {
    socket.on("user-list", (users) => {
      setOnlineUsers(users.filter(u => u.id !== socket.id));
    });

    socket.on("receive-challenge", ({ challengerId, challengerName }) => {
      setIncomingChallenge({ id: challengerId, name: challengerName });
    });

    socket.on("challenge-rejected", () => {
      setPendingChallenge(null);
      alert("Challenge rejected.");
    });

    socket.on("game-start", ({ gameId, color }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setGame(new Chess());
      setGameOver(false);
      setResult("");
      setIncomingChallenge(null);
      setPendingChallenge(null);
      setIsDrawOffered(false);
      setView("game");
      socket.emit("join-game-room", gameId);
    });

    return () => {
      socket.off("user-list");
      socket.off("receive-challenge");
      socket.off("challenge-rejected");
      socket.off("game-start");
    };
  }, []);

  useEffect(() => {
    if (view !== "game") return;

    socket.on("state", (fen) => {
      setGame(new Chess(fen));
    });

    socket.on("opponent-resigned", () => {
      setGameOver(true);
      setResult("You win! Opponent resigned.");
    });

    socket.on("opponent-disconnected", () => {
      setGameOver(true);
      setResult("You win! Opponent disconnected.");
    });

    socket.on("draw-offer", () => {
      setIsDrawOffered(true);
    });

    socket.on("draw-response", ({ accepted }) => {
      if (accepted) {
        setGameOver(true);
        setResult("Game drawn by agreement.");
      } else {
        alert("Opponent rejected your draw offer.");
      }
    });

    return () => {
      socket.off("state");
      socket.off("opponent-resigned");
      socket.off("opponent-disconnected");
      socket.off("draw-offer");
      socket.off("draw-response");
    };
  }, [view]);

  useEffect(() => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        setGameOver(true);
        setResult(game.turn() === playerColor ? "You lost!!" : "You won!!");
        playSound("checkmate");
      } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
        setGameOver(true);
        setResult("Game drawn.");
      }
    }
  }, [game, playerColor]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit("login", username);
      socket.emit("get-users")
      setView("lobby");
    }
  };

  const sendChallenge = (targetId) => {
    setPendingChallenge(targetId);
    socket.emit("send-challenge", { targetId });
  };

  const respondToChallenge = (accepted) => {
    if (incomingChallenge) {
      socket.emit("respond-challenge", { challengerId: incomingChallenge.id, accepted });
      setIncomingChallenge(null);
    }
  };

  const handleMove = (from, to) => {
    if (gameOver || game.turn() !== playerColor) return false;
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from, to, promotion: "q" });
      if (!move) return false;

      if (gameCopy.isCheck()) playSound("check");
      else if (move.captured) playSound("capture");
      else playSound("move");

      setGame(gameCopy);
      socket.emit("move", { gameId, fen: gameCopy.fen() });
      return true;
    } catch (err) { return false; }
  };

  const leaveGame = () => {
    socket.emit("leave-game", { gameId });
    setGameId(null);
    setGameOver(false);
    setResult("");
    setView("lobby");
  };

  const handleResign = () => {
    socket.emit("resign", { gameId });
    setGameOver(true);
    setResult("You resigned.");
  };

  const handleOfferDraw = () => {
    socket.emit("draw-offer", { gameId });
    alert("Draw offer sent.");
  };

  const handleDrawResponse = (accepted) => {
    socket.emit("draw-response", { gameId, accepted });
    setIsDrawOffered(false);
    if (accepted) {
      setGameOver(true);
      setResult("Game drawn by agreement.");
    }
  };

  return (
    <div className="app">
      {view === "login" && (
        <div className="login-container">
          <h1>Chess</h1>
          <form onSubmit={handleLogin}>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter Name" required />
            <button type="submit">Join</button>
          </form>
        </div>
      )}

      {view === "lobby" && (
        <div className="lobby-container">
          <h1>Lobby</h1>
          <p>Logged in as: <strong>{username}</strong></p>
          <div className="user-list">
            <h3>Online Players</h3>
            <ul>
              {onlineUsers.map(user => (
                <li key={user.id} className="user-item">
                  <span>{user.name} {user.status === "playing" && <span className="status-badge busy">Busy</span>}</span>
                  {user.status === "available" && (
                    <button disabled={pendingChallenge !== null} onClick={() => sendChallenge(user.id)}>
                      {pendingChallenge === user.id ? "Waiting..." : "Challenge"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {incomingChallenge && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Challenge!</h3>
                <p><strong>{incomingChallenge.name}</strong> wants to play.</p>
                <div className="modal-buttons">
                  <button onClick={() => respondToChallenge(true)}>Accept</button>
                  <button className="reject" onClick={() => respondToChallenge(false)}>Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === "game" && (
        <div className="game-container">
          <div className="game-header">
            <h2>Room: {gameId}</h2>
          </div>

          <ChessBoard game={game} makeMove={handleMove} playerColor={playerColor} />

          {gameOver ? (
            <div className="game-over-container">
              <h2 className="result-text">{result}</h2>
              <button onClick={leaveGame} className="exit-btn">Exit to Lobby</button>
            </div>
          ) : (
            <div className="controls">
              <button onClick={handleOfferDraw} className="draw-btn">½ Offer Draw</button>
              <button onClick={handleResign} className="resign-btn">🏳 Resign</button>
            </div>
          )}

          {isDrawOffered && !gameOver && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Draw Offered</h3>
                <p>Your opponent has offered a draw.</p>
                <div className="modal-buttons">
                  <button onClick={() => handleDrawResponse(true)}>Accept</button>
                  <button className="reject" onClick={() => handleDrawResponse(false)}>Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;