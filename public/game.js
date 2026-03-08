"use strict";
// Game state
let timeRemaining = 1.000;
let maxTime = 1.000;
let taps = 0;
let score = 0;
let isRunning = false;
let lastFrameTime = 0;
// One Tap mode state
let lives = 3;
let isLocked = false;
let isCountingDown = false;
let isReadySetGo = false;
// Score tiers
let perfects = 0;
let greats = 0;
let goods = 0;
let fines = 0;
let poors = 0;
let bads = 0;
// Point values
const POINTS = {
    perfect: 500,
    great: 50,
    good: 25,
    fine: 10,
    poor: 5,
    bad: 0
};
// Settings
let gameMode = 'sudden-death';
let ringEnabled = true;
// Player data
let currentInitials = ['A', 'A', 'A'];
let deviceType = 'desktop';
let userId = '';
// DOM elements - Screens
const instructionsPopup = document.getElementById('instructions-popup');
const mainMenuScreen = document.getElementById('main-menu-screen');
const startScreen = document.getElementById('start-screen');
const gameplayScreen = document.getElementById('gameplay-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const scoreScreen = document.getElementById('score-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');
// DOM elements - Instructions
const gotItButton = document.getElementById('got-it-button');
// DOM elements - Main Menu
const startGameButton = document.getElementById('start-game-button');
const helpButton = document.getElementById('help-button');
const leaderboardButton = document.getElementById('leaderboard-button');
const modeToggle = document.getElementById('mode-toggle');
const ringToggle = document.getElementById('ring-toggle');
// DOM elements - Start Screen
const startTimerRing = document.getElementById('start-timer-ring');
const startHearts = document.getElementById('start-hearts');
const startInstruction = document.getElementById('start-instruction');
// DOM elements - Gameplay
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const timerRing = document.getElementById('timer-ring');
const gameplayHearts = document.getElementById('gameplay-hearts');
const instruction = document.getElementById('instruction');
const countdown = document.getElementById('countdown');
const timerContainer = document.getElementById('timer-container');
const maxDisplay = document.getElementById('max-display');
const lifeLost = document.getElementById('life-lost');
// DOM elements - Score Screen
const finalScoreDisplay = document.getElementById('final-score');
const finalTapsDisplay = document.getElementById('final-taps');
const tierBreakdown = document.getElementById('tier-breakdown');
const initialSlots = document.querySelectorAll('.initial-slot');
const arrowButtons = document.querySelectorAll('.arrow-btn');
const submitButton = document.getElementById('submit-button');
const initialsSection = document.getElementById('initials-submit-row');
const menuFromScoreButton = document.getElementById('menu-from-score-button');
const personalBestMessage = document.getElementById('personal-best-message');
// DOM elements - Leaderboard
const leaderboardList = document.getElementById('leaderboard-list');
const menuFromLeaderboardButton = document.getElementById('menu-from-leaderboard-button');
// Get current month key (e.g., "2026-02")
function getCurrentMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
// Get monthly personal best
function getMonthlyBest() {
    const monthKey = getCurrentMonthKey();
    const stored = localStorage.getItem(`timedebt_best_${monthKey}`);
    return stored ? parseInt(stored, 10) : 0;
}
// Set monthly personal best
function setMonthlyBest(newScore) {
    const monthKey = getCurrentMonthKey();
    localStorage.setItem(`timedebt_best_${monthKey}`, newScore.toString());
}
// Check if user has already submitted this month
function hasSubmittedThisMonth() {
    const monthKey = getCurrentMonthKey();
    return localStorage.getItem(`timedebt_submitted_${monthKey}`) === 'true';
}
// Mark that user has submitted this month
function markSubmittedThisMonth() {
    const monthKey = getCurrentMonthKey();
    localStorage.setItem(`timedebt_submitted_${monthKey}`, 'true');
}
// Detect device type
function detectDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    deviceType = isMobile ? 'mobile' : 'desktop';
}
// Generate or retrieve user ID
function initUserId() {
    const stored = localStorage.getItem('timedebt_userid');
    if (stored) {
        userId = stored;
    }
    else {
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('timedebt_userid', userId);
    }
}
// Load saved initials
function loadInitials() {
    const stored = localStorage.getItem('timedebt_initials');
    if (stored) {
        currentInitials = stored.split('');
        initialSlots.forEach((slot, index) => {
            var _a;
            slot.textContent = (_a = currentInitials[index]) !== null && _a !== void 0 ? _a : 'A';
        });
    }
}
// Save initials
function saveInitials() {
    localStorage.setItem('timedebt_initials', currentInitials.join(''));
}
// Check if user has seen instructions
function hasSeenInstructions() {
    return localStorage.getItem('timedebt_instructions_seen') === 'true';
}
// Mark instructions as seen
function markInstructionsSeen() {
    localStorage.setItem('timedebt_instructions_seen', 'true');
}
// Load settings from localStorage
function loadSettings() {
    const storedMode = localStorage.getItem('timedebt_mode');
    if (storedMode === 'sudden-death' || storedMode === 'one-tap') {
        gameMode = storedMode;
    }
    const storedRing = localStorage.getItem('timedebt_ring');
    if (storedRing !== null) {
        ringEnabled = storedRing === 'true';
    }
}
// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('timedebt_mode', gameMode);
    localStorage.setItem('timedebt_ring', ringEnabled.toString());
}
// Show a specific screen (no fade)
function showScreen(screen) {
    instructionsPopup.classList.add('hidden');
    mainMenuScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    scoreScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    // Remove any fade classes
    screen.classList.remove('fade-in');
    screen.classList.remove('hidden');
}
// Show a screen with fade-in effect
function showScreenWithFade(screen) {
    instructionsPopup.classList.add('hidden');
    mainMenuScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    scoreScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    screen.classList.remove('hidden');
    screen.classList.add('fade-in');
}
// Show instructions popup
function showInstructions() {
    instructionsPopup.classList.remove('hidden');
}
// Update ring visibility based on setting
function updateRingVisibility() {
    if (ringEnabled) {
        timerRing.classList.remove('hidden');
        startTimerRing.classList.remove('hidden');
    }
    else {
        timerRing.classList.add('hidden');
        startTimerRing.classList.add('hidden');
    }
}
// Update hearts visibility based on game mode
function updateHeartsVisibility() {
    if (gameMode === 'one-tap') {
        startHearts.classList.remove('hidden');
        gameplayHearts.classList.remove('hidden');
    }
    else {
        startHearts.classList.add('hidden');
        gameplayHearts.classList.add('hidden');
    }
}
// Update hearts display based on lives remaining
function updateHeartsDisplay() {
    const startHeartElements = startHearts.querySelectorAll('.heart');
    const gameplayHeartElements = gameplayHearts.querySelectorAll('.heart');
    startHeartElements.forEach((heart, index) => {
        if (index < lives) {
            heart.classList.remove('lost');
        }
        else {
            heart.classList.add('lost');
        }
    });
    gameplayHeartElements.forEach((heart, index) => {
        if (index < lives) {
            heart.classList.remove('lost');
        }
        else {
            heart.classList.add('lost');
        }
    });
}
// Update toggle displays
function updateToggleDisplays() {
    modeToggle.textContent = gameMode === 'sudden-death' ? 'SUDDEN DEATH' : 'ONE TAP';
    ringToggle.textContent = ringEnabled ? 'ON' : 'OFF';
}
// Classify a point based on remaining time and add points
function classifyPoint(remaining) {
    if (remaining <= 0.005) {
        perfects++;
        score += POINTS.perfect;
    }
    else if (remaining <= 0.050) {
        greats++;
        score += POINTS.great;
    }
    else if (remaining <= 0.100) {
        goods++;
        score += POINTS.good;
    }
    else if (remaining <= 0.200) {
        fines++;
        score += POINTS.fine;
    }
    else if (remaining <= 0.350) {
        poors++;
        score += POINTS.poor;
    }
    else if (remaining <= 0.500) {
        bads++;
        score += POINTS.bad;
    }
}
// Reset game state
function resetGame() {
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
    lives = 3;
    isLocked = false;
    isCountingDown = false;
    isReadySetGo = false;
    // Reset UI elements
    instruction.textContent = 'tap anywhere';
    instruction.classList.remove('hidden');
    countdown.classList.add('hidden');
    gameplayScreen.querySelectorAll('.debt-popup').forEach(el => el.remove());
    maxDisplay.classList.add('hidden');
    lifeLost.classList.add('hidden');
    updateHeartsDisplay();
}
// Update the timer ring visualization
function updateRing() {
    if (!ringEnabled)
        return;
    const percent = timeRemaining * 100;
    timerRing.style.background = `conic-gradient(
        from 0deg,
        #e0e0e0 0%,
        #e0e0e0 ${percent}%,
        transparent ${percent}%
    )`;
}
// Update gameplay display
function updateDisplay() {
    timerDisplay.textContent = timeRemaining.toFixed(3);
    scoreDisplay.textContent = score.toString();
    updateRing();
}
// Main game loop
function gameLoop(currentTime) {
    if (!isRunning)
        return;
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
        handleTimerZero();
        return;
    }
    updateDisplay();
    requestAnimationFrame(gameLoop);
}
// Handle when timer reaches zero
function handleTimerZero() {
    if (gameMode === 'sudden-death') {
        endGame();
    }
    else {
        // One Tap mode - lose a life
        lives--;
        updateHeartsDisplay();
        if (lives <= 0) {
            endGame();
        }
        else {
            // Show life lost message
            lifeLost.classList.remove('hidden');
            instruction.classList.add('hidden');
            // After 2 seconds, start lockout period
            setTimeout(() => {
                lifeLost.classList.add('hidden');
                startLockoutPeriod();
            }, 2000);
        }
    }
}
// Start the 2-second lockout period (One Tap mode)
function startLockoutPeriod() {
    isLocked = true;
    instruction.classList.add('hidden');
    // After 2 seconds, show "tap anywhere to continue"
    setTimeout(() => {
        isLocked = false;
        instruction.textContent = 'tap anywhere to continue';
        instruction.classList.remove('hidden');
    }, 2000);
}
// Start ready-set-go sequence for initial game start
function startReadySetGo() {
    isReadySetGo = true;
    instruction.classList.add('hidden');
    countdown.classList.remove('hidden');
    countdown.textContent = 'READY';
    setTimeout(() => {
        countdown.textContent = 'SET';
        setTimeout(() => {
            countdown.textContent = 'GO!';
            setTimeout(() => {
                countdown.classList.add('hidden');
                isReadySetGo = false;
                instruction.textContent = 'tap anywhere';
                instruction.classList.remove('hidden');
                isRunning = true;
                lastFrameTime = 0;
                updateMaxDisplay();
                requestAnimationFrame(gameLoop);
            }, 400);
        }, 800);
    }, 800);
}
// Start countdown sequence (3, 2, 1)
function startCountdown() {
    isCountingDown = true;
    instruction.classList.add('hidden');
    countdown.classList.remove('hidden');
    let count = 3;
    countdown.textContent = count.toString();
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = count.toString();
        }
        else {
            clearInterval(countdownInterval);
            countdown.classList.add('hidden');
            isCountingDown = false;
            // Resume the game
            instruction.textContent = 'tap anywhere';
            instruction.classList.remove('hidden');
            isRunning = true;
            lastFrameTime = 0;
            requestAnimationFrame(gameLoop);
        }
    }, 1000);
}
// Go to start screen (pre-game)
function goToStartScreen() {
    resetGame();
    updateRingVisibility();
    updateHeartsVisibility();
    showScreen(startScreen);
}
// Start the game (from start screen tap)
function startGame() {
    showScreen(gameplayScreen);
    updateRingVisibility();
    updateHeartsVisibility();
    updateDisplay();
    startReadySetGo();
}
// Handle tap on start screen
function handleStartScreenTap(e) {
    e.preventDefault();
    startGame();
}
// Handle tap during gameplay
function handleGameplayTap(e) {
    e.preventDefault();
    // Ignore taps during lockout, countdown, or ready-set-go
    if (isLocked || isCountingDown || isReadySetGo)
        return;
    if (gameMode === 'sudden-death') {
        handleSuddenDeathTap();
    }
    else {
        handleOneTapTap();
    }
}
// Return tier label and points for a given remaining time
function getTierInfo(remaining) {
    if (remaining <= 0.005)
        return { label: 'PERFECT', points: POINTS.perfect };
    if (remaining <= 0.050)
        return { label: 'GREAT', points: POINTS.great };
    if (remaining <= 0.100)
        return { label: 'GOOD', points: POINTS.good };
    if (remaining <= 0.200)
        return { label: 'FINE', points: POINTS.fine };
    if (remaining <= 0.350)
        return { label: 'POOR', points: POINTS.poor };
    return { label: 'BAD', points: POINTS.bad };
}
// Spawn a floating debt popup for this tap (stacks with concurrent popups)
function showDebt(amount, tierLabel, points) {
    const popup = document.createElement('div');
    popup.className = 'debt-popup';
    popup.innerHTML = `
        <div class="debt-tier">${tierLabel}</div>
        <div class="debt-points">+${points}</div>
        <div class="debt-amount">-${amount.toFixed(3)}</div>
    `;
    // Anchor to the bottom-center of the timer container
    const containerRect = timerContainer.getBoundingClientRect();
    const screenRect = gameplayScreen.getBoundingClientRect();
    popup.style.top = `${containerRect.bottom - screenRect.top}px`;
    popup.style.left = `${containerRect.left + containerRect.width / 2 - screenRect.left}px`;
    gameplayScreen.appendChild(popup);
    popup.addEventListener('animationend', () => popup.remove());
}
// Show/update the max time display (Sudden Death only)
function updateMaxDisplay() {
    if (gameMode !== 'sudden-death')
        return;
    maxDisplay.textContent = `MAX: ${maxTime.toFixed(3)}`;
    maxDisplay.classList.remove('hidden');
}
// Handle tap in Sudden Death mode
function handleSuddenDeathTap() {
    if (!isRunning)
        return;
    // Freeze timer immediately so the tap feels like it lands
    isRunning = false;
    taps++;
    const debt = timeRemaining;
    const tier = getTierInfo(debt);
    classifyPoint(debt);
    updateDisplay();
    showDebt(debt, tier.label, tier.points);
    // 80ms beat pause, then apply debt and resume
    setTimeout(() => {
        maxTime = maxTime - debt;
        timeRemaining = maxTime;
        updateDisplay();
        updateMaxDisplay();
        isRunning = true;
        lastFrameTime = 0;
        requestAnimationFrame(gameLoop);
    }, 400);
}
// Handle tap in One Tap mode
function handleOneTapTap() {
    if (isRunning) {
        // First tap - stop the clock
        isRunning = false;
        taps++;
        classifyPoint(timeRemaining);
        // Accumulate debt (but don't update display yet - show the tap result)
        maxTime = maxTime - timeRemaining;
        // Start lockout period (display still shows the time they tapped at)
        startLockoutPeriod();
    }
    else if (!isLocked && !isCountingDown) {
        // Second tap (after lockout) - start countdown
        // Now update to new maxTime before countdown
        timeRemaining = maxTime;
        updateDisplay();
        startCountdown();
    }
}
// End the game - show game over screen, then transition to score screen
function endGame() {
    showScreen(gameoverScreen);
    // After 1 second, fade to score screen
    setTimeout(() => {
        showScoreScreen();
    }, 1000);
}
// Show the score screen with fade
function showScoreScreen() {
    finalScoreDisplay.textContent = score.toString();
    finalTapsDisplay.textContent = taps.toString();
    tierBreakdown.innerHTML = `
        <div>PERFECT: ${perfects}<span class="points-math"> × ${POINTS.perfect}</span> = ${perfects * POINTS.perfect}</div>
        <div>GREAT: ${greats}<span class="points-math"> × ${POINTS.great}</span> = ${greats * POINTS.great}</div>
        <div>GOOD: ${goods}<span class="points-math"> × ${POINTS.good}</span> = ${goods * POINTS.good}</div>
        <div>FINE: ${fines}<span class="points-math"> × ${POINTS.fine}</span> = ${fines * POINTS.fine}</div>
        <div>POOR: ${poors}<span class="points-math"> × ${POINTS.poor}</span> = ${poors * POINTS.poor}</div>
        <div>BAD: ${bads}<span class="points-math"> × ${POINTS.bad}</span> = ${bads * POINTS.bad}</div>
    `;
    const monthlyBest = getMonthlyBest();
    const isNewBest = score > monthlyBest && score > 0;
    const alreadySubmitted = hasSubmittedThisMonth();
    if (isNewBest && !alreadySubmitted) {
        // Show initials and submit
        initialsSection.classList.remove('hidden');
        menuFromScoreButton.classList.add('hidden');
        personalBestMessage.textContent = 'NEW PERSONAL BEST!';
        personalBestMessage.classList.remove('hidden');
        // Disable submit button for 0.5 seconds
        submitButton.disabled = true;
        setTimeout(() => {
            submitButton.disabled = false;
        }, 500);
    }
    else {
        // Show only main menu button
        initialsSection.classList.add('hidden');
        menuFromScoreButton.classList.remove('hidden');
        if (alreadySubmitted) {
            personalBestMessage.textContent = `ALREADY SUBMITTED (BEST: ${monthlyBest})`;
        }
        else if (score === 0) {
            personalBestMessage.textContent = 'SCORE SOME POINTS FIRST!';
        }
        else {
            personalBestMessage.textContent = `PERSONAL BEST: ${monthlyBest}`;
        }
        personalBestMessage.classList.remove('hidden');
        // Disable menu button for 1 second
        menuFromScoreButton.disabled = true;
        setTimeout(() => {
            menuFromScoreButton.disabled = false;
        }, 1000);
    }
    showScreenWithFade(scoreScreen);
}
// Cycle initial letter up (A→B→C...→Z→A)
function cycleInitialUp(index) {
    var _a;
    let char = (_a = currentInitials[index]) !== null && _a !== void 0 ? _a : 'A';
    if (char === 'Z') {
        char = 'A';
    }
    else {
        char = String.fromCharCode(char.charCodeAt(0) + 1);
    }
    currentInitials[index] = char;
    const slot = initialSlots[index];
    if (slot) {
        slot.textContent = char;
    }
}
// Cycle initial letter down (A→Z→Y...→B→A)
function cycleInitialDown(index) {
    var _a;
    let char = (_a = currentInitials[index]) !== null && _a !== void 0 ? _a : 'A';
    if (char === 'A') {
        char = 'Z';
    }
    else {
        char = String.fromCharCode(char.charCodeAt(0) - 1);
    }
    currentInitials[index] = char;
    const slot = initialSlots[index];
    if (slot) {
        slot.textContent = char;
    }
}
// Submit score
function submitScore() {
    saveInitials();
    setMonthlyBest(score);
    markSubmittedThisMonth();
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
// Show leaderboard
function showLeaderboard() {
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
// Go to main menu
function goToMainMenu() {
    updateToggleDisplays();
    showScreen(mainMenuScreen);
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Instructions popup
    gotItButton.addEventListener('click', () => {
        markInstructionsSeen();
        goToMainMenu();
    });
    // Main Menu
    startGameButton.addEventListener('click', goToStartScreen);
    helpButton.addEventListener('click', () => {
        showInstructions();
    });
    leaderboardButton.addEventListener('click', showLeaderboard);
    // Toggle handlers
    modeToggle.addEventListener('click', () => {
        gameMode = gameMode === 'sudden-death' ? 'one-tap' : 'sudden-death';
        updateToggleDisplays();
        saveSettings();
    });
    ringToggle.addEventListener('click', () => {
        ringEnabled = !ringEnabled;
        updateToggleDisplays();
        saveSettings();
    });
    // Start Screen
    startScreen.addEventListener('click', handleStartScreenTap);
    startScreen.addEventListener('touchstart', handleStartScreenTap);
    // Gameplay Screen
    gameplayScreen.addEventListener('mousedown', handleGameplayTap);
    gameplayScreen.addEventListener('touchstart', handleGameplayTap);
    // Score Screen
    arrowButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            var _a;
            e.preventDefault();
            const index = parseInt((_a = btn.getAttribute('data-index')) !== null && _a !== void 0 ? _a : '0');
            if (btn.classList.contains('up')) {
                cycleInitialUp(index);
            }
            else {
                cycleInitialDown(index);
            }
        });
    });
    submitButton.addEventListener('click', submitScore);
    menuFromScoreButton.addEventListener('click', goToMainMenu);
    // Leaderboard
    menuFromLeaderboardButton.addEventListener('click', goToMainMenu);
    // Initialize
    detectDevice();
    initUserId();
    loadInitials();
    loadSettings();
    updateToggleDisplays();
    // Show instructions or main menu
    if (hasSeenInstructions()) {
        goToMainMenu();
    }
    else {
        showInstructions();
    }
});
//# sourceMappingURL=game.js.map