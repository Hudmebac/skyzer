const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle a basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Store rooms and users
let rooms = {};

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Join a room
    socket.on('joinRoom', (room) => {
        socket.join(room);
        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(socket.id);
        io.to(room).emit('roomData', rooms[room]);
    });

    // Handle card selection
    socket.on('selectCard', ({ roomCode, cardValue }) => {
        io.to(roomCode).emit('cardSelected', { userName: socket.id, cardValue });
    });

    // Handle room creation
    socket.on('createRoom', ({ roomCode, userName }) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
            rooms[roomCode].push(userName);
            socket.join(roomCode);
            io.to(roomCode).emit('roomUsers', rooms[roomCode]);
            socket.emit('roomCreated');
            console.log(`Room created: ${roomCode} by ${userName}`);
        } else {
            socket.emit('error', 'Room code already exists. Please try again.');
        }
    });

    // Handle vote
    socket.on('vote', ({ room, vote }) => {
        rooms[room].push(vote);
        io.to(room).emit('roomData', rooms[room]);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Remove user from rooms
        for (const roomCode in rooms) {
            rooms[roomCode] = rooms[roomCode].filter(user => user !== socket.id);
            io.to(roomCode).emit('roomUsers', rooms[roomCode]);
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 