♟️ ChessX
ChessX is a high-performance, real-time multiplayer chess platform. Built with a React frontend and a Python/Flask backend, it leverages WebSockets to provide a seamless, low-latency competitive experience.

🚀 Live Demo
Frontend: [Your Vercel Link Here]

Backend API: [Your Render Link Here]

✨ Features
Real-Time Matchmaking: A dynamic lobby system that tracks online users and their availability (Available/Busy).

Live Gameplay: Sub-200ms move synchronization using Socket.IO.

Move Validation: Full implementation of chess rules (checkmate, stalemate, castling, and draws) powered by chess.js.

Responsive UI: Mobile-friendly chessboard designed with React and CSS3.

Interactive Notifications: Sound effects for moves, captures, and checkmates to enhance user experience.

🛠️ Tech Stack
Frontend
React.js: Functional components and Hooks (useState, useEffect).

Socket.io-client: Real-time bidirectional event handling.

Chess.js: Move validation and game state management.

Vercel: Optimized frontend hosting.

Backend
Python / Flask: Lightweight and scalable server architecture.

Flask-SocketIO: WebSocket integration for Python.

Gevent / Gunicorn: Production-grade WSGI server for high concurrency.

Render: Managed cloud hosting for the Python backend.

⚙️ Local Setup
Clone the repository:

Bash
git clone https://github.com/Rudra428/Chess.git
cd Chess
Setup the Backend:

Bash
cd chess_server
pip install -r requirements.txt
python server.py
Setup the Frontend:

Bash
# Open a new terminal
npm install
npm start
📝 Key Achievements
Optimized Concurrency: Successfully transitioned the backend from Node.js to a specialized Python/Gevent environment to handle real-time event loops efficiently.

State Synchronization: Solved the "Always Busy" edge case by implementing a global state broadcast system that resets player status upon resignation, checkmate, or disconnection.

Production Hardening: Configured environment-specific variables and CORS policies to allow secure communication between separate hosting providers (Vercel & Render).
