// Game state
let timeRemaining: number = 1.000;
let maxTime: number = 1.000;
let taps: number = 0;
let score: number = 0;
let isRunning: boolean = false;
let lastFrameTime: number = 0;

// Score tiers
let perfects: number = 0;
let greats: number = 0;
let goods: number = 0;
let fines: number = 0;
let poors: number = 0;
let bads: number = 0;

// Point values
const POINTS = {
    perfect: 500,
    great: 50,
    good: 25,
    fine: 10,
    poor: 5,
    bad: 0
};

// Player data
let currentInitials: string[] = ['A', 'A', 'A'];
let deviceType: 'desktop' | 'mobile' = 'desktop';
let userId: string = '';

// DOM elements - Screens
const instructionsPopup = document.getElementById('instructions-popup') as HTMLElement;
const startScreen = document.getElementById('start-screen') as HTMLElement;
const gameplayScreen = document.getElementById('gameplay-screen') as HTMLElement;
const gameoverScreen = document.getElementById('gameover-screen') as HTMLElement;
const leaderboardScreen = document.getElementById('leaderboard-screen') as HTMLElement;

// DOM elements - Instructions
const gotItButton = document.getElementById('got-it-button') as HTMLElement;

// DOM elements - Start screen
const startButton = document.getElementById('start-button') as HTMLElement;

// DOM elements - Gameplay
const timerDisplay = document.getElementById('timer') as HTMLElement;
const scoreDisplay = document.getElementById('score') as HTMLElement;

// DOM elements - Game over
const finalScoreDisplay = document.getElementById('final-score') as HTMLElement;
const finalTapsDisplay = document.getElementById('final-taps') as HTMLElement;
const tierBreakdown = document.getElementById('tier-breakdown') as HTMLElement;
const initialSlots = document.querySelectorAll('.initial-slot');
const arrowButtons = document.querySelectorAll('.arrow-btn');
const submitButton = document.getElementById('submit-button') as HTMLButtonElement;

// DOM elements - Leaderboard
const leaderboardList = document.getElementById('leaderboard-list') as HTMLElement;
const newGameButton = document.getElementById('newgame-button') as HTMLElement;

// Detect device type
function detectDevice(): void {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    deviceType = isMobile ? 'mobile' : 'desktop';
}

// Generate or retrieve user ID
function initUserId(): void {
    const stored = localStorage.getItem('timedebt_userid');
    if (stored) {
        userId = stored;
    } else {
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('timedebt_userid', userId);
    }
}

// Load saved initials
function loadInitials(): void {
    const stored = localStorage.getItem('timedebt_initials');
    if (stored) {
        currentInitials = stored.split('');
        initialSlots.forEach((slot, index) => {
            slot.textContent = currentInitials[index] ?? 'A';
        });
    }
}

// Save initials
function saveInitials(): void {
    localStorage.setItem('timedebt_initials', currentInitials.join(''));
}

// Check if user has seen instructions
function hasSeenInstructions(): boolean {
    return localStorage.getItem('timedebt_instructions_seen') === 'true';
}

// Mark instructions as seen
function markInstructionsSeen(): void {
    localStorage.setItem('timedebt_instructions_seen', 'true');
}

// Show a specific screen
function showScreen(screen: HTMLElement): void {
    instructionsPopup.classList.add('hidden');
    startScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}

// Show instructions popup
function showInstructions(): void {
    startScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    instructionsPopup.classList.remove('hidden');
}

// Classify a point based on remaining time and add points
function classifyPoint(remaining: number): void {
    if (remaining <= 0.005) {
        perfects++;
        score += POINTS.perfect;
    } else if (remaining <= 0.050) {
        greats++;
        score += POINTS.great;
    } else if (remaining <= 0.100) {
        goods++;
        score += POINTS.good;
    } else if (remaining <= 0.200) {
        fines++;
        score += POINTS.fine;
    } else if (remaining <= 0.350) {
        poors++;
        score += POINTS.poor;
    } else if (remaining <= 0.500) {
        bads++;
        score += POINTS.bad;
    }
}

// Reset game state
function resetGame(): void {
    timeRemaining = 1.000;
    maxTime = 1.000;
    taps = 0;
    score = 0;
    perfects = 0;
    greats = 0;
    goods = 0;
    fines = 0;
    poors = 0;
    bads = 0;
    isRunning = false;
    lastFrameTime = 0;
}

// Update gameplay display
function updateDisplay(): void {
    timerDisplay.textContent = timeRemaining.toFixed(3);
    scoreDisplay.textContent = score.toString();
}

// Main game loop
function gameLoop(currentTime: number): void {
    if (!isRunning) return;

    if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
    }

    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    timeRemaining -= deltaTime;

    if (timeRemaining <= 0) {
        timeRemaining = 0;
        isRunning = false;
        updateDisplay();
        endGame();
        return;
    }

    updateDisplay();
    requestAnimationFrame(gameLoop);
}

// Start the game
function startGame(): void {
    resetGame();
    showScreen(gameplayScreen);
    isRunning = true;
    updateDisplay();
    requestAnimationFrame(gameLoop);
}

// Handle tap during gameplay
function handleGameplayTap(e: Event): void {
    if (!isRunning) return;
    e.preventDefault();

    taps++;
    classifyPoint(timeRemaining);
    
    // Subtract remaining time from maxTime (accumulate debt)
    maxTime = maxTime - timeRemaining;
    
    // Reset timer to new maxTime
    timeRemaining = maxTime;
    lastFrameTime = 0;
    updateDisplay();
}

// End the game and show game over screen
function endGame(): void {
    finalScoreDisplay.textContent = score.toString();
    finalTapsDisplay.textContent = taps.toString();
    tierBreakdown.innerHTML = `
        <div>PERFECT (≤0.005): ${perfects} × ${POINTS.perfect} = ${perfects * POINTS.perfect}</div>
        <div>GREAT (≤0.050): ${greats} × ${POINTS.great} = ${greats * POINTS.great}</div>
        <div>GOOD (≤0.100): ${goods} × ${POINTS.good} = ${goods * POINTS.good}</div>
        <div>FINE (≤0.200): ${fines} × ${POINTS.fine} = ${fines * POINTS.fine}</div>
        <div>POOR (≤0.350): ${poors} × ${POINTS.poor} = ${poors * POINTS.poor}</div>
        <div>BAD (≤0.500): ${bads} × ${POINTS.bad} = ${bads * POINTS.bad}</div>
    `;
    
    // Disable submit button for 0.5 seconds
    submitButton.disabled = true;
    setTimeout(() => {
        submitButton.disabled = false;
    }, 500);
    
    showScreen(gameoverScreen);
}

// Cycle initial letter up (A→B→C...→Z→A)
function cycleInitialUp(index: number): void {
    let char = currentInitials[index] ?? 'A';
    if (char === 'Z') {
        char = 'A';
    } else {
        char = String.fromCharCode(char.charCodeAt(0) + 1);
    }
    currentInitials[index] = char;
    const slot = initialSlots[index];
    if (slot) {
        slot.textContent = char;
    }
}

// Cycle initial letter down (A→Z→Y...→B→A)
function cycleInitialDown(index: number): void {
    let char = currentInitials[index] ?? 'A';
    if (char === 'A') {
        char = 'Z';
    } else {
        char = String.fromCharCode(char.charCodeAt(0) - 1);
    }
    currentInitials[index] = char;
    const slot = initialSlots[index];
    if (slot) {
        slot.textContent = char;
    }
}

// Submit score (placeholder for Supabase integration)
function submitScore(): void {
    saveInitials();

    const scoreData = {
        userId: userId,
        initials: currentInitials.join(''),
        device: deviceType,
        taps: taps,
        score: score,
        perfects: perfects,
        greats: greats,
        goods: goods,
        fines: fines,
        poors: poors,
        bads: bads,
        timestamp: Date.now()
    };

    console.log('Score submitted:', scoreData);

    // TODO: Send to Supabase

    showLeaderboard();
}

// Show leaderboard (placeholder for Supabase integration)
function showLeaderboard(): void {
    // TODO: Fetch from Supabase
    // For now, show placeholder
    leaderboardList.innerHTML = `
        <div class="leaderboard-row">
            <span class="leaderboard-rank">1</span>
            <span class="leaderboard-initials">${currentInitials.join('')}</span>
            <span class="leaderboard-device">${deviceType === 'mobile' ? '📱' : '🖥️'}</span>
            <span class="leaderboard-points">${score}</span>
            <span class="leaderboard-taps">${taps}</span>
        </div>
    `;
    showScreen(leaderboardScreen);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners
    gotItButton.addEventListener('click', () => {
        markInstructionsSeen();
        showScreen(startScreen);
    });

    startButton.addEventListener('click', startGame);

    gameplayScreen.addEventListener('click', handleGameplayTap);
    gameplayScreen.addEventListener('touchstart', handleGameplayTap);

    arrowButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(btn.getAttribute('data-index') ?? '0');
            if (btn.classList.contains('up')) {
                cycleInitialUp(index);
            } else {
                cycleInitialDown(index);
            }
        });
    });

    submitButton.addEventListener('click', submitScore);

    newGameButton.addEventListener('click', () => {
        resetGame();
        showScreen(startScreen);
    });

    // Initialize
    detectDevice();
    initUserId();
    loadInitials();

    // Show instructions or start screen
    if (hasSeenInstructions()) {
        showScreen(startScreen);
    } else {
        showInstructions();
    }
});