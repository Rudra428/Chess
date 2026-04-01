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


  const [timers, setTimers] = useState({ w: 900, b: 900 });
  const [opponentName, setOpponentName] = useState("");

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

    socket.on("game-start", ({ gameId, color, opponentName }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setOpponentName(opponentName);
      setTimers({ w: 900, b: 900 });
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

    socket.on("state", ({ fen, times }) => {
      setGame(new Chess(fen));
      setTimers(times); // Sync clock with server after every move
    });


    socket.on("timeout-loss", ({ loserId }) => {
      setGameOver(true);
      if (socket.id === loserId) {
        setResult("Time's up! You lost.");
      } else {
        setResult("Opponent ran out of time. You won!");
      }
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
      socket.off("timeout-loss");
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


  useEffect(() => {
    if (view !== "game" || gameOver) return;

    const currentTurn = game.turn();
    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTime = prev[currentTurn] - 1;

        if (newTime <= 0) {
          clearInterval(interval);
          if (currentTurn === playerColor) {
            socket.emit("timeout", { gameId });
          }
          return { ...prev, [currentTurn]: 0 };
        }
        return { ...prev, [currentTurn]: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [view, gameOver, game.turn(), playerColor, gameId]);


  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

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

  const handleLogout = () => {
    socket.emit("logout");
    setUsername("");
    setOnlineUsers([]);
    setIncomingChallenge(null);
    setPendingChallenge(null);
    setView("login");
  };

  return (
    <div className="app">
      {view === "lobby" && (
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}
      {view === "login" && (
        <div className="login-container">
          <h1>Chess<span style={{ color: "red" }}>X</span></h1>
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
         
          <div className="game-layout">

            {/* Left Side: The Board */}
            <div className="board-column">
              <ChessBoard game={game} makeMove={handleMove} playerColor={playerColor} />
            </div>

            {/* Right Side: The Timers & Info */}
            <div className="info-column">
              {/* Opponent Info (Top Right) */}
              <div className="player-profile opponent-profile">
                <span className="player-name">{opponentName}</span>
                <span className="player-timer">{formatTime(timers[playerColor === "w" ? "b" : "w"])}</span>
              </div>

              {/* Your Info (Bottom Right) */}
              <div className="player-profile user-profile">
                <span className="player-name">{username}</span>
                <span className="player-timer">{formatTime(timers[playerColor])}</span>
              </div>
            </div>

          </div>

         {/* Controls - Only show if game is active */}
          {!gameOver && (
            <div className="controls">
              <button onClick={handleOfferDraw} className="draw-btn">½ Offer Draw</button>
              <button onClick={handleResign} className="resign-btn">🏳 Resign</button>
            </div>
          )}

          {/* Game Over Pop-up Modal */}
          {gameOver && (
            <div className="modal-overlay">
              <div className="modal" style={{ borderTop: "5px solid #00bbff", padding: "40px 30px" }}>
                <h2 className="result-text" style={{ marginBottom: "15px", fontSize: "2.5rem" }}>
                  Game Over
                </h2>
                <h3 style={{ color: "#f0f0f0", fontSize: "1.4rem", marginBottom: "30px", fontWeight: "normal" }}>
                  {result}
                </h3>
                <button onClick={leaveGame} className="exit-btn" style={{ width: "100%", padding: "15px" }}>
                  Return to Lobby
                </button>
              </div>
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