const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};

app.use(express.static(path.join(__dirname, 'client')));

app.get('/test', (req, res) => {
    res.send('<h1>RPS app is running..</h1>');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    socket.on('createGame', () => {
        const roomUniqueId = makeid(6);
        rooms[roomUniqueId] = { players: [socket.id] };
        socket.join(roomUniqueId);
        socket.emit("newGame", { roomUniqueId });
        console.log(`Room created: ${roomUniqueId}`);
    });

    socket.on('joinGame', (data) => {
        const { roomUniqueId } = data;

        if (rooms[roomUniqueId]) {
            rooms[roomUniqueId].players.push(socket.id);
            socket.join(roomUniqueId);
            io.to(roomUniqueId).emit("playersConnected", { roomUniqueId });
            console.log(`User joined room: ${roomUniqueId}`);
        } else {
            socket.emit("errorMsg", { message: "Room does not exist!" });
        }
    });

    socket.on("p1Choice", (data) => {
        let rpsValue = data.rpsValue;
        rooms[data.roomUniqueId].p1Choice = rpsValue;
        socket.to(data.roomUniqueId).emit("p1Choice", { rpsValue: data.rpsValue });
        if (rooms[data.roomUniqueId].p2Choice != null) {
            declareWinner(data.roomUniqueId);
        }
    });

    socket.on("p2Choice", (data) => {
        let rpsValue = data.rpsValue;
        rooms[data.roomUniqueId].p2Choice = rpsValue;
        socket.to(data.roomUniqueId).emit("p2Choice", { rpsValue: data.rpsValue });
        if (rooms[data.roomUniqueId].p1Choice != null) {
            declareWinner(data.roomUniqueId);
        }
    });
});

function declareWinner(roomUniqueId) {
    let p1Choice = rooms[roomUniqueId].p1Choice;
    let p2Choice = rooms[roomUniqueId].p2Choice;
    let winner = null;
    if (p1Choice === p2Choice) {
        winner = "d";
    } else if (p1Choice == "Paper") {
        if (p2Choice == "Scissor") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    } else if (p1Choice == "Rock") {
        if (p2Choice == "Paper") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    } else if (p1Choice == "Scissor") {
        if (p2Choice == "Rock") {
            winner = "p2";
        } else {
            winner = "p1";
        }
    }
    io.sockets.to(roomUniqueId).emit("result", {
        winner: winner
    });
    rooms[roomUniqueId].p1Choice = null;
    rooms[roomUniqueId].p2Choice = null;
}

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

