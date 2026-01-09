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
    auth: { playerId },
    timeout: 60000,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
});

socket.on("connect", () => {
    if(router.currentRoute.value.path === '/game') {
        const room = sessionStorage.getItem("room") || null;
        console.log(room)

        if (room) {
            socket.emit('rejoin', room, (response) => {
                console.log(response)
                if (!response) {
                    router.push("/");
                }
            });
        }
    }
})

export default socket;
