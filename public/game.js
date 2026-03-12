"use strict";
// Game state
let timeRemaining = 1.000;
let maxTime = 1.000;
let taps = 0;
let score = 0;
let isRunning = false;
let lastFrameTime = 0;
// Visual state
let ringColor = '#8888aa';
// Game flow state
let lives = 3;
let isReadySetGo = false;
let isShrinking = false;
let streak = 0;
// Score tiers (counts)
let perfects = 0;
let greats = 0;
let goods = 0;
let fines = 0;
let poors = 0;
let bads = 0;
// Actual points earned per tier (after streak multiplier)
let perfectPoints = 0;
let greatPoints = 0;
let goodPoints = 0;
let finePoints = 0;
let poorPoints = 0;
let badPoints = 0;
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
const tierScoreboard = document.getElementById('tier-scoreboard');
const timerContainer = document.getElementById('timer-container');
const maxDisplay = document.getElementById('max-display');
const lifeLost = document.getElementById('life-lost');
const tapFlash = document.getElementById('tap-flash');
const multiplierDisplay = document.getElementById('multiplier-display');
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
// Show hearts during gameplay (always visible)
function updateHeartsVisibility() {
    startHearts.classList.remove('hidden');
    gameplayHearts.classList.remove('hidden');
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
// Return streak multiplier
function getMultiplier() {
    if (streak >= 8)
        return 5;
    if (streak >= 5)
        return 3;
    if (streak >= 2)
        return 2;
    return 1;
}
// Classify a point, apply streak multiplier, and return tier info
function classifyPoint(remaining) {
    let tierLabel;
    let basePoints;
    if (remaining <= 0.005) {
        perfects++;
        basePoints = POINTS.perfect;
        tierLabel = 'PERFECT';
    }
    else if (remaining <= 0.050) {
        greats++;
        basePoints = POINTS.great;
        tierLabel = 'GREAT';
    }
    else if (remaining <= 0.100) {
        goods++;
        basePoints = POINTS.good;
        tierLabel = 'GOOD';
    }
    else if (remaining <= 0.200) {
        fines++;
        basePoints = POINTS.fine;
        tierLabel = 'FINE';
    }
    else if (remaining <= 0.350) {
        poors++;
        basePoints = POINTS.poor;
        tierLabel = 'POOR';
    }
    else {
        bads++;
        basePoints = POINTS.bad;
        tierLabel = 'BAD';
    }
    if (tierLabel === 'PERFECT' || tierLabel === 'GREAT') {
        streak++;
    }
    else {
        streak = 0;
    }
    const multiplier = getMultiplier();
    const points = basePoints * multiplier;
    score += points;
    if (tierLabel === 'PERFECT')
        perfectPoints += points;
    else if (tierLabel === 'GREAT')
        greatPoints += points;
    else if (tierLabel === 'GOOD')
        goodPoints += points;
    else if (tierLabel === 'FINE')
        finePoints += points;
    else if (tierLabel === 'POOR')
        poorPoints += points;
    else
        badPoints += points;
    updateTierScoreboard();
    flashTierRow(tierLabel);
    return { tierLabel, multiplier, points };
}
// Update all rows in the tier scoreboard
function updateTierScoreboard() {
    const data = [
        { tier: 'PERFECT', count: perfects, pts: perfectPoints },
        { tier: 'GREAT', count: greats, pts: greatPoints },
        { tier: 'GOOD', count: goods, pts: goodPoints },
        { tier: 'FINE', count: fines, pts: finePoints },
        { tier: 'POOR', count: poors, pts: poorPoints },
        { tier: 'BAD', count: bads, pts: badPoints },
    ];
    for (const { tier, count, pts } of data) {
        const row = tierScoreboard.querySelector(`[data-tier="${tier}"]`);
        if (!row)
            continue;
        row.querySelector('.tier-count').textContent = count.toString();
        row.querySelector('.tier-total').textContent = pts.toString();
    }
}
// Briefly flash a tier row when it scores
function flashTierRow(tierLabel) {
    const row = tierScoreboard.querySelector(`[data-tier="${tierLabel}"]`);
    if (!row)
        return;
    row.classList.remove('tier-flash');
    void row.offsetWidth;
    row.classList.add('tier-flash');
    setTimeout(() => row.classList.remove('tier-flash'), 400);
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
    perfectPoints = 0;
    greatPoints = 0;
    goodPoints = 0;
    finePoints = 0;
    poorPoints = 0;
    badPoints = 0;
    isRunning = false;
    lastFrameTime = 0;
    lives = 3;
    isReadySetGo = false;
    isShrinking = false;
    streak = 0;
    // Reset UI elements
    instruction.textContent = 'tap anywhere';
    instruction.classList.remove('hidden');
    countdown.classList.add('hidden');
    gameplayScreen.querySelectorAll('.debt-popup').forEach(el => el.remove());
    gameplayScreen.querySelectorAll('.too-early-msg').forEach(el => el.remove());
    document.querySelectorAll('.celebration-msg').forEach(el => el.remove());
    maxDisplay.classList.add('hidden');
    lifeLost.classList.add('hidden');
    timerDisplay.classList.remove('timer-shrinking');
    timerRing.style.setProperty('--ring-thickness', '4px');
    ringColor = '#8888aa';
    timerRing.style.setProperty('--ring-track-color', ringColor);
    gameplayScreen.style.backgroundColor = '#0a0a12';
    multiplierDisplay.classList.add('hidden');
    multiplierDisplay.classList.remove('mult-5x');
    updateTierScoreboard();
    updateHeartsDisplay();
}
// Shift gameplay background color based on tap count
// tap 0: #0a0a12 (dark blue-gray) → tap 10: #1a0a2e (deep purple) → tap 20+: #2a0a0a (dark red)
function updateGameplayBackground() {
    const t = Math.min(taps, 20);
    let r, b;
    if (t <= 10) {
        const s = t / 10;
        r = Math.round(0x0a + s * (0x1a - 0x0a)); // 10 → 26
        b = Math.round(0x12 + s * (0x2e - 0x12)); // 18 → 46
    }
    else {
        const s = (t - 10) / 10;
        r = Math.round(0x1a + s * (0x2a - 0x1a)); // 26 → 42
        b = Math.round(0x2e + s * (0x0a - 0x2e)); // 46 → 10
    }
    gameplayScreen.style.backgroundColor = `rgb(${r},10,${b})`;
}
// Shift ring color based on tap count
// tap 0: #8888aa (cool gray) → tap 10: #aa66cc (muted purple) → tap 20+: #cc4444 (red)
function updateRingColor() {
    const t = Math.min(taps, 20);
    let r, g, b;
    if (t <= 10) {
        const s = t / 10;
        r = Math.round(136 + s * 34); // 136 → 170
        g = Math.round(136 - s * 34); // 136 → 102
        b = Math.round(170 + s * 34); // 170 → 204
    }
    else {
        const s = (t - 10) / 10;
        r = Math.round(170 + s * 34); // 170 → 204
        g = Math.round(102 - s * 34); // 102 → 68
        b = Math.round(204 - s * 136); // 204 → 68
    }
    ringColor = `rgb(${r},${g},${b})`;
    timerRing.style.setProperty('--ring-track-color', ringColor);
}
// Update ring thickness based on tap count (4px at tap 1, +1.6px per tap, max 36px)
function updateRingThickness() {
    const thickness = Math.min(4 + (taps - 1) * 1.6, 36);
    timerRing.style.setProperty('--ring-thickness', `${thickness}px`);
}
// Update the timer ring visualization
function updateRing() {
    const percent = timeRemaining * 100;
    const color = isShrinking ? '#ff6b6b' : ringColor;
    timerRing.style.background = `conic-gradient(
        from 0deg,
        ${color} 0%,
        ${color} ${percent}%,
        transparent ${percent}%
    )`;
}
// Update gameplay display
function updateDisplay() {
    timerDisplay.textContent = timeRemaining.toFixed(3);
    scoreDisplay.textContent = score.toString();
    updateRing();
    if (timeRemaining < 0.100) {
        timerDisplay.style.color = '#ef4444';
    }
    else if (timeRemaining < 0.300) {
        timerDisplay.style.color = '#fbbf24';
    }
    else {
        timerDisplay.style.color = '';
    }
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
// Handle a life lost in Sudden Death mode
async function handleSuddenDeathLifeLost() {
    lives--;
    updateHeartsDisplay();
    if (lives <= 0) {
        endGame();
        return;
    }
    // Reset streak on life loss
    streak = 0;
    updateMultiplierDisplay(1);
    // Show LIFE LOST for 1.5 seconds
    lifeLost.classList.remove('hidden');
    instruction.classList.add('hidden');
    await new Promise(resolve => setTimeout(resolve, 1500));
    lifeLost.classList.add('hidden');
    // Fill timer back up to maxTime, then run READY/SET/GO before resuming
    await animateFillUp(maxTime);
    await showReadySetGo();
    instruction.textContent = 'tap anywhere';
    instruction.classList.remove('hidden');
    isRunning = true;
    lastFrameTime = 0;
    requestAnimationFrame(gameLoop);
}
// Handle when timer reaches zero
function handleTimerZero() {
    handleSuddenDeathLifeLost();
}
// Show READY/SET/GO countdown and resolve when complete
function showReadySetGo() {
    return new Promise((resolve) => {
        countdown.classList.remove('hidden');
        countdown.textContent = 'READY';
        setTimeout(() => {
            countdown.textContent = 'SET';
            setTimeout(() => {
                countdown.textContent = 'GO!';
                setTimeout(() => {
                    countdown.classList.add('hidden');
                    resolve();
                }, 400);
            }, 800);
        }, 800);
    });
}
// Start ready-set-go sequence for initial game start
async function startReadySetGo() {
    isReadySetGo = true;
    instruction.classList.add('hidden');
    await showReadySetGo();
    isReadySetGo = false;
    instruction.textContent = 'tap anywhere';
    instruction.classList.remove('hidden');
    isRunning = true;
    lastFrameTime = 0;
    updateMaxDisplay();
    requestAnimationFrame(gameLoop);
}
// Go to start screen (pre-game)
function goToStartScreen() {
    resetGame();
    updateHeartsVisibility();
    showScreen(startScreen);
}
// Start the game (from start screen tap)
function startGame() {
    showScreen(gameplayScreen);
    gameplayScreen.style.backgroundColor = '#0a0a12';
    ringColor = '#8888aa';
    timerRing.style.setProperty('--ring-track-color', ringColor);
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
    if (isReadySetGo)
        return;
    handleSuddenDeathTap();
}
// Brief full-screen flash to confirm a tap registered; color varies by tier
function triggerFlash(tier) {
    tapFlash.classList.remove('flash', 'flash-perfect', 'flash-great');
    void tapFlash.offsetWidth; // force reflow to restart animation
    if (tier === 'PERFECT') {
        tapFlash.classList.add('flash-perfect');
    }
    else if (tier === 'GREAT') {
        tapFlash.classList.add('flash-great');
    }
    else {
        tapFlash.classList.add('flash');
    }
}
// Show full-screen celebration for PERFECT or GREAT taps
function showCelebration(tier) {
    const el = document.createElement('div');
    el.className = `celebration-msg celebration-${tier.toLowerCase()}`;
    el.textContent = `${tier}!`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
}
// Show "TOO EARLY!" above the timer for early taps
function showTooEarly() {
    const el = document.createElement('div');
    el.className = 'too-early-msg';
    el.textContent = 'TOO EARLY!';
    const containerRect = timerContainer.getBoundingClientRect();
    const screenRect = gameplayScreen.getBoundingClientRect();
    el.style.top = `${containerRect.top - screenRect.top}px`;
    el.style.left = `${containerRect.left + containerRect.width / 2 - screenRect.left}px`;
    gameplayScreen.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
}
// Spawn a floating debt popup showing points earned and time deducted
function showDebt(amount, points, multiplier) {
    const popup = document.createElement('div');
    popup.className = 'debt-popup';
    const pointsLine = points > 0
        ? `<div class="debt-points">${multiplier > 1 ? `+${points} <span class="debt-multiplier">x${multiplier}</span>` : `+${points}`}</div>`
        : '';
    popup.innerHTML = `${pointsLine}<div class="debt-amount">-${amount.toFixed(3)}</div>`;
    // Anchor to the bottom-center of the timer container
    const containerRect = timerContainer.getBoundingClientRect();
    const screenRect = gameplayScreen.getBoundingClientRect();
    popup.style.top = `${containerRect.bottom - screenRect.top}px`;
    popup.style.left = `${containerRect.left + containerRect.width / 2 - screenRect.left}px`;
    gameplayScreen.appendChild(popup);
    popup.addEventListener('animationend', () => popup.remove());
}
// Animate the timer between its current value and target (Bounce mode).
// Fills up if target > current (good tap), shrinks down if target < current (early tap).
// Duration is proportional: 1.000 of change takes 1000ms, minimum 100ms.
function animateFillUp(target) {
    return new Promise((resolve) => {
        const startValue = timeRemaining;
        const duration = Math.max(Math.abs(target - startValue) * 1000, 100);
        const shrinking = target < startValue;
        if (target === startValue) {
            resolve();
            return;
        }
        if (shrinking) {
            isShrinking = true;
            timerDisplay.classList.add('timer-shrinking');
        }
        let startTime = null;
        function frame(currentTime) {
            if (startTime === null)
                startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            timeRemaining = startValue + (target - startValue) * progress;
            updateDisplay();
            if (progress < 1) {
                requestAnimationFrame(frame);
            }
            else {
                timeRemaining = target;
                if (shrinking) {
                    isShrinking = false;
                    timerDisplay.classList.remove('timer-shrinking');
                }
                updateDisplay();
                resolve();
            }
        }
        requestAnimationFrame(frame);
    });
}
// Show/update the streak multiplier display
function updateMultiplierDisplay(multiplier) {
    if (multiplier <= 1) {
        multiplierDisplay.classList.add('hidden');
        multiplierDisplay.classList.remove('mult-5x');
        return;
    }
    multiplierDisplay.textContent = `x${multiplier}`;
    multiplierDisplay.classList.remove('hidden', 'mult-5x');
    if (multiplier >= 5) {
        multiplierDisplay.style.fontSize = '16vmin';
        multiplierDisplay.style.color = '#ff6b6b';
        multiplierDisplay.classList.add('mult-5x');
    }
    else if (multiplier >= 3) {
        multiplierDisplay.style.fontSize = '12vmin';
        multiplierDisplay.style.color = '#ffd700';
    }
    else {
        multiplierDisplay.style.fontSize = '8vmin';
        multiplierDisplay.style.color = '#4ade80';
    }
}
// Show/update the max time display
function updateMaxDisplay() {
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
    updateRingThickness();
    updateRingColor();
    updateGameplayBackground();
    const debt = timeRemaining;
    const { tierLabel, multiplier, points } = classifyPoint(debt);
    triggerFlash(tierLabel);
    if (tierLabel === 'PERFECT' || tierLabel === 'GREAT')
        showCelebration(tierLabel);
    updateDisplay();
    showDebt(debt, points, multiplier);
    updateMultiplierDisplay(multiplier);
    if (debt > maxTime * 0.5)
        showTooEarly();
    const freezeMs = tierLabel === 'PERFECT' ? 1400 : tierLabel === 'GREAT' ? 900 : 400;
    // Freeze, then apply debt, run fill-up and READY/SET/GO in parallel, then resume
    setTimeout(async () => {
        maxTime = maxTime - debt;
        updateMaxDisplay();
        instruction.classList.add('hidden');
        await Promise.all([animateFillUp(maxTime), showReadySetGo()]);
        instruction.textContent = 'tap anywhere';
        instruction.classList.remove('hidden');
        isRunning = true;
        lastFrameTime = 0;
        requestAnimationFrame(gameLoop);
    }, freezeMs);
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
    // Show instructions or main menu
    if (hasSeenInstructions()) {
        goToMainMenu();
    }
    else {
        showInstructions();
    }
});
//# sourceMappingURL=game.js.map