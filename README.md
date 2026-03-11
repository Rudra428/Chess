# ♟️ ChessX

**ChessX** is a high-performance, real-time multiplayer chess platform. Built with a **React** frontend and a **Python/Flask** backend, it leverages **WebSockets** to provide a seamless, low-latency competitive experience.

## 🚀 Live Demo
**Frontend:** https://chess-henna-kappa.vercel.app/  
**Backend API:** [Insert your Render Link]

---

## 📸 Preview
![ChessX Gameplay](https://via.placeholder.com/800x400?text=Insert+Screenshot+of+your+Lobby+or+Game+here)

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

### 1. Clone the repository
```bash
git clone [https://github.com/Rudra428/Chess.git](https://github.com/Rudra428/Chess.git)
cd Chess
```

### 2. Setup the Backend (Terminal 1)
```bash
cd chess_server
pip install -r requirements.txt
python server.py
```

### 3. Setup the Frontend (Terminal 2)
```bash
npm install
npm start
```

---

## 🧠 Technical Challenges & Solutions
* **State Synchronization:** Solved an edge case where players remained "Busy" after a game ended by implementing a global `broadcast_user_list` triggered by checkmate, resignation, and draw events.
* **Deployment & CORS:** Configured specific CORS headers in Flask to allow secure communication between the Vercel-hosted frontend and Render-hosted backend.
* **Cold Start Handling:** Implemented a custom connection-retry logic in the frontend to handle Render's free-tier "spinning up" delay.

---

## 🤝 Contributing
Feel free to fork this project, open issues, or submit pull requests!
