import { io } from "socket.io-client";

const socket = io("https://chess-backend-eg1b.onrender.com", {
  transports: ["websocket", "polling"]
});

export default socket;
