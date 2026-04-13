const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const currentTeamId = urlParams.get('team') || 1;

socket.emit('requestTeamData', currentTeamId);

const mobileUrl = window.location.origin + `/mobile.html?team=${currentTeamId}`;
document.getElementById('qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mobileUrl)}`;

// Listen for updates, ensuring it only processes updates for THIS screen's team
socket.on('gameStateUpdate', (data) => {
    if (data.teamId != currentTeamId) return; 
    
    const teamState = data.state;
    const container = document.getElementById('words-container');
    container.innerHTML = ''; 

    teamState.words.forEach(wordObj => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-display';
        
        wordObj.text.split('').forEach(letter => {
            const span = document.createElement('span');
            span.innerText = letter;
            span.className = 'letter-box';
            if (wordObj.guessedLetters.includes(letter)) {
                span.classList.add('guessed');
            }
            wordDiv.appendChild(span);
        });
        container.appendChild(wordDiv);
    });

    const glowText = document.getElementById('impact-glow');
    let opacity = 0;
    if (teamState.completed === 1) opacity = 0.25;
    if (teamState.completed === 2) opacity = 0.50;
    if (teamState.completed === 3) opacity = 0.75;
    if (teamState.completed === 4) opacity = 1.0;
    
    glowText.style.opacity = opacity;
});