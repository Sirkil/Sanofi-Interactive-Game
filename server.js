const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Helper to generate a word object
const createWord = (id, text) => ({ id, text, claimed: false, guessedLetters: [] });

// Game State for all 7 Teams
let gameData = {
    1: { completed: 0, words: [createWord(1, 'TEAM'), createWord(2, 'WORK'), createWord(3, 'HELP'), createWord(4, 'GROW')] },
    2: { completed: 0, words: [createWord(1, 'SMART'), createWord(2, 'IDEAS'), createWord(3, 'DRIVE'), createWord(4, 'VALUE')] },
    3: { completed: 0, words: [createWord(1, 'CLEAR'), createWord(2, 'GOALS'), createWord(3, 'BRING'), createWord(4, 'FOCUS')] },
    4: { completed: 0, words: [createWord(1, 'UNITE'), createWord(2, 'MINDS'), createWord(3, 'REACH'), createWord(4, 'PEAKS')] },
    5: { completed: 0, words: [createWord(1, 'BRAVE'), createWord(2, 'MOVES'), createWord(3, 'SPARK'), createWord(4, 'SHIFT')] },
    6: { completed: 0, words: [createWord(1, 'SOLID'), createWord(2, 'TEAMS'), createWord(3, 'SHARE'), createWord(4, 'WINS')] },
    7: { completed: 0, words: [createWord(1, 'GREAT'), createWord(2, 'LEADS'), createWord(3, 'BRING'), createWord(4, 'PRIDE')] }
};

io.on('connection', (socket) => {
    
    // Client asks for their specific team's data
    socket.on('requestTeamData', (teamId) => {
        socket.join(`team_${teamId}`); // Put them in a room for this team
        socket.emit('gameStateUpdate', gameData[teamId]);
    });

    socket.on('claimWord', ({ teamId, wordId }) => {
        let team = gameData[teamId];
        if (!team) return;
        
        let wordObj = team.words.find(w => w.id === wordId);
        if (wordObj && !wordObj.claimed) {
            wordObj.claimed = true;
            io.to(`team_${teamId}`).emit('gameStateUpdate', team); 
            socket.emit('wordClaimedSuccess', wordObj); 
        }
    });

    socket.on('guessLetter', ({ teamId, wordId, letter }) => {
        let team = gameData[teamId];
        if (!team) return;

        let wordObj = team.words.find(w => w.id === wordId);
        if (!wordObj) return;

        if (wordObj.text.includes(letter)) {
            // Correct Guess
            if (!wordObj.guessedLetters.includes(letter)) {
                wordObj.guessedLetters.push(letter);
            }
            
            // Check if this specific word is finished
            let isWordComplete = wordObj.text.split('').every(l => wordObj.guessedLetters.includes(l));
            
            // Recalculate completed words for opacity (0 to 4)
            team.completed = team.words.filter(w => 
                w.text.split('').every(l => w.guessedLetters.includes(l))
            ).length;
            
            io.to(`team_${teamId}`).emit('gameStateUpdate', team);
            socket.emit('guessResult', { success: true, letter: letter });
        } else {
            // Incorrect Guess
            socket.emit('guessResult', { success: false, letter: letter });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));