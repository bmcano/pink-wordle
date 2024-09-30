let targetWord = '';
let currentGuess = '';
let gameResults = [];
let validWords = [];
let validAnswers = [];
let currentRow = 0;
const TOTAL_ROWS = 6;
const VALID_WORLD_WORDS = "valid-wordle-words.txt";
const WORLD_ANSWERS = "words.txt";
// game/keyboard
const board = document.getElementById('board');
const keys = document.querySelectorAll('.key');
const enterKey = document.getElementById('enter');
const backspaceKey = document.getElementById('backspace');
// Modal
const gameResultModal = document.getElementById('gameResultModal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalResult = document.getElementById('modal-result');
const playAgainButton = document.getElementById('playAgainButton');

// initial fetching from word lists
fetch(VALID_WORLD_WORDS)
    .then(response => response.text())
    .then(data => {
        validWords = data.split('\n').map(word => word.trim().toUpperCase());
        getWordleAnswer();
    });

// functions
function getWordleAnswer() {
    fetch(WORLD_ANSWERS)
    .then(response => response.text())
    .then(data => {
        validAnswers = data.split('\n').map(word => word.trim().toUpperCase());
        targetWord = validAnswers[Math.floor(Math.random() * validAnswers.length)];
        console.log(targetWord); // DEBUGGING
        initializeBoard();
    });
}

function initializeBoard() {
    currentRow = 0;
    currentGuess = '';
    gameResults = [];
    for (let i = 0; i < TOTAL_ROWS; i++) {
        const row = document.createElement('div');
        row.className = 'guess-row';
        for (let j = 0; j < 5; j++) {
            const box = document.createElement('div');
            box.className = 'box';
            box.textContent = '';
            row.appendChild(box);
        }
        board.appendChild(row);
    }
}

function updateCurrentRow() {
    if (currentRow >= TOTAL_ROWS) return;
    const currentRowElement = board.children[currentRow];
    for (let i = 0; i < 5; i++) {
        const box = currentRowElement.children[i];
        box.textContent = currentGuess[i] || '';
    }
}

async function checkGuess() {
    if (currentGuess.length !== 5) return;

    const currentRowElement = board.children[currentRow];

    if (!validWords.includes(currentGuess)) {
        showInvalidWordDialog();
        currentRowElement.classList.add('shake');
        setTimeout(() => {
            currentRowElement.classList.remove('shake');
        }, 600);
        return;
    }
    
    const boxAnimations = [];
    let rowResult = '';
    let lettersInTargetWord = targetWord.split("");

    for (let i = 0; i < 5; i++) {
        if (currentGuess[i] === targetWord[i]) {
            const index = lettersInTargetWord.indexOf(currentGuess[i]);
            if (index !== -1) {
                lettersInTargetWord.splice(index, 1);
            }
        }
    }

    for (let i = 0; i < 5; i++) {
        const key = [...keys].find(k => k.textContent === currentGuess[i]);
        const box = currentRowElement.children[i];

        if (currentGuess[i] === targetWord[i]) {
            key.classList.remove('wrong-location');
            key.classList.add('correct');
            box.classList.add('correct');
            boxAnimations.push('pulse-green');
            rowResult += '🟩';
        } else if (lettersInTargetWord.includes(currentGuess[i])) {
            key.classList.add('wrong-location');
            box.classList.add('wrong-location');
            boxAnimations.push('pulse-yellow');
            rowResult += '🟨';
            const index = lettersInTargetWord.indexOf(currentGuess[i]);
            if (index !== -1) {
                lettersInTargetWord.splice(index, 1);
            }
        } else {
            key.classList.add('incorrect');
            box.classList.add('incorrect');
            boxAnimations.push('pulse-gray');
            rowResult += '⬜';
        }

        await delay(300);
    }

    gameResults.push(rowResult);

    currentRow++;
    if (currentGuess === targetWord) {
        showEndGameModal(true)
    } else if (currentRow === TOTAL_ROWS) {
        showEndGameModal(false)
    }

    currentGuess = '';
    updateCurrentRow();
}

function showEndGameModal(won) {
    gameResultModal.style.display = 'flex';
    currentRow = 6;
    if (won) {
        modalTitle.textContent = 'Congratulations, You Win!';
        modalMessage.textContent = `The word was: ${targetWord}`;
    } else {
        modalTitle.textContent = 'Game Over!';
        modalMessage.textContent = `The word was: ${targetWord}`;
    }
    modalResult.innerHTML = gameResults.join('<br>');
}

function showInvalidWordDialog() {
    const dialog = document.getElementById('invalidWordDialog');
    dialog.classList.add('show');

    setTimeout(() => {
        dialog.classList.remove('show');
    }, 1000);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// event listeners
document.addEventListener('keydown', (event) => {
    const letter = event.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
        if (currentGuess.length < 5) {
            currentGuess += letter;
            updateCurrentRow();
        }
    } else if (event.key === 'Backspace') {
        currentGuess = currentGuess.slice(0, -1);
        updateCurrentRow();
    } else if (event.key === 'Enter') {
        checkGuess();
    }
});

keys.forEach(key => {
    key.addEventListener('click', () => {
        const letter = key.textContent;
        if (letter.length === 1 && currentGuess.length < 5) {
            currentGuess += letter;
            updateCurrentRow();
        }
    });
});

enterKey.addEventListener('click', checkGuess);

backspaceKey.addEventListener('click', () => {
    currentGuess = currentGuess.slice(0, -1);
    updateCurrentRow();
});

playAgainButton.addEventListener('click', () => {
    gameResultModal.style.display = 'none';

    targetWord = '';
    currentGuess = '';
    guesses = [];
    board.innerHTML = '';
    keys.forEach(key => {
        key.classList.remove('correct', 'wrong-location', 'incorrect');
    });

    targetWord = validAnswers[Math.floor(Math.random() * validAnswers.length)].toUpperCase();
    initializeBoard();
});
