/*
    Circoteca — Memória Viva do Circo
    Este arquivo controla a lógica do jogo.
*/

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
let soundEnabled = localStorage.getItem('circotecaSound') === 'true';

// Quando a página abre, configuramos botões, sons e eventos dos modais.
document.addEventListener('DOMContentLoaded', () => {
    const soundToggle = document.getElementById('soundToggle');
    const memoryModal = document.getElementById('memoryModal');

    soundToggle.checked = soundEnabled;

    soundToggle.addEventListener('change', () => {
        soundEnabled = soundToggle.checked;
        localStorage.setItem('circotecaSound', String(soundEnabled));

        if (soundEnabled) {
            playSound('flip');
        }
    });

    if (memoryModal) {
        memoryModal.addEventListener('hidden.bs.modal', () => {
            if (pendingVictory) {
                pendingVictory = false;
                gameVictory();
            }
        });
    }

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
    currentSize = size;

    const totalCards = size * size;
    const totalPairs = totalCards / 2;

    if (totalPairs > circotecaCards.length) {
        alert('Não há memórias cadastradas suficientes para esse tamanho de tabuleiro.');
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
        icon: memory.icon,
        texto: memory.texto,
        flipped: false,
        matched: false
    }));

    closeVictoryModal();
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

function renderBoard() {
    const board = document.getElementById('gameBoard');

    board.className = 'memory-board';
    board.style.gridTemplateColumns = `repeat(${currentSize}, minmax(0, 1fr))`;
    board.innerHTML = '';

    cards.forEach((card) => {
        const button = document.createElement('button');
        const isVisible = card.flipped || card.matched;

        button.type = 'button';
        button.className = `memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`;
        button.dataset.cardId = String(card.id);
        button.disabled = card.matched;
        button.setAttribute('aria-label', isVisible ? `Carta aberta: ${card.titulo}` : 'Carta fechada da Circoteca');
        button.onclick = () => flipCard(card.id);

        button.innerHTML = isVisible
            ? `<span class="card-content" title="${card.titulo}">${card.icon}</span>`
            : '<i class="bi bi-question-lg card-content"></i>';

        board.appendChild(button);
    });
}

function flipCard(cardId) {
    if (lockBoard) return;
    if (!gameActive) return;
    if (flippedCards.length >= 2) return;

    const card = cards[cardId];

    if (!card) return;
    if (card.flipped) return;
    if (card.matched) return;

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
        const modalWasShown = showMemoryModal(memory);

        if (lastPair) {
            if (modalWasShown) {
                pendingVictory = true;
            } else {
                gameVictory();
            }
        }
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

function showMemoryModal(memory) {
    if (!memory) return false;

    document.getElementById('memoryIcon').textContent = memory.icon;
    document.getElementById('memoryCategory').textContent = memory.categoria;
    document.getElementById('memoryTitle').textContent = memory.titulo;
    document.getElementById('memoryText').textContent = memory.texto;

    const modalElement = document.getElementById('memoryModal');

    if (window.bootstrap) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
        return true;
    }

    alert(`${memory.titulo}\n\n${memory.texto}`);
    return false;
}

function renderArchive() {
    const archiveList = document.getElementById('archiveList');

    if (!archiveList) return;

    if (unlockedMemories.length === 0) {
        archiveList.innerHTML = '<p class="text-muted mb-0">Nenhuma memória desbloqueada ainda.</p>';
        return;
    }

    archiveList.innerHTML = unlockedMemories.map(memory => `
        <div class="archive-item">
            <strong>${memory.icon} ${memory.titulo}</strong>
            <span>${memory.categoria}</span>
        </div>
    `).join('');
}

function highlightMatch(cardId1, cardId2) {
    [cardId1, cardId2].forEach((id) => {
        const element = document.querySelector(`[data-card-id="${id}"]`);

        if (element) {
            element.classList.add('match-animation');

            setTimeout(() => {
                element.classList.remove('match-animation');
            }, 350);
        }
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
    showVictoryModal();
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
}

function showVictoryModal() {
    const modalElement = document.getElementById('victoryModal');

    if (window.bootstrap) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
    } else {
        alert(`Você completou o acervo! Pontuação total: ${score}`);
    }
}

function closeVictoryModal() {
    const modalElement = document.getElementById('victoryModal');

    if (window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }
    }
}

function playSound(type = 'flip') {
    if (!soundEnabled) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const soundMap = {
        flip: { frequency: 520, duration: 0.08 },
        match: { frequency: 760, duration: 0.13 },
        wrong: { frequency: 180, duration: 0.18 },
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

    oscillator.onended = () => {
        audioContext.close();
    };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateActiveButtons() {
    const easyButton = document.getElementById('easyButton');
    const hardButton = document.getElementById('hardButton');

    easyButton.classList.toggle('active', currentSize === 4);
    hardButton.classList.toggle('active', currentSize === 6);
}
