# ♟️ ChessX

**ChessX** is a high-performance, real-time multiplayer chess platform. Built with a **React** frontend and a **Python/Flask** backend, it leverages **WebSockets** to provide a seamless, low-latency competitive experience.

## 🚀 Live Demo
**Frontend:** [Insert your Vercel Link]  
**Backend API:** [Insert your Render Link]

---

## ✨ Features
* **Real-Time Matchmaking:** A dynamic lobby system tracking online users and availability (Available/Busy).
* **Live Gameplay:** Sub-200ms move synchronization using **Socket.IO**.
* **Move Validation:** Full implementation of chess rules (checkmate, stalemate, castling) powered by **chess.js**.
* **Responsive UI:** Mobile-friendly chessboard designed with **React** and **CSS3**.
* **Interactive Notifications:** Custom sound effects for moves, captures, and checkmates.

---

## 🛠️ Tech Stack

### Frontend
* **React.js**: Functional components and Hooks (`useState`, `useEffect`).
* **Socket.io-client**: Real-time bidirectional event handling.
* **Chess.js**: Engine for move validation and FEN state management.
* **Vercel**: Optimized frontend hosting and CI/CD.

### Backend
* **Python / Flask**: Lightweight and scalable server architecture.
* **Flask-SocketIO**: WebSocket integration for Python.
* **Gevent / Gunicorn**: Production-grade WSGI server for high concurrency.
* **Render**: Managed cloud hosting for the Python backend.



---

## ⚙️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Rudra428/Chess.git](https://github.com/Rudra428/Chess.git)
   cd Chess
