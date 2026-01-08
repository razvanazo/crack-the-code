// src/socket.js
import { io } from "socket.io-client";
import router from "@/router/index.js";

let playerId = sessionStorage.getItem("playerId");

if (!playerId) {
    playerId = crypto.randomUUID();
    sessionStorage.setItem("playerId", playerId);
}

// Adaptează URL-ul la serverul tău:
const socket = io("/", {
    path: "/io" ,
    transports: ["websocket"],
    credentials: true,
    reconnection: true,
    auth: { playerId }
});

socket.on("connect", () => {
    if(router.currentRoute.value.path !== '/') {
        if (router.currentRoute.value.path === '/test') return;
        router.push("/");
    }
})

export default socket;
