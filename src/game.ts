// Game state
let timeRemaining: number = 1.000;
let maxTime: number = 1.000;
let taps: number = 0;
let score: number = 0;
let isRunning: boolean = false;
let lastFrameTime: number = 0;

// One Tap mode state
let lives: number = 3;
let isLocked: boolean = false;
let isCountingDown: boolean = false;
let isReadySetGo: boolean = false;

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

// Settings
let gameMode: 'sudden-death' | 'one-tap' = 'sudden-death';
let ringEnabled: boolean = true;

// Player data
let currentInitials: string[] = ['A', 'A', 'A'];
let deviceType: 'desktop' | 'mobile' = 'desktop';
let userId: string = '';

// DOM elements - Screens
const instructionsPopup = document.getElementById('instructions-popup') as HTMLElement;
const mainMenuScreen = document.getElementById('main-menu-screen') as HTMLElement;
const startScreen = document.getElementById('start-screen') as HTMLElement;
const gameplayScreen = document.getElementById('gameplay-screen') as HTMLElement;
const gameoverScreen = document.getElementById('gameover-screen') as HTMLElement;
const scoreScreen = document.getElementById('score-screen') as HTMLElement;
const leaderboardScreen = document.getElementById('leaderboard-screen') as HTMLElement;

// DOM elements - Instructions
const gotItButton = document.getElementById('got-it-button') as HTMLElement;

// DOM elements - Main Menu
const startGameButton = document.getElementById('start-game-button') as HTMLElement;
const helpButton = document.getElementById('help-button') as HTMLElement;
const leaderboardButton = document.getElementById('leaderboard-button') as HTMLElement;
const modeToggle = document.getElementById('mode-toggle') as HTMLElement;
const ringToggle = document.getElementById('ring-toggle') as HTMLElement;

// DOM elements - Start Screen
const startTimerRing = document.getElementById('start-timer-ring') as HTMLElement;
const startHearts = document.getElementById('start-hearts') as HTMLElement;
const startInstruction = document.getElementById('start-instruction') as HTMLElement;

// DOM elements - Gameplay
const timerDisplay = document.getElementById('timer') as HTMLElement;
const scoreDisplay = document.getElementById('score') as HTMLElement;
const timerRing = document.getElementById('timer-ring') as HTMLElement;
const gameplayHearts = document.getElementById('gameplay-hearts') as HTMLElement;
const instruction = document.getElementById('instruction') as HTMLElement;
const countdown = document.getElementById('countdown') as HTMLElement;
const debtDisplay = document.getElementById('debt-display') as HTMLElement;
const lifeLost = document.getElementById('life-lost') as HTMLElement;

// DOM elements - Score Screen
const finalScoreDisplay = document.getElementById('final-score') as HTMLElement;
const finalTapsDisplay = document.getElementById('final-taps') as HTMLElement;
const tierBreakdown = document.getElementById('tier-breakdown') as HTMLElement;
const initialSlots = document.querySelectorAll('.initial-slot');
const arrowButtons = document.querySelectorAll('.arrow-btn');
const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
const initialsSection = document.getElementById('initials-submit-row') as HTMLElement;
const menuFromScoreButton = document.getElementById('menu-from-score-button') as HTMLButtonElement;
const personalBestMessage = document.getElementById('personal-best-message') as HTMLElement;

// DOM elements - Leaderboard
const leaderboardList = document.getElementById('leaderboard-list') as HTMLElement;
const menuFromLeaderboardButton = document.getElementById('menu-from-leaderboard-button') as HTMLElement;

// Get current month key (e.g., "2026-02")
function getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Get monthly personal best
function getMonthlyBest(): number {
    const monthKey = getCurrentMonthKey();
    const stored = localStorage.getItem(`timedebt_best_${monthKey}`);
    return stored ? parseInt(stored, 10) : 0;
}

// Set monthly personal best
function setMonthlyBest(newScore: number): void {
    const monthKey = getCurrentMonthKey();
    localStorage.setItem(`timedebt_best_${monthKey}`, newScore.toString());
}

// Check if user has already submitted this month
function hasSubmittedThisMonth(): boolean {
    const monthKey = getCurrentMonthKey();
    return localStorage.getItem(`timedebt_submitted_${monthKey}`) === 'true';
}

// Mark that user has submitted this month
function markSubmittedThisMonth(): void {
    const monthKey = getCurrentMonthKey();
    localStorage.setItem(`timedebt_submitted_${monthKey}`, 'true');
}

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

// Load settings from localStorage
function loadSettings(): void {
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
function saveSettings(): void {
    localStorage.setItem('timedebt_mode', gameMode);
    localStorage.setItem('timedebt_ring', ringEnabled.toString());
}

// Show a specific screen (no fade)
function showScreen(screen: HTMLElement): void {
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
function showScreenWithFade(screen: HTMLElement): void {
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
function showInstructions(): void {
    instructionsPopup.classList.remove('hidden');
}

// Update ring visibility based on setting
function updateRingVisibility(): void {
    if (ringEnabled) {
        timerRing.classList.remove('hidden');
        startTimerRing.classList.remove('hidden');
    } else {
        timerRing.classList.add('hidden');
        startTimerRing.classList.add('hidden');
    }
}

// Update hearts visibility based on game mode
function updateHeartsVisibility(): void {
    if (gameMode === 'one-tap') {
        startHearts.classList.remove('hidden');
        gameplayHearts.classList.remove('hidden');
    } else {
        startHearts.classList.add('hidden');
        gameplayHearts.classList.add('hidden');
    }
}

// Update hearts display based on lives remaining
function updateHeartsDisplay(): void {
    const startHeartElements = startHearts.querySelectorAll('.heart');
    const gameplayHeartElements = gameplayHearts.querySelectorAll('.heart');
    
    startHeartElements.forEach((heart, index) => {
        if (index < lives) {
            heart.classList.remove('lost');
        } else {
            heart.classList.add('lost');
        }
    });
    
    gameplayHeartElements.forEach((heart, index) => {
        if (index < lives) {
            heart.classList.remove('lost');
        } else {
            heart.classList.add('lost');
        }
    });
}

// Update toggle displays
function updateToggleDisplays(): void {
    modeToggle.textContent = gameMode === 'sudden-death' ? 'SUDDEN DEATH' : 'ONE TAP';
    ringToggle.textContent = ringEnabled ? 'ON' : 'OFF';
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
    lives = 3;
    isLocked = false;
    isCountingDown = false;
    isReadySetGo = false;
    
    // Reset UI elements
    instruction.textContent = 'tap anywhere';
    instruction.classList.remove('hidden');
    countdown.classList.add('hidden');
    debtDisplay.classList.remove('show-debt');
    lifeLost.classList.add('hidden');
    
    updateHeartsDisplay();
}

// Update the timer ring visualization
function updateRing(): void {
    if (!ringEnabled) return;
    
    const percent = timeRemaining * 100;
    
    timerRing.style.background = `conic-gradient(
        from 0deg,
        #e0e0e0 0%,
        #e0e0e0 ${percent}%,
        transparent ${percent}%
    )`;
}

// Update gameplay display
function updateDisplay(): void {
    timerDisplay.textContent = timeRemaining.toFixed(3);
    scoreDisplay.textContent = score.toString();
    updateRing();
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
        handleTimerZero();
        return;
    }

    updateDisplay();
    requestAnimationFrame(gameLoop);
}

// Handle when timer reaches zero
function handleTimerZero(): void {
    if (gameMode === 'sudden-death') {
        endGame();
    } else {
        // One Tap mode - lose a life
        lives--;
        updateHeartsDisplay();
        
        if (lives <= 0) {
            endGame();
        } else {
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
function startLockoutPeriod(): void {
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
function startReadySetGo(): void {
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
                requestAnimationFrame(gameLoop);
            }, 400);
        }, 800);
    }, 800);
}

// Start countdown sequence (3, 2, 1)
function startCountdown(): void {
    isCountingDown = true;
    instruction.classList.add('hidden');
    countdown.classList.remove('hidden');
    
    let count = 3;
    countdown.textContent = count.toString();
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = count.toString();
        } else {
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
function goToStartScreen(): void {
    resetGame();
    updateRingVisibility();
    updateHeartsVisibility();
    showScreen(startScreen);
}

// Start the game (from start screen tap)
function startGame(): void {
    showScreen(gameplayScreen);
    updateRingVisibility();
    updateHeartsVisibility();
    updateDisplay();
    startReadySetGo();
}

// Handle tap on start screen
function handleStartScreenTap(e: Event): void {
    e.preventDefault();
    startGame();
}

// Handle tap during gameplay
function handleGameplayTap(e: Event): void {
    e.preventDefault();
    
    // Ignore taps during lockout, countdown, or ready-set-go
    if (isLocked || isCountingDown || isReadySetGo) return;
    
    if (gameMode === 'sudden-death') {
        handleSuddenDeathTap();
    } else {
        handleOneTapTap();
    }
}

// Return tier label and points for a given remaining time
function getTierInfo(remaining: number): { label: string; points: number } {
    if (remaining <= 0.005) return { label: 'PERFECT', points: POINTS.perfect };
    if (remaining <= 0.050) return { label: 'GREAT',   points: POINTS.great };
    if (remaining <= 0.100) return { label: 'GOOD',    points: POINTS.good };
    if (remaining <= 0.200) return { label: 'FINE',    points: POINTS.fine };
    if (remaining <= 0.350) return { label: 'POOR',    points: POINTS.poor };
    return                         { label: 'BAD',     points: POINTS.bad };
}

// Flash tier, points, and debt amount after a tap
function showDebt(amount: number, tierLabel: string, points: number): void {
    debtDisplay.innerHTML = `
        <div class="debt-tier">${tierLabel}</div>
        <div class="debt-points">+${points}</div>
        <div class="debt-amount">-${amount.toFixed(3)}</div>
    `;
    debtDisplay.classList.remove('show-debt');
    void debtDisplay.offsetWidth; // force reflow to restart animation
    debtDisplay.classList.add('show-debt');
}

// Handle tap in Sudden Death mode
function handleSuddenDeathTap(): void {
    if (!isRunning) return;

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
        isRunning = true;
        lastFrameTime = 0;
        requestAnimationFrame(gameLoop);
    }, 80);
}

// Handle tap in One Tap mode
function handleOneTapTap(): void {
    if (isRunning) {
        // First tap - stop the clock
        isRunning = false;
        taps++;
        classifyPoint(timeRemaining);
        
        // Accumulate debt (but don't update display yet - show the tap result)
        maxTime = maxTime - timeRemaining;
        
        // Start lockout period (display still shows the time they tapped at)
        startLockoutPeriod();
    } else if (!isLocked && !isCountingDown) {
        // Second tap (after lockout) - start countdown
        // Now update to new maxTime before countdown
        timeRemaining = maxTime;
        updateDisplay();
        startCountdown();
    }
}

// End the game - show game over screen, then transition to score screen
function endGame(): void {
    showScreen(gameoverScreen);
    
    // After 1 second, fade to score screen
    setTimeout(() => {
        showScoreScreen();
    }, 1000);
}

// Show the score screen with fade
function showScoreScreen(): void {
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
    } else {
        // Show only main menu button
        initialsSection.classList.add('hidden');
        menuFromScoreButton.classList.remove('hidden');
        
        if (alreadySubmitted) {
            personalBestMessage.textContent = `ALREADY SUBMITTED (BEST: ${monthlyBest})`;
        } else if (score === 0) {
            personalBestMessage.textContent = 'SCORE SOME POINTS FIRST!';
        } else {
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

// Submit score
function submitScore(): void {
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

// Go to main menu
function goToMainMenu(): void {
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
    } else {
        showInstructions();
    }
});