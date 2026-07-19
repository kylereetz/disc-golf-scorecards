const pars = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3];
const distances = [295, 265, 305, 250, 235, 260, 220, 285, 295, 218, 293, 299, 300, 385, 200, 370, 275, 268];

let players = [];
let scores = {}; // { playerName: [score1, score2, ..., score18] }
let currentHole = 1;

// You will generate these new coordinates using mapper.html and paste them here!
const mapCoordinates = [
    { x: 0.292, y: 0.063, rot: 83, scale: 6.00 }, // Hole 1
    { x: 0.204, y: 0.110, rot: 184, scale: 6.00 }, // Hole 2
    { x: 0.204, y: 0.261, rot: 188, scale: 6.00 }, // Hole 3
    { x: 0.194, y: 0.376, rot: 196, scale: 6.00 }, // Hole 4
    { x: 0.260, y: 0.453, rot: 268, scale: 6.00 }, // Hole 5
    { x: 0.393, y: 0.510, rot: 261, scale: 6.00 }, // Hole 6
    { x: 0.443, y: 0.614, rot: 154, scale: 6.00 }, // Hole 7
    { x: 0.477, y: 0.637, rot: 324, scale: 6.00 }, // Hole 8
    { x: 0.474, y: 0.661, rot: 153, scale: 6.00 }, // Hole 9
    { x: 0.446, y: 0.755, rot: 184, scale: 6.00 }, // Hole 10
    { x: 0.446, y: 0.899, rot: 167, scale: 6.00 }, // Hole 11
    { x: 0.496, y: 0.825, rot: 345, scale: 6.00 }, // Hole 12
    { x: 0.525, y: 0.689, rot: 1, scale: 5.63 }, // Hole 13
    { x: 0.520, y: 0.486, rot: 357, scale: 5.50 }, // Hole 14
    { x: 0.447, y: 0.399, rot: 120, scale: 6.00 }, // Hole 15
    { x: 0.310, y: 0.356, rot: 61, scale: 6.00 }, // Hole 16
    { x: 0.235, y: 0.224, rot: 359, scale: 6.00 }, // Hole 17
    { x: 0.302, y: 0.148, rot: 303, scale: 5.86 }, // Hole 18
];

const mapRotator = document.getElementById('map-rotator');
const mapLayer = document.getElementById('map-layer');

// DOM Elements
const screens = {
    setup: document.getElementById('setup-screen'),
    hole: document.getElementById('hole-screen'),
    overview: document.getElementById('overview-screen')
};

const playerNameInput = document.getElementById('player-name-input');
const addPlayerBtn = document.getElementById('add-player-btn');
const playerList = document.getElementById('player-list');
const startRoundBtn = document.getElementById('start-round-btn');

const currentHoleTitle = document.getElementById('current-hole-title');
const currentHolePar = document.getElementById('current-hole-par');
const prevHoleBtn = document.getElementById('prev-hole-btn');
const nextHoleBtn = document.getElementById('next-hole-btn');
const scoresContainer = document.getElementById('scores-container');
const viewScorecardBtn = document.getElementById('view-scorecard-btn');

const scorecardTable = document.getElementById('scorecard-table');
const backToHoleBtn = document.getElementById('back-to-hole-btn');
const endRoundBtn = document.getElementById('end-round-btn');

// --- Navigation ---
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// --- Setup Screen ---
addPlayerBtn.addEventListener('click', addPlayer);
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addPlayer();
});

function addPlayer() {
    const name = playerNameInput.value.trim();
    if (name && !players.includes(name)) {
        players.push(name);
        scores[name] = new Array(18).fill(0); // Initialize with 0s
        updatePlayerList();
        playerNameInput.value = '';
    }
}

function removePlayer(name) {
    players = players.filter(p => p !== name);
    delete scores[name];
    updatePlayerList();
}

function updatePlayerList() {
    playerList.innerHTML = '';
    players.forEach(name => {
        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `
            <span>${name}</span>
            <button class="remove-btn" onclick="removePlayer('${name}')">&times;</button>
        `;
        playerList.appendChild(li);
    });
    startRoundBtn.disabled = players.length === 0;
}

startRoundBtn.addEventListener('click', () => {
    currentHole = 1;
    loadHole(currentHole);
    showScreen('hole');
});

// --- Hole Screen ---
function loadHole(holeIndex) {
    const par = pars[holeIndex - 1];
    const dist = distances[holeIndex - 1];
    currentHoleTitle.innerText = `Hole ${holeIndex}`;
    currentHolePar.innerText = `Par ${par} • ${dist} ft`;
    
    prevHoleBtn.style.visibility = holeIndex === 1 ? 'hidden' : 'visible';
    nextHoleBtn.style.visibility = holeIndex === 18 ? 'hidden' : 'visible';

    // Update map layer
    const coords = mapCoordinates[holeIndex - 1];
    mapRotator.className = '';
    mapRotator.style.setProperty('--rot', `${coords.rot}deg`);
    mapRotator.style.setProperty('--scale', coords.scale);
    mapLayer.style.setProperty('--cx', coords.x);
    mapLayer.style.setProperty('--cy', coords.y);

    // Initialize scores to par if they are 0 (first time visiting)
    players.forEach(p => {
        if (scores[p][holeIndex - 1] === 0) {
            scores[p][holeIndex - 1] = par;
        }
    });

    renderScoreControls(holeIndex);
}

function renderScoreControls(holeIndex) {
    scoresContainer.innerHTML = '';
    const par = pars[holeIndex - 1];

    players.forEach(p => {
        const score = scores[p][holeIndex - 1];
        let scoreClass = '';
        if (score < par) scoreClass = 'under-par';
        else if (score > par) scoreClass = 'over-par';

        const card = document.createElement('div');
        card.className = 'score-card';
        card.innerHTML = `
            <div class="player-name">${p}</div>
            <div class="score-controls">
                <button class="score-btn" onclick="updateScore('${p}', -1)">-</button>
                <div class="score-display ${scoreClass}">${score}</div>
                <button class="score-btn" onclick="updateScore('${p}', 1)">+</button>
            </div>
        `;
        scoresContainer.appendChild(card);
    });
}

window.updateScore = function(playerName, change) {
    let currentScore = scores[playerName][currentHole - 1];
    let newScore = currentScore + change;
    if (newScore < 1) newScore = 1; // Min score is 1 (hole in one)
    if (newScore > 20) newScore = 20; // Max reasonable score

    scores[playerName][currentHole - 1] = newScore;
    renderScoreControls(currentHole);
}

prevHoleBtn.addEventListener('click', () => {
    if (currentHole > 1) {
        currentHole--;
        loadHole(currentHole);
    }
});

nextHoleBtn.addEventListener('click', () => {
    if (currentHole < 18) {
        currentHole++;
        loadHole(currentHole);
    }
});

viewScorecardBtn.addEventListener('click', () => {
    mapRotator.className = 'full-map';
    generateScorecardTable();
    showScreen('overview');
});

// --- Overview Screen ---
backToHoleBtn.addEventListener('click', () => {
    mapRotator.className = '';
    showScreen('hole');
});

endRoundBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to end this round and reset scores?')) {
        mapRotator.className = 'full-map';
        players = [];
        scores = {};
        updatePlayerList();
        showScreen('setup');
    }
});

function generateScorecardTable() {
    let html = `
        <thead>
            <tr>
                <th>Hole</th>
                ${players.map(p => `<th>${p}</th>`).join('')}
            </tr>
            <tr>
                <th>Par</th>
                ${players.map(p => `<th>-</th>`).join('')}
            </tr>
        </thead>
        <tbody>
    `;

    // Calculate total par
    const totalPar = pars.reduce((a, b) => a + b, 0);

    for (let i = 0; i < 18; i++) {
        html += `<tr>
            <td>${i + 1} <span style="font-size:0.8em; color:var(--text-muted);">(Par ${pars[i]})</span></td>
            ${players.map(p => {
                const s = scores[p][i];
                const par = pars[i];
                let display = s === 0 ? '-' : s;
                let color = '';
                if(s > 0 && s < par) color = 'color: var(--primary)';
                if(s > 0 && s > par) color = 'color: var(--danger)';
                return `<td style="${color}">${display}</td>`;
            }).join('')}
        </tr>`;
    }

    // Totals row
    html += `
        <tr>
            <td class="total-col">Total<br><span style="font-size:0.8em; color:var(--text-muted);">(Par ${totalPar})</span></td>
            ${players.map(p => {
                const total = scores[p].reduce((a, b) => a + b, 0);
                const playedHoles = scores[p].filter(s => s > 0).length;
                const playedPar = pars.slice(0, playedHoles).reduce((a, b) => a + b, 0);
                const toPar = total - playedPar;
                
                let toParStr = toPar === 0 ? 'E' : (toPar > 0 ? `+${toPar}` : toPar);
                
                return `<td class="total-col">${total}<br><span style="font-size:0.8em; color:var(--text-muted);">(${toParStr})</span></td>`;
            }).join('')}
        </tr>
    `;

    html += `</tbody>`;
    scorecardTable.innerHTML = html;
}
