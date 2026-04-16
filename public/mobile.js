// Standalone Answers Database
const answers = {
    1: "FAST", 2: "PACK", 3: "STAR", 4: "SEED",
    5: "WATER", 6: "DARK", 7: "LILAC"
};

const urlParams = new URLSearchParams(window.location.search);
const qId = urlParams.get('id') || 1;
const correctAnswer = answers[qId];

let myColor = null;
let wakeLock = null; // Variable to hold the wake lock

const colorPhase = document.getElementById('color-phase');
const teamPhase = document.getElementById('team-phase');
const gameplayPhase = document.getElementById('gameplay-phase');
const appContainer = document.getElementById('app-container');

// --- WAKE LOCK FUNCTION ---
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen Wake Lock acquired - screen will not sleep!');
            
            // If the lock is released (e.g., they minimize the browser), log it
            wakeLock.addEventListener('release', () => {
                console.log('Screen Wake Lock released');
            });
        }
    } catch (err) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
    }
}

// Re-request the wake lock if they minimize the browser and come back
document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
    }
});
// --------------------------

// 1. Build Color Grid & Handle Selection
const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
const colorGrid = document.getElementById('color-grid');

colors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = `color-btn bg-${color}`;
    btn.innerText = color.toUpperCase();
    
    btn.onclick = () => {
        myColor = color;
        const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);
        
        // Switch phases
        colorPhase.classList.remove('active');
        teamPhase.classList.add('active');
        
        // Change the background immediately to the selected color
        appContainer.className = `mobile-container bg-${myColor}`;
        
        // Set the subtitle text
        document.getElementById('team-subtitle').innerText = `You are a ${capitalizedColor} team member`;

        // Build Team Grid dynamically with the chosen color name
        const teamGrid = document.getElementById('team-grid');
        teamGrid.innerHTML = ''; // Clear it first
        
        for (let i = 1; i <= 4; i++) {
            const teamBtn = document.createElement('button');
            teamBtn.className = 'word-btn';
            teamBtn.innerText = `${capitalizedColor} ${i}`; 
            
            teamBtn.onclick = () => {
                teamPhase.classList.remove('active');
                gameplayPhase.classList.add('active');
                
                // REQUEST WAKE LOCK HERE so the screen stays on!
                requestWakeLock(); 
                
                initCarousel();
            };
            teamGrid.appendChild(teamBtn);
        }
    };
    colorGrid.appendChild(btn);
});

// 3. Build Alphabet Carousel
function initCarousel() {
    const carousel = document.getElementById('carousel');
    
    // Split the alphabet into an array and shuffle it randomly
    const shuffledAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort(() => 0.5 - Math.random());
    
    shuffledAlphabet.forEach(letter => {
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
    const overlay = document.getElementById('success-overlay');
    const giantLetter = document.getElementById('giant-letter');
    
    // Set the text to the clicked letter unconditionally
    giantLetter.innerText = letter;
    
    // Color map for the background
    const colorMap = { red: '#ff4d4d', orange: '#ffa64d', yellow: '#d4d400', green: '#33cc33', blue: '#4d4dff', indigo: '#8a2be2', violet: '#ee82ee' };
    
    // Make the background the team color
    overlay.style.backgroundColor = colorMap[myColor]; 
    
    // Make the giant letter pure white
    giantLetter.style.color = '#ffffff'; 
    
    // Show the overlay immediately
    overlay.classList.add('show');
}