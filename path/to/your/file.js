function joinRoom(roomId, userId) {
    // existing code...
    
    // Add user to the room
    if (!rooms[roomId]) {
        createRoom(roomId); // Ensure room is created
    }
    if (!rooms[roomId].users.includes(userId)) {
        rooms[roomId].users.push(userId); // Add the user to the room
    }

    // existing code...
}

function createRoom(roomId) {
    // existing code...
    
    // Ensure room is initialized
    if (!rooms[roomId]) {
        rooms[roomId] = {
            users: [],
            votes: {},
            // other necessary state...
        };
    }

    // existing code...
}

function submitVote(roomId, userId, vote) {
    // existing code...

    if (!rooms[roomId]) {
        throw new Error("Room does not exist");
    }
    if (!rooms[roomId].users.includes(userId)) {
        throw new Error("User not in room");
    }

    rooms[roomId].votes[userId] = vote; // Store the user's vote

    // Check if all users have voted
    if (Object.keys(rooms[roomId].votes).length === rooms[roomId].users.length) {
        // All votes are in, process the votes
        processVotes(roomId);
    }

    // existing code...
}

function processVotes(roomId) {
    // Logic to process votes, e.g., calculate average, display results, etc.
    const votes = Object.values(rooms[roomId].votes);
    const averageVote = calculateAverage(votes);
    // Notify users of the results
    notifyUsersOfResults(roomId, averageVote);
}

function calculateAverage(votes) {
    const total = votes.reduce((acc, vote) => acc + vote, 0);
    return total / votes.length;
}

function notifyUsersOfResults(roomId, averageVote) {
    // Logic to notify users about the results
    // This could involve sending a message to all users in the room
} 