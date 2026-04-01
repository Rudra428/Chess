import { io } from "socket.io-client";


const SERVER_URL = "https://chess-backend-eg1b.onrender.com";
// const SERVER_URL = "http://localhost:3001";

const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;