// Game state
let timeRemaining: number = 1.000;
let maxTime: number = 1.000;
let taps: number = 0;
let score: number = 0;
let isRunning: boolean = false;
let lastFrameTime: number = 0;

// Game flow state
let lives: number = 3;
let isReadySetGo: boolean = false;
let isShrinking: boolean = false;

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
const tierScoreboard = document.getElementById('tier-scoreboard') as HTMLElement;
const timerContainer = document.getElementById('timer-container') as HTMLElement;
const maxDisplay = document.getElementById('max-display') as HTMLElement;
const lifeLost = document.getElementById('life-lost') as HTMLElement;
const tapFlash = document.getElementById('tap-flash') as HTMLElement;

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

// Show hearts during gameplay (always visible)
function updateHeartsVisibility(): void {
    startHearts.classList.remove('hidden');
    gameplayHearts.classList.remove('hidden');
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

// Classify a point based on remaining time, add points, and return the tier label
function classifyPoint(remaining: number): string {
    let tierLabel: string;
    if (remaining <= 0.005) {
        perfects++; score += POINTS.perfect; tierLabel = 'PERFECT';
    } else if (remaining <= 0.050) {
        greats++;   score += POINTS.great;   tierLabel = 'GREAT';
    } else if (remaining <= 0.100) {
        goods++;    score += POINTS.good;    tierLabel = 'GOOD';
    } else if (remaining <= 0.200) {
        fines++;    score += POINTS.fine;    tierLabel = 'FINE';
    } else if (remaining <= 0.350) {
        poors++;    score += POINTS.poor;    tierLabel = 'POOR';
    } else {
        bads++;     score += POINTS.bad;     tierLabel = 'BAD';
    }
    updateTierScoreboard();
    flashTierRow(tierLabel);
    return tierLabel;
}

// Update all rows in the tier scoreboard
function updateTierScoreboard(): void {
    const data = [
        { tier: 'PERFECT', count: perfects, pts: perfects * POINTS.perfect },
        { tier: 'GREAT',   count: greats,   pts: greats   * POINTS.great },
        { tier: 'GOOD',    count: goods,    pts: goods    * POINTS.good },
        { tier: 'FINE',    count: fines,    pts: fines    * POINTS.fine },
        { tier: 'POOR',    count: poors,    pts: poors    * POINTS.poor },
        { tier: 'BAD',     count: bads,     pts: bads     * POINTS.bad },
    ];
    for (const { tier, count, pts } of data) {
        const row = tierScoreboard.querySelector(`[data-tier="${tier}"]`) as HTMLElement | null;
        if (!row) continue;
        (row.querySelector('.tier-count') as HTMLElement).textContent = count.toString();
        (row.querySelector('.tier-total') as HTMLElement).textContent = pts.toString();
    }
}

// Briefly flash a tier row when it scores
function flashTierRow(tierLabel: string): void {
    const row = tierScoreboard.querySelector(`[data-tier="${tierLabel}"]`) as HTMLElement | null;
    if (!row) return;
    row.classList.remove('tier-flash');
    void row.offsetWidth;
    row.classList.add('tier-flash');
    setTimeout(() => row.classList.remove('tier-flash'), 400);
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
    isReadySetGo = false;
    isShrinking = false;

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
    updateTierScoreboard();
    updateHeartsDisplay();
}

// Update the timer ring visualization
function updateRing(): void {
    const percent = timeRemaining * 100;
    const color = isShrinking ? '#ff6b6b' : '#e0e0e0';

    timerRing.style.background = `conic-gradient(
        from 0deg,
        ${color} 0%,
        ${color} ${percent}%,
        transparent ${percent}%
    )`;
}

// Update gameplay display
function updateDisplay(): void {
    timerDisplay.textContent = timeRemaining.toFixed(3);
    scoreDisplay.textContent = score.toString();
    updateRing();

    if (timeRemaining < 0.100) {
        timerDisplay.style.color = '#ef4444';
    } else if (timeRemaining < 0.300) {
        timerDisplay.style.color = '#fbbf24';
    } else {
        timerDisplay.style.color = '';
    }
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

// Handle a life lost in Sudden Death mode
async function handleSuddenDeathLifeLost(): Promise<void> {
    lives--;
    updateHeartsDisplay();

    if (lives <= 0) {
        endGame();
        return;
    }

    // Show LIFE LOST for 1.5 seconds
    lifeLost.classList.remove('hidden');
    instruction.classList.add('hidden');
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    lifeLost.classList.add('hidden');

    // Fill timer back up to maxTime, then pause before resuming
    await animateFillUp(maxTime);
    await new Promise<void>(resolve => setTimeout(resolve, 400));

    instruction.textContent = 'tap anywhere';
    instruction.classList.remove('hidden');
    isRunning = true;
    lastFrameTime = 0;
    requestAnimationFrame(gameLoop);
}

// Handle when timer reaches zero
function handleTimerZero(): void {
    handleSuddenDeathLifeLost();
}

// Show READY/SET/GO countdown and resolve when complete
function showReadySetGo(): Promise<void> {
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
async function startReadySetGo(): Promise<void> {
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
function goToStartScreen(): void {
    resetGame();
    updateHeartsVisibility();
    showScreen(startScreen);
}

// Start the game (from start screen tap)
function startGame(): void {
    showScreen(gameplayScreen);
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
    if (isReadySetGo) return;
    handleSuddenDeathTap();
}

// Brief full-screen flash to confirm a tap registered; color varies by tier
function triggerFlash(tier?: string): void {
    tapFlash.classList.remove('flash', 'flash-perfect', 'flash-great');
    void tapFlash.offsetWidth; // force reflow to restart animation
    if (tier === 'PERFECT') {
        tapFlash.classList.add('flash-perfect');
    } else if (tier === 'GREAT') {
        tapFlash.classList.add('flash-great');
    } else {
        tapFlash.classList.add('flash');
    }
}

// Show full-screen celebration for PERFECT or GREAT taps
function showCelebration(tier: 'PERFECT' | 'GREAT'): void {
    const el = document.createElement('div');
    el.className = `celebration-msg celebration-${tier.toLowerCase()}`;
    el.textContent = `${tier}!`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
}

// Show "TOO EARLY!" above the timer for early taps
function showTooEarly(): void {
    const el = document.createElement('div');
    el.className = 'too-early-msg';
    el.textContent = 'TOO EARLY!';

    const containerRect = timerContainer.getBoundingClientRect();
    const screenRect = gameplayScreen.getBoundingClientRect();
    el.style.top  = `${containerRect.top - screenRect.top}px`;
    el.style.left = `${containerRect.left + containerRect.width / 2 - screenRect.left}px`;

    gameplayScreen.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
}

// Spawn a floating debt popup showing only the time deducted
function showDebt(amount: number): void {
    const popup = document.createElement('div');
    popup.className = 'debt-popup';
    popup.innerHTML = `<div class="debt-amount">-${amount.toFixed(3)}</div>`;

    // Anchor to the bottom-center of the timer container
    const containerRect = timerContainer.getBoundingClientRect();
    const screenRect = gameplayScreen.getBoundingClientRect();
    popup.style.top  = `${containerRect.bottom - screenRect.top}px`;
    popup.style.left = `${containerRect.left + containerRect.width / 2 - screenRect.left}px`;

    gameplayScreen.appendChild(popup);
    popup.addEventListener('animationend', () => popup.remove());
}

// Animate the timer between its current value and target (Bounce mode).
// Fills up if target > current (good tap), shrinks down if target < current (early tap).
// Duration is proportional: 1.000 of change takes 1000ms, minimum 100ms.
function animateFillUp(target: number): Promise<void> {
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

        let startTime: number | null = null;

        function frame(currentTime: number): void {
            if (startTime === null) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            timeRemaining = startValue + (target - startValue) * progress;
            updateDisplay();

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
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

// Show/update the max time display
function updateMaxDisplay(): void {
    maxDisplay.textContent = `MAX: ${maxTime.toFixed(3)}`;
    maxDisplay.classList.remove('hidden');
}

// Handle tap in Sudden Death mode
function handleSuddenDeathTap(): void {
    if (!isRunning) return;

    // Freeze timer immediately so the tap feels like it lands
    isRunning = false;
    taps++;
    const debt = timeRemaining;
    const tierLabel = classifyPoint(debt);
    triggerFlash(tierLabel);
    if (tierLabel === 'PERFECT' || tierLabel === 'GREAT') showCelebration(tierLabel);
    updateDisplay();
    showDebt(debt);
    if (debt > maxTime * 0.5) showTooEarly();

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

    // Show instructions or main menu
    if (hasSeenInstructions()) {
        goToMainMenu();
    } else {
        showInstructions();
    }
});