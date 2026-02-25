// Game state
var timeRemaining = 1.000;
var maxTime = 1.000;
var taps = 0;
var score = 0;
var isRunning = false;
var lastFrameTime = 0;
// Score tiers
var perfects = 0;
var greats = 0;
var goods = 0;
var fines = 0;
var poors = 0;
var bads = 0;
// Point values
var POINTS = {
    perfect: 500,
    great: 50,
    good: 25,
    fine: 10,
    poor: 5,
    bad: 0
};
// Player data
var currentInitials = ['A', 'A', 'A'];
var deviceType = 'desktop';
var userId = '';
// DOM elements - Screens
var instructionsPopup = document.getElementById('instructions-popup');
var startScreen = document.getElementById('start-screen');
var gameplayScreen = document.getElementById('gameplay-screen');
var gameoverScreen = document.getElementById('gameover-screen');
var leaderboardScreen = document.getElementById('leaderboard-screen');
// DOM elements - Instructions
var gotItButton = document.getElementById('got-it-button');
// DOM elements - Start screen
var startButton = document.getElementById('start-button');
// DOM elements - Gameplay
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
// DOM elements - Game over
var finalScoreDisplay = document.getElementById('final-score');
var finalTapsDisplay = document.getElementById('final-taps');
var tierBreakdown = document.getElementById('tier-breakdown');
var initialSlots = document.querySelectorAll('.initial-slot');
var arrowButtons = document.querySelectorAll('.arrow-btn');
var submitButton = document.getElementById('submit-button');
// DOM elements - Leaderboard
var leaderboardList = document.getElementById('leaderboard-list');
var newGameButton = document.getElementById('newgame-button');
// Detect device type
function detectDevice() {
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    deviceType = isMobile ? 'mobile' : 'desktop';
}
// Generate or retrieve user ID
function initUserId() {
    var stored = localStorage.getItem('timedebt_userid');
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
    var stored = localStorage.getItem('timedebt_initials');
    if (stored) {
        currentInitials = stored.split('');
        initialSlots.forEach(function (slot, index) {
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
    var deltaTime = (currentTime - lastFrameTime) / 1000;
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
    tierBreakdown.innerHTML = "\n        <div>PERFECT (\u22640.005): ".concat(perfects, " \u00D7 ").concat(POINTS.perfect, " = ").concat(perfects * POINTS.perfect, "</div>\n        <div>GREAT (\u22640.050): ").concat(greats, " \u00D7 ").concat(POINTS.great, " = ").concat(greats * POINTS.great, "</div>\n        <div>GOOD (\u22640.100): ").concat(goods, " \u00D7 ").concat(POINTS.good, " = ").concat(goods * POINTS.good, "</div>\n        <div>FINE (\u22640.200): ").concat(fines, " \u00D7 ").concat(POINTS.fine, " = ").concat(fines * POINTS.fine, "</div>\n        <div>POOR (\u22640.350): ").concat(poors, " \u00D7 ").concat(POINTS.poor, " = ").concat(poors * POINTS.poor, "</div>\n        <div>BAD (\u22640.500): ").concat(bads, " \u00D7 ").concat(POINTS.bad, " = ").concat(bads * POINTS.bad, "</div>\n    ");
    // Disable submit button for 0.5 seconds
    submitButton.disabled = true;
    setTimeout(function () {
        submitButton.disabled = false;
    }, 500);
    showScreen(gameoverScreen);
}
// Cycle initial letter up (A→B→C...→Z→A)
function cycleInitialUp(index) {
    var _a;
    var char = (_a = currentInitials[index]) !== null && _a !== void 0 ? _a : 'A';
    if (char === 'Z') {
        char = 'A';
    }
    else {
        char = String.fromCharCode(char.charCodeAt(0) + 1);
    }
    currentInitials[index] = char;
    var slot = initialSlots[index];
    if (slot) {
        slot.textContent = char;
    }
}
// Cycle initial letter down (A→Z→Y...→B→A)
function cycleInitialDown(index) {
    var _a;
    var char = (_a = currentInitials[index]) !== null && _a !== void 0 ? _a : 'A';
    if (char === 'A') {
        char = 'Z';
    }
    else {
        char = String.fromCharCode(char.charCodeAt(0) - 1);
    }
    currentInitials[index] = char;
    var slot = initialSlots[index];
    if (slot) {
        slot.textContent = char;
    }
}
// Submit score (placeholder for Supabase integration)
function submitScore() {
    saveInitials();
    var scoreData = {
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
    leaderboardList.innerHTML = "\n        <div class=\"leaderboard-row\">\n            <span class=\"leaderboard-rank\">1</span>\n            <span class=\"leaderboard-initials\">".concat(currentInitials.join(''), "</span>\n            <span class=\"leaderboard-device\">").concat(deviceType === 'mobile' ? '📱' : '🖥️', "</span>\n            <span class=\"leaderboard-points\">").concat(score, "</span>\n            <span class=\"leaderboard-taps\">").concat(taps, "</span>\n        </div>\n    ");
    showScreen(leaderboardScreen);
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Event listeners
    gotItButton.addEventListener('click', function () {
        markInstructionsSeen();
        showScreen(startScreen);
    });
    startButton.addEventListener('click', startGame);
    gameplayScreen.addEventListener('click', handleGameplayTap);
    gameplayScreen.addEventListener('touchstart', handleGameplayTap);
    arrowButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            var _a;
            e.preventDefault();
            var index = parseInt((_a = btn.getAttribute('data-index')) !== null && _a !== void 0 ? _a : '0');
            if (btn.classList.contains('up')) {
                cycleInitialUp(index);
            }
            else {
                cycleInitialDown(index);
            }
        });
    });
    submitButton.addEventListener('click', submitScore);
    newGameButton.addEventListener('click', function () {
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
