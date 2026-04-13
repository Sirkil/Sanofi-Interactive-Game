const socket = io();

// Get the team number from the URL, default to 1 if missing
const urlParams = new URLSearchParams(window.location.search);
const teamId = urlParams.get('team') || 1;

// Tell server we want updates for this specific team
socket.emit('requestTeamData', teamId);

// Generate QR Code dynamically pointing to the mobile site for THIS team
const mobileUrl = window.location.origin + `/mobile.html?team=${teamId}`;
document.getElementById('qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mobileUrl)}`;

socket.on('gameStateUpdate', (teamState) => {
    const container = document.getElementById('words-container');
    container.innerHTML = ''; 

    // Render the 4 words for this team
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

    // Handle Opacity for "UNITED FOR IMPACT" (4 words = 25% increments)
    const glowText = document.getElementById('impact-glow');
    let opacity = 0;
    if (teamState.completed === 1) opacity = 0.25;
    if (teamState.completed === 2) opacity = 0.50;
    if (teamState.completed === 3) opacity = 0.75;
    if (teamState.completed === 4) opacity = 1.0;
    
    glowText.style.opacity = opacity;
});