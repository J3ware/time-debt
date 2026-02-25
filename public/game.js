"use strict";
// Game state
let timeRemaining = 1.000;
let maxTime = 1.000;
let taps = 0;
let score = 0;
let isRunning = false;
let lastFrameTime = 0;
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
// Player data
let currentInitials = ['A', 'A', 'A'];
let deviceType = 'desktop';
let userId = '';
// DOM elements - Screens
const instructionsPopup = document.getElementById('instructions-popup');
const startScreen = document.getElementById('start-screen');
const gameplayScreen = document.getElementById('gameplay-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');
// DOM elements - Instructions
const gotItButton = document.getElementById('got-it-button');
// DOM elements - Start screen
const startButton = document.getElementById('start-button');
// DOM elements - Gameplay
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
// DOM elements - Game over
const finalScoreDisplay = document.getElementById('final-score');
const finalTapsDisplay = document.getElementById('final-taps');
const tierBreakdown = document.getElementById('tier-breakdown');
const initialSlots = document.querySelectorAll('.initial-slot');
const arrowButtons = document.querySelectorAll('.arrow-btn');
const submitButton = document.getElementById('submit-button');
const initialsSection = document.getElementById('initials-submit-row');
const newGameOnlyButton = document.getElementById('newgame-only-button');
const personalBestMessage = document.getElementById('personal-best-message');
// DOM elements - Leaderboard
const leaderboardList = document.getElementById('leaderboard-list');
const newGameButton = document.getElementById('newgame-button');
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
// Show a specific screen
function showScreen(screen) {
    instructionsPopup.classList.add('hidden');
    startScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}
// Show instructions popup
function showInstructions() {
    startScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    instructionsPopup.classList.remove('hidden');
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
}
// Update gameplay display
function updateDisplay() {
    timerDisplay.textContent = timeRemaining.toFixed(3);
    scoreDisplay.textContent = score.toString();
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
        endGame();
        return;
    }
    updateDisplay();
    requestAnimationFrame(gameLoop);
}
// Start the game
function startGame() {
    resetGame();
    showScreen(gameplayScreen);
    isRunning = true;
    updateDisplay();
    requestAnimationFrame(gameLoop);
}
// Handle tap during gameplay
function handleGameplayTap(e) {
    if (!isRunning)
        return;
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
function endGame() {
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
        newGameOnlyButton.classList.add('hidden');
        personalBestMessage.textContent = 'NEW PERSONAL BEST!';
        personalBestMessage.classList.remove('hidden');
        // Disable submit button for 0.5 seconds
        submitButton.disabled = true;
        setTimeout(() => {
            submitButton.disabled = false;
        }, 500);
    }
    else {
        // Show only new game button
        initialsSection.classList.add('hidden');
        newGameOnlyButton.classList.remove('hidden');
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
        // Disable new game button for 1 second
        newGameOnlyButton.disabled = true;
        setTimeout(() => {
            newGameOnlyButton.disabled = false;
        }, 1000);
    }
    showScreen(gameoverScreen);
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
// Show leaderboard (placeholder for Supabase integration)
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
    newGameButton.addEventListener('click', () => {
        resetGame();
        showScreen(startScreen);
    });
    newGameOnlyButton.addEventListener('click', () => {
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
    }
    else {
        showInstructions();
    }
});
