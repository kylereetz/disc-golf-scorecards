const pars = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
const distances = [330, 318, 283, 297, 323, 311, 345, 402, 224, 242, 238, 291, 252, 346, 296, 330, 195, 342];

let players = [];
let scores = {}; // { playerName: [score1, score2, ..., score18] }
let currentHole = 1;

const mapCoordinates = [
    { x: 0.217, y: 0.543, rot: 174, scale: 2.83 }, // Hole 1
    { x: 0.296, y: 0.794, rot: 229, scale: 5.16 }, // Hole 2
    { x: 0.502, y: 0.862, rot: 246, scale: 5.01 }, // Hole 3
    { x: 0.685, y: 0.755, rot: 345, scale: 4.93 }, // Hole 4
    { x: 0.725, y: 0.566, rot: 354, scale: 3.70 }, // Hole 5
    { x: 0.719, y: 0.280, rot: 5, scale: 3.01 }, // Hole 6
    { x: 0.776, y: 0.258, rot: 193, scale: 3.22 }, // Hole 7
    { x: 0.845, y: 0.253, rot: 3, scale: 3.30 }, // Hole 8
    { x: 0.857, y: 0.162, rot: 193, scale: 6.00 }, // Hole 9
    { x: 0.887, y: 0.436, rot: 195, scale: 2.77 }, // Hole 10
    { x: 0.926, y: 0.774, rot: 182, scale: 4.14 }, // Hole 11
    { x: 0.878, y: 0.858, rot: 92, scale: 5.87 }, // Hole 12
    { x: 0.835, y: 0.685, rot: 1, scale: 4.67 }, // Hole 13
    { x: 0.775, y: 0.700, rot: 181, scale: 4.17 }, // Hole 14
    { x: 0.566, y: 0.813, rot: 145, scale: 2.12 }, // Hole 15
    { x: 0.323, y: 0.634, rot: 14, scale: 2.82 }, // Hole 16
    { x: 0.253, y: 0.267, rot: 351, scale: 3.31 }, // Hole 17
    { x: 0.219, y: 0.237, rot: 147, scale: 4.72 }, // Hole 18
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
