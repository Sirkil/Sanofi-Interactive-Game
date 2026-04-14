// The 7 Questions (Unified, no colors attached)
const triviaData = [
    { q: "What is the word equivalent to speed?", a: "FAST" },
    { q: "What do you call a group of wolves?", a: "PACK" },
    { q: "What is the center of our solar system?", a: "STAR" },
    { q: "What do plants grow from?", a: "SEED" },
    { q: "What covers 70% of the Earth?", a: "WATER" },
    { q: "What is the color of a clear night sky?", a: "DARK" },
    { q: "What is a fragrant purple flower?", a: "LILAC" }
];

let flippedCount = 0;
const container = document.getElementById('cards-container');
const impactGlow = document.getElementById('impact-glow');

// Generate the 7 Flip Cards
triviaData.forEach((item) => {
    // 1. Create the Scene (Outer Container)
    const cardScene = document.createElement('div');
    cardScene.className = 'card-scene';

    // 2. Create the Inner Card (This rotates)
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    // 3. Create the Front (Question + Button)
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    
    cardFront.innerHTML = `
        <div class="question-text">${item.q}</div>
        <button class="reveal-btn">Reveal Answer</button>
    `;

    // 4. Create the Back (The Answer)
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    cardBack.innerHTML = `<div class="answer-text">${item.a}</div>`;

    // 5. Add Click Event to the Reveal Button
    const btn = cardFront.querySelector('.reveal-btn');
    btn.addEventListener('click', () => {
        // Only flip if it hasn't been flipped yet
        if (!cardScene.classList.contains('flipped')) {
            cardScene.classList.add('flipped');
            flippedCount++;
            
            // Update the "UNITED FOR IMPACT" opacity (increases by ~14.2% per card)
            impactGlow.style.opacity = flippedCount / 7;
        }
    });

    // 6. Assemble the card and add it to the board
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    cardScene.appendChild(cardInner);
    container.appendChild(cardScene);
});