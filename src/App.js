import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Use environment variable for the server URL
const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');

function App() {
    const [room, setRoom] = useState('');
    const [vote, setVote] = useState('');
    const [votes, setVotes] = useState([]);

    useEffect(() => {
        socket.on('roomData', (data) => {
            setVotes(data);
        });

        return () => {
            socket.off('roomData');
        };
    }, []);

    const joinRoom = () => {
        socket.emit('joinRoom', room);
    };

    const submitVote = () => {
        socket.emit('vote', { room, vote });
        setVote('');
    };

    return (
        <div>
            <h1>Story Point Voting</h1>
            <input
                type="text"
                placeholder="Room Name"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={joinRoom}>Join Room</button>
            <input
                type="text"
                placeholder="Your Vote"
                value={vote}
                onChange={(e) => setVote(e.target.value)}
            />
            <button onClick={submitVote}>Vote</button>
            <h2>Votes:</h2>
            <ul>
                {votes.map((v, index) => (
                    <li key={index}>{v}</li>
                ))}
            </ul>
        </div>
    );
}

export default App; 