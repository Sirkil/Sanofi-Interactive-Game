// Standalone Answers Database
const answers = {
    1: "FAST", 2: "PACK", 3: "STAR", 4: "SEED",
    5: "WATER", 6: "DARK", 7: "LILAC"
};

const urlParams = new URLSearchParams(window.location.search);
const qId = urlParams.get('id') || 1;
const correctAnswer = answers[qId];

let myColor = null;

const colorPhase = document.getElementById('color-phase');
const teamPhase = document.getElementById('team-phase');
const gameplayPhase = document.getElementById('gameplay-phase');
const appContainer = document.getElementById('app-container');

// 1. Build Color Grid
const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const colorGrid = document.getElementById('color-grid');
colors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = `color-btn bg-${color}`;
    btn.innerText = color.toUpperCase();
    btn.onclick = () => {
        myColor = color;
        colorPhase.classList.remove('active');
        teamPhase.classList.add('active');
    };
    colorGrid.appendChild(btn);
});

// 2. Build Team Grid
const teamGrid = document.getElementById('team-grid');
for (let i = 1; i <= 4; i++) {
    const btn = document.createElement('button');
    btn.className = 'word-btn';
    btn.innerText = `Team ${i}`;
    btn.onclick = () => {
        teamPhase.classList.remove('active');
        gameplayPhase.classList.add('active');
        appContainer.className = `mobile-container bg-${myColor}`; // Change BG color
        initCarousel();
    };
    teamGrid.appendChild(btn);
}

// 3. Build Alphabet Carousel
function initCarousel() {
    const carousel = document.getElementById('carousel');
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        const card = document.createElement('div');
        card.className = 'carousel-card';
        card.id = `card-${letter}`;
        card.innerText = letter;
        card.onclick = () => guessLetter(letter);
        carousel.appendChild(card);
    });
}

// 4. Handle Guesses Locally
function guessLetter(letter) {
    if (correctAnswer.includes(letter)) {
        const overlay = document.getElementById('success-overlay');
        const giantLetter = document.getElementById('giant-letter');
        
        giantLetter.innerText = letter;
        
        // Color map applied to the BACKGROUND instead of the text
        const colorMap = { red: '#ff4d4d', orange: '#ffa64d', yellow: '#d4d400', green: '#33cc33', blue: '#4d4dff', indigo: '#8a2be2', violet: '#ee82ee' };
        
        // Make the background the team color
        overlay.style.backgroundColor = colorMap[myColor]; 
        // Make the giant letter pure white
        giantLetter.style.color = '#ffffff'; 
        
        overlay.classList.add('show');
    } else {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
        
        // Dim the wrong letter
        document.getElementById(`card-${letter}`).style.opacity = '0.3';
        document.getElementById(`card-${letter}`).style.pointerEvents = 'none';
    }
}