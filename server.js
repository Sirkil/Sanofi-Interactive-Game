const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// New Game State: 7 Color-Coded Questions
let gameState = {
    red:    { q: "What is the word equivalent to speed?", a: "FAST", claimedSlots: [], guessedLetters: [] },
    orange: { q: "What do you call a group of wolves?", a: "PACK", claimedSlots: [], guessedLetters: [] },
    yellow: { q: "What is the center of our solar system?", a: "STAR", claimedSlots: [], guessedLetters: [] },
    green:  { q: "What do plants grow from?", a: "SEED", claimedSlots: [], guessedLetters: [] },
    blue:   { q: "What covers 70% of the Earth?", a: "WATER", claimedSlots: [], guessedLetters: [] },
    indigo: { q: "What is the color of a clear night sky?", a: "DARK", claimedSlots: [], guessedLetters: [] },
    violet: { q: "What is a fragrant purple flower?", a: "LILAC", claimedSlots: [], guessedLetters: [] }
};

io.on('connection', (socket) => {
    
    // Send full state to anyone who connects
    socket.emit('gameStateUpdate', gameState);

    // Player selects a color and a team number (1-4)
    socket.on('claimSlot', ({ color, teamNumber }) => {
        let questionData = gameState[color];
        if (!questionData) return;
        
        // Prevent multiple people from picking the same Team # under the same color
        if (!questionData.claimedSlots.includes(teamNumber)) {
            questionData.claimedSlots.push(teamNumber);
            io.emit('gameStateUpdate', gameState); 
            socket.emit('slotClaimedSuccess', { color, teamNumber, word: questionData.a }); 
        }
    });

    // Player guesses a letter
    socket.on('guessLetter', ({ color, letter }) => {
        let questionData = gameState[color];
        if (!questionData) return;

        if (questionData.a.includes(letter)) {
            if (!questionData.guessedLetters.includes(letter)) {
                questionData.guessedLetters.push(letter);
            }
            io.emit('gameStateUpdate', gameState);
            socket.emit('guessResult', { success: true, letter: letter, color: color });
        } else {
            socket.emit('guessResult', { success: false, letter: letter });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));