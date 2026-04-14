const socket = io();

// Generate QR Code pointing to mobile app
const mobileUrl = window.location.origin + `/mobile.html`;
document.getElementById('qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mobileUrl)}`;

// CSS Variable Map for the Colors
const colorMap = {
    red: '#ff4d4d', orange: '#ffa64d', yellow: '#ffff4d',
    green: '#4dff4d', blue: '#4d4dff', indigo: '#b366ff', violet: '#ff4dff'
};

socket.on('gameStateUpdate', (state) => {
    const container = document.getElementById('questions-container');
    container.innerHTML = ''; 
    let completedCount = 0;

    Object.keys(state).forEach(colorKey => {
        const qData = state[colorKey];
        
        const row = document.createElement('div');
        row.className = 'question-row';

        // 1. Add Question Text
        const qText = document.createElement('div');
        qText.className = 'q-text';
        qText.innerText = qData.q;
        qText.style.color = colorMap[colorKey]; // Color code the question
        row.appendChild(qText);

        // 2. Add Answer Boxes
        const aBox = document.createElement('div');
        aBox.className = 'a-box';
        
        let isWordComplete = true;

        qData.a.split('').forEach(letter => {
            const span = document.createElement('span');
            span.innerText = letter;
            span.className = 'letter-box';
            
            if (qData.guessedLetters.includes(letter)) {
                span.classList.add('guessed');
                span.style.color = colorMap[colorKey];
                span.style.textShadow = `0 0 15px ${colorMap[colorKey]}`;
            } else {
                isWordComplete = false;
            }
            aBox.appendChild(span);
        });
        
        if (isWordComplete) completedCount++;

        row.appendChild(aBox);
        container.appendChild(row);
    });

    // Update "UNITED FOR IMPACT" Opacity (7 total questions)
    document.getElementById('impact-glow').style.opacity = completedCount / 7;
});