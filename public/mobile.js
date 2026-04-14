const socket = io();

let myColor = null;
let myTeamNumber = null;

const colorPhase = document.getElementById('color-phase');
const teamPhase = document.getElementById('team-phase');
const gameplayPhase = document.getElementById('gameplay-phase');
const appContainer = document.getElementById('app-container');

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

// 1. Build Color Grid
const colorGrid = document.getElementById('color-grid');
colors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = `color-btn bg-${color}`;
    btn.innerText = color.toUpperCase();
    btn.onclick = () => selectColor(color);
    colorGrid.appendChild(btn);
});

function selectColor(color) {
    myColor = color;
    colorPhase.classList.remove('active');
    teamPhase.classList.add('active');
}

// 2. Build Team Grid (1 to 4) & Listen for updates to disable taken slots
socket.on('gameStateUpdate', (state) => {
    if (myColor && !myTeamNumber) {
        const teamGrid = document.getElementById('team-grid');
        teamGrid.innerHTML = '';
        const colorData = state[myColor];

        for (let i = 1; i <= 4; i++) {
            const btn = document.createElement('button');
            btn.className = 'word-btn';
            btn.innerText = `Team ${i}`;
            
            if (colorData.claimedSlots.includes(i)) {
                btn.disabled = true;
                btn.innerText = `Team ${i} (Taken)`;
            } else {
                btn.onclick = () => socket.emit('claimSlot', { color: myColor, teamNumber: i });
            }
            teamGrid.appendChild(btn);
        }
    }
});

// 3. Move to Carousel Phase
socket.on('slotClaimedSuccess', (data) => {
    myTeamNumber = data.teamNumber;
    teamPhase.classList.remove('active');
    gameplayPhase.classList.add('active');
    
    // Change background to match the selected color
    appContainer.className = `mobile-container bg-${myColor}`;

    // Build Alphabet Carousel
    const carousel = document.getElementById('carousel');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    alphabet.forEach(letter => {
        const card = document.createElement('div');
        card.className = 'carousel-card';
        card.id = `card-${letter}`;
        card.innerText = letter;
        card.onclick = () => socket.emit('guessLetter', { color: myColor, letter: letter });
        carousel.appendChild(card);
    });
});

// Handle Results
socket.on('guessResult', (result) => {
    if (!myColor) return;

    if (result.success) {
        // Show white screen with letter
        const overlay = document.getElementById('success-overlay');
        const giantLetter = document.getElementById('giant-letter');
        
        giantLetter.innerText = result.letter;
        
        // Match the giant letter text color to their chosen team color
        const colorMap = { red: '#ff4d4d', orange: '#ffa64d', yellow: '#ffff4d', green: '#4dff4d', blue: '#4d4dff', indigo: '#b366ff', violet: '#ff4dff' };
        giantLetter.style.color = colorMap[myColor];
        
        overlay.classList.add('show');
    } else {
        showToast(`Letter ${result.letter} is not in the word!`);
        document.getElementById(`card-${result.letter}`).style.opacity = '0.3';
        document.getElementById(`card-${result.letter}`).style.pointerEvents = 'none';
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}