import { io } from "socket.io-client";

const socket = io("https://chess-backend-eg1b.onrender.com", {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
