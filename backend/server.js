const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui")
const io = new Server();

const waitingList = {};
const games = {};

io.attach(3001, {
    path: "/io",
    cors: {
        origin: ["http://localhost:8080", "http://frontend", "http://nginx",  "https://admin.socket.io"],
        credentials: true,
    },
    cookie: false,
});

const leaveRoom = (socket) => {
    socket.to(socket.currentRoom).emit("opponent-leaved");
    socket.leave(socket.currentRoom);
    delete socket.currentRoom;
}

const getRoom = (room) => {
    return io.sockets.adapter.rooms.get(room);
}

const playerStarts = (socket) => {
    const players = [...io.sockets.adapter.rooms.get(socket.currentRoom) || []];
    const randomPlayerId = players[Math.floor(Math.random() * players.length)];
    io.to(socket.currentRoom).emit("player-starts", randomPlayerId);
}

io.sockets.on("connection", function (socket) {
    const { playerId } = socket.handshake.auth;

    socket.on("join-room", function (user, cb) {
        const room = getRoom(user.room);

        if (room && room.size > 1) {
            cb(false)
        } else {
            socket.join(user.room);
            socket.username = user.name;
            socket.icon = user.icon; // Store the icon
            socket.currentRoom = user.room;
            cb(true);

            if (games[user.room] === undefined) {
                games[user.room] = {
                    players: [],
                    started: false,
                }
            }

            games[user.room].players.push(playerId);
        }
    })

    socket.on("set-code", function (code) {
        socket.gameCode = code;

        const roomSockets = io.sockets.adapter.rooms.get(socket.currentRoom);
        if (roomSockets && roomSockets.size === 2) {
             const opponentSocketId = Array.from(roomSockets).find(id => id !== socket.id);
             if (opponentSocketId) {
                const opponentSocket = io.sockets.sockets.get(opponentSocketId);
                // Send my data to the opponent
                 socket.to(opponentSocketId).emit('opponent-joined', {
                    name: socket.username,
                    icon: socket.icon
                });
                // Send opponent's data to me
                socket.emit('opponent-joined', {
                    name: opponentSocket.username,
                    icon: opponentSocket.icon
                });
            }
        }


        if (waitingList[socket.currentRoom] === undefined) {
            waitingList[socket.currentRoom] = playerId;
        } else {
            delete waitingList[socket.currentRoom];
            io.to(socket.currentRoom).emit("game-start", true);
            playerStarts(socket);
        }
    })

    socket.on('guess-code', function (code) {
        socket.to(socket.currentRoom).emit("validate-code", code);
    })

    socket.on('code-valid', () => {
        socket.to(socket.currentRoom).emit("correct-code", true);
    })

    socket.on('wrong', function (code, message) {
        socket.to(socket.currentRoom).emit("wrong-code", code, message);
    })

    socket.on('leave-room', function () {
       leaveRoom(socket)
    })

    socket.on('disconnect', function () {
        leaveRoom(socket)
    })
})

instrument(io, {auth: false});
