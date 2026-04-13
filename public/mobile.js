const socket = io();

// Get the team number from the URL that was scanned via QR
const urlParams = new URLSearchParams(window.location.search);
const teamId = urlParams.get('team') || 1;

let myWordId = null;

// Request data for this specific team
socket.emit('requestTeamData', teamId);

const selectionPhase = document.getElementById('selection-phase');
const gameplayPhase = document.getElementById('gameplay-phase');
const wordGrid = document.getElementById('word-grid');
const keypad = document.getElementById('keypad');

// Build A-Z Keypad
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
alphabet.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'key';
    btn.id = `key-${letter}`;
    btn.innerText = letter;
    btn.onclick = () => guessLetter(letter);
    keypad.appendChild(btn);
});

// Populate the 2x2 Grid with the 4 words
socket.on('gameStateUpdate', (teamState) => {
    if (myWordId !== null) return; 

    wordGrid.innerHTML = '';
    teamState.words.forEach(wordObj => {
        const btn = document.createElement('button');
        btn.className = 'word-btn';
        
        // Show placeholders like "Word 1 (4 Letters)" so they know what they are clicking
        btn.innerText = `Word ${wordObj.id}\n(${wordObj.text.length} Ltrs)`; 
        
        if (wordObj.claimed) {
            btn.disabled = true;
            btn.innerText = 'Claimed\nby Teammate';
        } else {
            btn.onclick = () => socket.emit('claimWord', { teamId, wordId: wordObj.id });
        }
        wordGrid.appendChild(btn);
    });
});

socket.on('wordClaimedSuccess', (wordObj) => {
    myWordId = wordObj.id;
    selectionPhase.style.display = 'none';
    gameplayPhase.style.display = 'block';
    document.getElementById('my-word-title').innerText = `Spelling Word ${wordObj.id}`;
});

function guessLetter(letter) {
    socket.emit('guessLetter', { teamId, wordId: myWordId, letter });
}

socket.on('guessResult', (result) => {
    const btn = document.getElementById(`key-${result.letter}`);
    if (result.success) {
        // Show centered purple letter overlay
        const overlay = document.getElementById('success-overlay');
        document.getElementById('giant-letter').innerText = result.letter;
        overlay.classList.add('show');
        setTimeout(() => overlay.classList.remove('show'), 1500);
        
        btn.disabled = true; 
        btn.style.opacity = '1';
        btn.style.borderColor = '#a855f7';
        btn.style.color = '#a855f7';
    } else {
        // Show toast and disable at 50% opacity
        showToast(`Letter ${result.letter} is not in the word!`);
        btn.disabled = true; 
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}