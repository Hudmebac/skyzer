const socket = io();

// Join a room
const joinButton = document.querySelector('button');
const roomInput = document.querySelector('input[type="text"]');
const userName = `User${Math.floor(Math.random() * 1000)}`; // Random user name for demo

// Feedback elements
const feedback = document.createElement('div');
feedback.id = 'feedback';
document.body.appendChild(feedback);

// Show feedback
function showFeedback(message, type = 'info') {
    feedback.textContent = message;
    feedback.className = type;
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
    }, 3000);
}

// Correct button selection
const joinRoomButton = document.getElementById('joinRoomButton');
const createRoomButton = document.getElementById('createRoomButton');

// Join a room with feedback
joinRoomButton.addEventListener('click', () => {
    const roomCode = roomInput.value;
    if (roomCode) {
        socket.emit('joinRoom', { roomCode, userName });
        showFeedback(`Joined room: ${roomCode}`, 'success');
    } else {
        showFeedback('Please enter a room code', 'error');
    }
});

// Listen for room users update
socket.on('roomUsers', (users) => {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        userList.appendChild(li);
    });
});

// Select a card with feedback
const cardsContainer = document.querySelector('.cards');
cardsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('card')) {
        const cardValue = event.target.textContent;
        const roomCode = roomInput.value;
        if (roomCode) {
            socket.emit('selectCard', { roomCode, cardValue });
            showFeedback(`Selected card: ${cardValue}`, 'success');
        } else {
            showFeedback('Join a room first', 'error');
        }
    }
});

// Listen for card selection
socket.on('cardSelected', ({ userName, cardValue }) => {
    const selectionList = document.getElementById('selectionList');
    const li = document.createElement('li');
    li.textContent = `${userName} selected card ${cardValue}`;
    selectionList.appendChild(li);
});

// Generate poker cards
const cardValues = ['1', '2', '3', '5', '8', '13', '21', '?'];
cardValues.forEach(value => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = value;
    cardsContainer.appendChild(card);
});

// Display and copy room ID
const roomIdDisplay = document.getElementById('roomIdDisplay');
const roomInfoSection = document.getElementById('roomInfo');
const copyRoomIdButton = document.getElementById('copyRoomIdButton');

// Create a room with feedback
createRoomButton.addEventListener('click', () => {
    const roomCode = `room-${Math.random().toString(36).substr(2, 9)}`; // Generate a unique room code
    socket.emit('createRoom', { roomCode, userName });
    socket.once('roomCreated', () => {
        showFeedback(`Created room: ${roomCode}`, 'success');
        roomInput.value = roomCode; // Automatically fill the room code input
        roomIdDisplay.textContent = roomCode;
        roomInfoSection.style.display = 'block';
    });
    socket.once('error', (message) => {
        showFeedback(message, 'error');
    });
});

copyRoomIdButton.addEventListener('click', () => {
    navigator.clipboard.writeText(roomIdDisplay.textContent).then(() => {
        showFeedback('Room ID copied to clipboard', 'success');
    }).catch(err => {
        showFeedback('Failed to copy Room ID', 'error');
    });
}); 