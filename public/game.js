// Game state
var timeRemaining = 1.000;
var maxTime = 1.000;
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
// Player data
var currentInitials = ['A', 'A', 'A'];
var deviceType = 'desktop';
var userId = '';
// DOM elements - Screens
var startScreen = document.getElementById('start-screen');
var gameplayScreen = document.getElementById('gameplay-screen');
var gameoverScreen = document.getElementById('gameover-screen');
var leaderboardScreen = document.getElementById('leaderboard-screen');
// DOM elements - Start screen
var startButton = document.getElementById('start-button');
// DOM elements - Gameplay
var timerDisplay = document.getElementById('timer');
var scoreDisplay = document.getElementById('score');
// DOM elements - Game over
var finalScoreDisplay = document.getElementById('final-score');
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
// Show a specific screen
function showScreen(screen) {
    startScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}
// Classify a point based on remaining time
function classifyPoint(remaining) {
    if (remaining <= 0.001) {
        perfects++;
    }
    else if (remaining <= 0.010) {
        greats++;
    }
    else if (remaining <= 0.050) {
        goods++;
    }
    else if (remaining <= 0.090) {
        fines++;
    }
    else if (remaining <= 0.150) {
        poors++;
    }
    else if (remaining <= 0.500) {
        bads++;
    }
}
// Reset game state
function resetGame() {
    timeRemaining = 1.000;
    maxTime = 1.000;
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
    score++;
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
    tierBreakdown.innerHTML = "\n        <div>PERFECT (\u22640.001): ".concat(perfects, "</div>\n        <div>GREAT (\u22640.010): ").concat(greats, "</div>\n        <div>GOOD (\u22640.050): ").concat(goods, "</div>\n        <div>FINE (\u22640.090): ").concat(fines, "</div>\n        <div>POOR (\u22640.150): ").concat(poors, "</div>\n        <div>BAD (\u22640.500): ").concat(bads, "</div>\n    ");
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
        totalPoints: score,
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
    leaderboardList.innerHTML = "\n        <div class=\"leaderboard-row\">\n            <span class=\"leaderboard-rank\">1</span>\n            <span class=\"leaderboard-initials\">".concat(currentInitials.join(''), "</span>\n            <span class=\"leaderboard-device\">").concat(deviceType === 'mobile' ? '📱' : '🖥️', "</span>\n            <span class=\"leaderboard-points\">").concat(score, "</span>\n            <span class=\"leaderboard-perfects\">").concat(perfects, "</span>\n            <span class=\"leaderboard-greats\">").concat(greats, "</span>\n        </div>\n    ");
    showScreen(leaderboardScreen);
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Event listeners
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
});
