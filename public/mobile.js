const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const teamId = urlParams.get('team') || 1;

let myWordId = null;

socket.emit('requestTeamData', teamId);

const selectionPhase = document.getElementById('selection-phase');
const gameplayPhase = document.getElementById('gameplay-phase');
const wordGrid = document.getElementById('word-grid');
const keypad = document.getElementById('keypad');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
alphabet.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'key';
    btn.id = `key-${letter}`;
    btn.innerText = letter;
    btn.onclick = () => guessLetter(letter);
    keypad.appendChild(btn);
});

socket.on('gameStateUpdate', (data) => {
    if (data.teamId != teamId || myWordId !== null) return; 

    const teamState = data.state;
    wordGrid.innerHTML = '';
    
    teamState.words.forEach(wordObj => {
        const btn = document.createElement('button');
        btn.className = 'word-btn';
        
        // Show the ACTUAL word instead of "Word 1"
        btn.innerText = wordObj.text; 
        
        if (wordObj.claimed) {
            btn.disabled = true;
            btn.innerText = 'Claimed';
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
    document.getElementById('my-word-title').innerText = `Your Word: ${wordObj.text}`;
});

function guessLetter(letter) {
    socket.emit('guessLetter', { teamId, wordId: myWordId, letter });
}

socket.on('guessResult', (result) => {
    const btn = document.getElementById(`key-${result.letter}`);
    
    if (result.success) {
        // Show the white screen with the giant letter
        const overlay = document.getElementById('success-overlay');
        document.getElementById('giant-letter').innerText = result.letter;
        overlay.classList.add('show');
        
        // WE DO NOT REMOVE THE OVERLAY. 
        // This acts as the "lock" so they can only guess one letter!
    } else {
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