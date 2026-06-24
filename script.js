let cards = [];
let flippedCards = [];
let unlockedMemories = [];
let matchedPairs = 0;
let moves = 0;
let score = 0;
let timer = 0;
let timerInterval = null;
let gameActive = false;
let currentSize = 4;
let lockBoard = false;
let pendingVictory = false;
let hintUsed = false;
let hintActive = false;
let soundEnabled = localStorage.getItem('circotecaSound') === 'true';

window.addEventListener('DOMContentLoaded', () => {
    const soundToggle = document.getElementById('soundToggle');
    soundToggle.checked = soundEnabled;

    soundToggle.addEventListener('change', () => {
        soundEnabled = soundToggle.checked;
        localStorage.setItem('circotecaSound', String(soundEnabled));
        if (soundEnabled) playSound('flip');
    });

    updateUI();
    renderArchive();
});

function startGame(size) {
    stopTimer();

    timer = 0;
    moves = 0;
    score = 0;
    matchedPairs = 0;
    flippedCards = [];
    unlockedMemories = [];
    gameActive = true;
    lockBoard = false;
    pendingVictory = false;
    hintUsed = false;
    hintActive = false;
    currentSize = size;

    const totalCards = size * size;
    const totalPairs = totalCards / 2;

    if (totalPairs > circotecaCards.length) {
        alert('Essa coleção ainda tem 8 memórias. Use o modo 4x4 por enquanto.');
        currentSize = 4;
        gameActive = false;
        updateUI();
        return;
    }

    const selectedMemories = circotecaCards.slice(0, totalPairs);
    const duplicatedMemories = [...selectedMemories, ...selectedMemories];

    shuffleArray(duplicatedMemories);

    cards = duplicatedMemories.map((memory, index) => ({
        id: index,
        memoryId: memory.id,
        titulo: memory.titulo,
        categoria: memory.categoria,
        image: memory.image,
        texto: memory.texto,
        flipped: false,
        matched: false
    }));

    closeVictoryModal();
    closeMemoryModal(false);
    updateActiveButtons();
    updateUI();
    renderArchive();
    renderBoard();
    startTimer();
    playSound('flip');
}

function restartGame() {
    startGame(currentSize);
}

function showHint() {
    if (!gameActive) return;
    if (hintUsed) return;
    if (hintActive) return;
    if (lockBoard) return;

    hintUsed = true;
    hintActive = true;
    lockBoard = true;

    flippedCards.forEach(card => card.flipped = false);
    flippedCards = [];

    renderBoard();
    updateUI();
    playSound('hint');

    setTimeout(() => {
        hintActive = false;
        lockBoard = false;
        renderBoard();
        updateUI();
    }, 950);
}

function renderBoard() {
    const board = document.getElementById('gameBoard');

    board.className = 'memory-board';
    board.style.gridTemplateColumns = `repeat(${currentSize}, minmax(0, 1fr))`;
    board.innerHTML = '';

    cards.forEach((card) => {
        const button = document.createElement('button');
        const isVisible = card.flipped || card.matched || hintActive;

        button.type = 'button';
        button.className = `memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`;
        button.dataset.cardId = String(card.id);
        button.disabled = card.matched || hintActive;
        button.setAttribute('aria-label', isVisible ? `Carta aberta: ${card.titulo}` : 'Carta fechada da Circoteca');
        button.onclick = () => flipCard(card.id);

        button.innerHTML = isVisible ? renderCardFace(card) : renderCardBack();
        board.appendChild(button);
    });
}

function renderCardBack() {
    return `<img class="card-back-img" src="assets/img/carta-verso-circoteca.png" alt="Verso da carta Circoteca">`;
}

function renderCardFace(card) {
    return `
        <img class="card-face-img" src="${card.image}" alt="${card.titulo}">
    `;
}

function flipCard(cardId) {
    if (lockBoard || !gameActive || flippedCards.length >= 2) return;

    const card = cards[cardId];
    if (!card || card.flipped || card.matched) return;

    card.flipped = true;
    flippedCards.push(card);

    renderBoard();
    playSound('flip');

    if (flippedCards.length === 2) {
        moves++;
        lockBoard = true;
        updateUI();
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (!card1 || !card2) {
        lockBoard = false;
        return;
    }

    if (card1.memoryId === card2.memoryId) {
        card1.matched = true;
        card2.matched = true;
        card1.flipped = false;
        card2.flipped = false;

        matchedPairs++;
        score += 100;
        flippedCards = [];

        const memory = getMemoryById(card1.memoryId);

        if (memory && !unlockedMemories.some(item => item.id === memory.id)) {
            unlockedMemories.push(memory);
        }

        renderBoard();
        renderArchive();
        highlightMatch(card1.id, card2.id);
        updateUI();
        playSound('match');

        lockBoard = false;

        const lastPair = matchedPairs === cards.length / 2;
        showMemoryModal(memory, lastPair);
    } else {
        playSound('wrong');
        setTimeout(() => {
            card1.flipped = false;
            card2.flipped = false;
            flippedCards = [];
            lockBoard = false;
            renderBoard();
        }, 800);
    }
}

function getMemoryById(memoryId) {
    return circotecaCards.find(memory => memory.id === memoryId);
}

function showMemoryModal(memory, isLastPair = false) {
    if (!memory) return;

    pendingVictory = isLastPair;

    document.getElementById('memoryImage').src = memory.image;
    document.getElementById('memoryImage').alt = memory.titulo;
    document.getElementById('memoryCategory').textContent = memory.categoria;
    document.getElementById('memoryTitle').textContent = memory.titulo;
    document.getElementById('memoryText').textContent = memory.texto;

    document.getElementById('memoryModal').classList.add('is-open');
    document.getElementById('memoryModal').setAttribute('aria-hidden', 'false');
}

function closeMemoryModal(checkVictory = true) {
    const modal = document.getElementById('memoryModal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    if (checkVictory && pendingVictory) {
        pendingVictory = false;
        gameVictory();
    }
}

function renderArchive() {
    const archiveList = document.getElementById('archiveList');

    if (unlockedMemories.length === 0) {
        archiveList.innerHTML = '<p class="archive-empty">Nenhuma memória desbloqueada ainda.</p>';
        return;
    }

    archiveList.innerHTML = unlockedMemories.map(memory => `
        <article class="archive-item">
            <img src="${memory.image}" alt="${memory.titulo}">
            <div>
                <strong>${memory.titulo}</strong>
                <span>${memory.categoria}</span>
            </div>
        </article>
    `).join('');
}

function highlightMatch(cardId1, cardId2) {
    [cardId1, cardId2].forEach((id) => {
        const element = document.querySelector(`[data-card-id="${id}"]`);
        if (!element) return;

        element.classList.add('match-animation');
        setTimeout(() => element.classList.remove('match-animation'), 350);
    });
}

function gameVictory() {
    gameActive = false;
    stopTimer();

    const finalScore = calculateFinalScore();
    score = finalScore;

    document.getElementById('victoryStats').innerHTML = `
        Tempo: <strong>${formatTime(timer)}</strong><br>
        Movimentos: <strong>${moves}</strong><br>
        Memórias desbloqueadas: <strong>${unlockedMemories.length}</strong>
    `;

    document.getElementById('finalScore').textContent = String(finalScore);
    updateUI();
    playSound('victory');

    document.getElementById('victoryModal').classList.add('is-open');
    document.getElementById('victoryModal').setAttribute('aria-hidden', 'false');
}

function closeVictoryModal() {
    const modal = document.getElementById('victoryModal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        updateUI();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function calculateFinalScore() {
    const baseScore = matchedPairs * 100;
    const timeBonus = Math.max(0, 300 - timer) * 10;
    const moveBonus = Math.max(0, 50 - moves) * 5;
    return baseScore + timeBonus + moveBonus;
}

function updateUI() {
    const totalPairs = cards.length > 0 ? cards.length / 2 : currentSize * currentSize / 2;

    document.getElementById('timer').textContent = formatTime(timer);
    document.getElementById('moves').textContent = String(moves);
    document.getElementById('score').textContent = String(score);
    document.getElementById('memoriesCount').textContent = `${unlockedMemories.length}/${totalPairs}`;

    updateHintButton();
}

function updateHintButton() {
    const hintButton = document.getElementById('hintButton');
    if (!hintButton) return;

    hintButton.disabled = !gameActive || hintUsed || hintActive || lockBoard;
    hintButton.innerHTML = hintUsed
        ? '<i class="bi bi-eye-slash"></i><span>Dica usada</span>'
        : '<i class="bi bi-lightbulb"></i><span>Dica 1x</span>';
}

function updateActiveButtons() {
    document.getElementById('easyButton').classList.toggle('active', currentSize === 4);
    document.getElementById('hardButton').classList.toggle('active', currentSize === 6);
}

function playSound(type = 'flip') {
    if (!soundEnabled) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const soundMap = {
        flip: { frequency: 520, duration: 0.08 },
        match: { frequency: 760, duration: 0.13 },
        wrong: { frequency: 180, duration: 0.18 },
        hint: { frequency: 650, duration: 0.16 },
        victory: { frequency: 920, duration: 0.28 }
    };

    const config = soundMap[type] || soundMap.flip;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + config.duration);
    oscillator.onended = () => audioContext.close();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
