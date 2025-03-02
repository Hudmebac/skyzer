const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle a basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Store rooms and users
const rooms = {};

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Join a room
    socket.on('joinRoom', ({ roomCode, userName }) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = [];
        }
        rooms[roomCode].push(userName);
        socket.join(roomCode);
        io.to(roomCode).emit('roomUsers', rooms[roomCode]);
        console.log(`${userName} joined room ${roomCode}`);
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

    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Remove user from rooms
        for (const roomCode in rooms) {
            rooms[roomCode] = rooms[roomCode].filter(user => user !== socket.id);
            io.to(roomCode).emit('roomUsers', rooms[roomCode]);
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 