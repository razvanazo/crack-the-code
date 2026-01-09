const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui")
const io = new Server();

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
    const roomId = socket.currentRoom;
    const playerId = socket.playerId;

    if (!roomId || !games[roomId]) {
        socket.leave(roomId);
        return;
    }

    const room = games[roomId];

    if (room.players && room.players[playerId]) {
        delete room.players[playerId];
    }

    // If no players are left, delete the room entirely
    if (!room.players || Object.keys(room.players).length === 0) {
        delete games[roomId];
    } else {
        room.started = false;
        socket.to(roomId).emit('opponent-leaved');
    }

    socket.leave(roomId);
}

const clearGameCodes = (socket) => {
    games[socket.currentRoom].started = false;
    Object.values(games[socket.currentRoom].players).map(player => {
        delete player.gameCode;
    })
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
    socket.playerId = playerId;

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
                    players: {},
                    started: false,
                }
            }

            games[user.room].players[playerId] = {
                username: user.name,
                icon: user.icon,
                currentRoom: user.room,
            };
        }
    })

    socket.on("set-code", function (code) {
        socket.gameCode = code;
        games[socket.currentRoom].players[playerId].code = code;

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
                games[socket.currentRoom].started = true;
            }
        }

        if (Object.keys(games[socket.currentRoom].players).length === 2) {
            io.to(socket.currentRoom).emit("game-start", true);
            playerStarts(socket);
        }
    })

    socket.on('guess-code', function (code, response) {
        let correctDigits = 0,
            codeAsArray = String(code).split(''),
            opponentId = Object.keys(games[socket.currentRoom].players).find(id => id !== socket.playerId),
            res = games[socket.currentRoom].players[opponentId].code,
            resArray = res.split('');

        if (res === String(code)) {
            response({correctDigits: res.length, value:true});
            socket.to(socket.currentRoom).emit('opponent-win');
            clearGameCodes(socket);
        } else {
            for (let i = 0; i < 4; i++) {
                if (codeAsArray[i] === resArray[i]) {
                    correctDigits++;
                }
            }

            response({correctDigits: correctDigits, value:false});
            socket.to(socket.currentRoom).emit('opponent-guess', code)
        }
    })

    socket.on('leave-room', function () {
       leaveRoom(socket)
    })

    socket.on('sendMessage', function (message) {
        socket.to(socket.currentRoom).emit("newMessage", message);
    })

    socket.on('rejoin', function (room, cb) {
        let game = games[room];
        let player = game?.players?.[socket.playerId]

        if (player) {
            socket.join(room);
            cb(true);

            socket.username = player.username;
            socket.currentRoom = room;
            socket.icon = player.icon;

            if (game.started) {
                socket.gameCode = player.gameCode;
                socket.emit('reenter')
            }
        }

        cb(false);
    })
})

instrument(io, {auth: false});
