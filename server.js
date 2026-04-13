const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const createWord = (id, text) => ({ id, text, claimed: false, guessedLetters: [] });

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
    
    // Send state directly, no more rooms (solves the dropping issue)
    socket.on('requestTeamData', (teamId) => {
        socket.emit('gameStateUpdate', { teamId: teamId, state: gameData[teamId] });
    });

    socket.on('claimWord', ({ teamId, wordId }) => {
        let team = gameData[teamId];
        if (!team) return;
        
        let wordObj = team.words.find(w => w.id === wordId);
        if (wordObj && !wordObj.claimed) {
            wordObj.claimed = true;
            // Broadcast to EVERYONE, frontends will filter by teamId
            io.emit('gameStateUpdate', { teamId: teamId, state: team }); 
            socket.emit('wordClaimedSuccess', wordObj); 
        }
    });

    socket.on('guessLetter', ({ teamId, wordId, letter }) => {
        let team = gameData[teamId];
        if (!team) return;

        let wordObj = team.words.find(w => w.id === wordId);
        if (!wordObj) return;

        if (wordObj.text.includes(letter)) {
            if (!wordObj.guessedLetters.includes(letter)) {
                wordObj.guessedLetters.push(letter);
            }
            
            team.completed = team.words.filter(w => 
                w.text.split('').every(l => w.guessedLetters.includes(l))
            ).length;
            
            io.emit('gameStateUpdate', { teamId: teamId, state: team });
            socket.emit('guessResult', { success: true, letter: letter });
        } else {
            socket.emit('guessResult', { success: false, letter: letter });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));