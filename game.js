// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 400,
    TARGET_SCORE: 100,
    INITIAL_LIVES: 7,
    MITZVAH_POINTS: 5,
    AVERA_POINTS: -2,
    STREAK_MULTIPLIER_THRESHOLD: 3, // Streak multiplier kicks in after 3 consecutive mitzvos
    INITIAL_SPAWN_RATE: 2000, // milliseconds
    MIN_SPAWN_RATE: 500,
    DIFFICULTY_INCREASE_RATE: 0.95, // Multiplier for spawn rate decrease
    DIFFICULTY_INTERVAL: 10000 // Increase difficulty every 10 seconds
};

// Game State
let gameState = {
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    streak: 0,
    multiplier: 1,
    gameOver: false,
    won: false,
    difficulty: 1,
    lastDifficultyIncrease: Date.now(),
    spawnRate: CONFIG.INITIAL_SPAWN_RATE
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

// Player Class
class Player {
    constructor() {
        this.x = 100;
        this.y = CONFIG.CANVAS_HEIGHT / 2;
        this.width = 35; // Increased for better graphics
        this.height = 40;
        this.speed = 5;
        this.color = '#4a90e2';
        this.beardColor = '#8b4513';
    }

    update(keys) {
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            this.y = Math.max(0, this.y - this.speed);
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            this.y = Math.min(CONFIG.CANVAS_HEIGHT - this.height, this.y + this.speed);
        }
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x = Math.max(0, this.x - this.speed);
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x = Math.min(CONFIG.CANVAS_WIDTH - this.width, this.x + this.speed);
        }
    }

    draw() {
        // Enhanced side profile of rabbi facing right
        const x = this.x;
        const y = this.y;
        
        // Tallit (prayer shawl) - white with stripes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 2, y + 12, 32, 28);
        // Tallit stripes
        ctx.fillStyle = '#000080';
        ctx.fillRect(x + 2, y + 14, 2, 24);
        ctx.fillRect(x + 6, y + 14, 2, 24);
        ctx.fillRect(x + 10, y + 14, 2, 24);
        ctx.fillRect(x + 14, y + 14, 2, 24);
        
        // Head (side profile - more detailed)
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 11, 0, Math.PI * 2);
        ctx.fill();
        
        // Ear
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(x + 3, y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Beard (side profile - more detailed and flowing)
        ctx.fillStyle = this.beardColor;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 18);
        ctx.quadraticCurveTo(x + 5, y + 22, x + 8, y + 25);
        ctx.quadraticCurveTo(x + 5, y + 30, x + 2, y + 38);
        ctx.quadraticCurveTo(x - 3, y + 35, x - 2, y + 30);
        ctx.quadraticCurveTo(x - 1, y + 25, x + 2, y + 20);
        ctx.closePath();
        ctx.fill();
        // Beard texture lines
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 22);
        ctx.lineTo(x - 1, y + 28);
        ctx.moveTo(x + 4, y + 26);
        ctx.lineTo(x, y + 32);
        ctx.stroke();
        
        // Kippah/yarmulke (more detailed)
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(x + 10, y + 6, 7, 0, Math.PI * 2);
        ctx.fill();
        // Kippah rim
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + 10, y + 6, 7, 0, Math.PI * 2);
        ctx.stroke();
        
        // Eye (side profile - more detailed)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + 13, y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 14, y + 10, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyebrow
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 11, y + 7, 5, 1);
        
        // Nose (side profile - more detailed)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 11);
        ctx.quadraticCurveTo(x + 18, y + 12, x + 20, y + 13);
        ctx.stroke();
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(x + 18, y + 12, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 15);
        ctx.quadraticCurveTo(x + 18, y + 16, x + 19, y + 15);
        ctx.stroke();
        
        // Body/robe under tallit
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + 2, y + 28, 24, 12);
        
        // Arms (one visible in side profile)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x + 24, y + 20, 6, 8);
        // Hand
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(x + 28, y + 28, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + 8, y + 38, 4, 2);
        ctx.fillRect(x + 16, y + 38, 4, 2);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Mitzvah Collectible Class
class MitzvahCollectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.type = type; // 'lulav' or 'esrog'
        this.speed = 2;
        this.collected = false;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        if (this.collected) return;
        
        if (this.type === 'lulav') {
            // Draw lulav (palm branch)
            ctx.fillStyle = '#228b22';
            // Main stem
            ctx.fillRect(this.x + 11, this.y + 2, 3, 21);
            // Leaves (fronds) coming out from stem
            ctx.fillStyle = '#32cd32';
            // Left leaves
            ctx.fillRect(this.x + 5, this.y + 5, 6, 2);
            ctx.fillRect(this.x + 4, this.y + 8, 7, 2);
            ctx.fillRect(this.x + 3, this.y + 11, 8, 2);
            // Right leaves
            ctx.fillRect(this.x + 14, this.y + 5, 6, 2);
            ctx.fillRect(this.x + 13, this.y + 8, 7, 2);
            ctx.fillRect(this.x + 13, this.y + 11, 8, 2);
        } else {
            // Draw esrog (citron - lemon-like fruit)
            ctx.fillStyle = '#ffd700';
            // Main body (oval shape)
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, 10, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Stem on top
            ctx.fillStyle = '#228b22';
            ctx.fillRect(this.x + 11, this.y + 2, 3, 4);
            // Texture lines
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const label = this.type === 'lulav' ? 'Lulav' : 'Esrog';
        const textY = this.y + this.height + 2;
        ctx.strokeText(label, this.x + this.width / 2, textY);
        ctx.fillText(label, this.x + this.width / 2, textY);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Mitzvah NPC Class (for charity and helping)
class MitzvahNPC {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type; // 'charity' or 'helping'
        this.speed = 1.5;
        this.helped = false;
        this.helpRadius = 40; // Distance player needs to be to help
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        if (this.helped) return;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        if (this.type === 'charity') {
            // Draw charity box (tzedakah box)
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(this.x + 5, this.y + 5, 20, 20);
            // Slot on top
            ctx.fillStyle = '#654321';
            ctx.fillRect(this.x + 10, this.y + 3, 10, 3);
            // Coin slot indicator
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(centerX, this.y + 8, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw person in need (simple person figure)
            // Head
            ctx.fillStyle = '#ffdbac';
            ctx.beginPath();
            ctx.arc(centerX, this.y + 8, 6, 0, Math.PI * 2);
            ctx.fill();
            // Body
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(this.x + 8, this.y + 14, 14, 12);
            // Arms (outstretched for help)
            ctx.fillStyle = '#ffdbac';
            ctx.fillRect(this.x + 3, this.y + 16, 5, 2);
            ctx.fillRect(this.x + 22, this.y + 16, 5, 2);
            // Legs
            ctx.fillRect(this.x + 10, this.y + 26, 3, 4);
            ctx.fillRect(this.x + 17, this.y + 26, 3, 4);
        }
        
        // Draw help radius indicator
        if (!this.helped) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.helpRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const label = this.type === 'charity' ? 'Charity' : 'Helping';
        const textY = this.y + this.height + 2;
        ctx.strokeText(label, centerX, textY);
        ctx.fillText(label, centerX, textY);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isPlayerNearby(player) {
        const playerCenter = {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2
        };
        const npcCenter = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
        const distance = Math.sqrt(
            Math.pow(playerCenter.x - npcCenter.x, 2) + 
            Math.pow(playerCenter.y - npcCenter.y, 2)
        );
        return distance <= this.helpRadius;
    }
}

// Yetzer Hara Enemy Class
class YetzerHara {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 35;
        this.speed = 2; // Slower so player can outrun
        this.color = '#8b0000';
    }

    update(player) {
        // Chase the player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw() {
        // Draw Yetzer Hara as a dark, menacing figure
        // Main body (dark shadowy form)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Horns
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 5);
        ctx.lineTo(this.x + 8, this.y - 2);
        ctx.lineTo(this.x + 12, this.y + 3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x + 25, this.y + 5);
        ctx.lineTo(this.x + 27, this.y - 2);
        ctx.lineTo(this.x + 23, this.y + 3);
        ctx.closePath();
        ctx.fill();
        
        // Evil glowing eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 25, this.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Evil grin
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 20, 8, 0, Math.PI);
        ctx.stroke();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Avera Obstacle Class
class AveraObstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 2.5;
        this.color = '#ff4500';
        this.rotation = 0;
    }

    update() {
        this.x -= this.speed;
        this.rotation += 0.1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Draw Avera as a dark cloud/smoke
        ctx.fillStyle = this.color;
        // Main cloud shape
        ctx.beginPath();
        ctx.arc(-10, -5, 12, 0, Math.PI * 2);
        ctx.arc(0, -8, 15, 0, Math.PI * 2);
        ctx.arc(10, -5, 12, 0, Math.PI * 2);
        ctx.arc(-5, 5, 10, 0, Math.PI * 2);
        ctx.arc(5, 5, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Dark center
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Warning symbol in center (X mark)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, -6);
        ctx.lineTo(6, 6);
        ctx.moveTo(6, -6);
        ctx.lineTo(-6, 6);
        ctx.stroke();
        
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Game Objects
let player = new Player();
let mitzvahCollectibles = [];
let mitzvahNPCs = [];
let yetzerHaraEnemies = [];
let averaObstacles = [];
let keys = {};

// Input Handling
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Collision Detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Spawning Functions
function spawnMitzvahCollectible() {
    const types = ['lulav', 'esrog'];
    const type = types[Math.floor(Math.random() * types.length)];
    const y = Math.random() * (CONFIG.CANVAS_HEIGHT - 45); // Account for label space
    mitzvahCollectibles.push(new MitzvahCollectible(CONFIG.CANVAS_WIDTH, y, type));
}

function spawnMitzvahNPC() {
    const types = ['charity', 'helping'];
    const type = types[Math.floor(Math.random() * types.length)];
    const y = Math.random() * (CONFIG.CANVAS_HEIGHT - 50); // Account for label space
    mitzvahNPCs.push(new MitzvahNPC(CONFIG.CANVAS_WIDTH, y, type));
}

function spawnYetzerHara() {
    const x = CONFIG.CANVAS_WIDTH + 50;
    const y = Math.random() * (CONFIG.CANVAS_HEIGHT - 35);
    yetzerHaraEnemies.push(new YetzerHara(x, y));
}

function spawnAveraObstacle() {
    const y = Math.random() * (CONFIG.CANVAS_HEIGHT - 40);
    averaObstacles.push(new AveraObstacle(CONFIG.CANVAS_WIDTH, y));
}

// Scoring Functions
function addMitzvah(points) {
    gameState.streak++;
    if (gameState.streak >= CONFIG.STREAK_MULTIPLIER_THRESHOLD) {
        gameState.multiplier = Math.floor(gameState.streak / CONFIG.STREAK_MULTIPLIER_THRESHOLD) + 1;
    } else {
        gameState.multiplier = 1;
    }
    
    const totalPoints = points * gameState.multiplier;
    gameState.score += totalPoints;
    updateUI();
}

function addAvera() {
    gameState.streak = 0; // Reset streak on aveira
    gameState.multiplier = 1;
    gameState.score = Math.max(0, gameState.score + CONFIG.AVERA_POINTS);
    gameState.lives--;
    updateUI();
    
    if (gameState.lives <= 0) {
        endGame(false);
    }
}

// UI Update
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('streak').textContent = gameState.streak;
    document.getElementById('multiplier').textContent = `x${gameState.multiplier}`;
    document.getElementById('target').textContent = CONFIG.TARGET_SCORE;
}

// Game Over
function endGame(won) {
    gameState.gameOver = true;
    gameState.won = won;
    
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const message = document.getElementById('gameOverMessage');
    
    gameOverDiv.classList.remove('hidden');
    
    if (won) {
        title.textContent = 'Mazel Tov! You Won!';
        title.style.color = '#4ecdc4';
        message.textContent = `You reached the target score of ${CONFIG.TARGET_SCORE} points!`;
    } else {
        title.textContent = 'Game Over';
        title.style.color = '#ff6b6b';
        message.textContent = `You ran out of lives. Final score: ${gameState.score}`;
    }
}

// Restart Game
document.getElementById('restartBtn').addEventListener('click', () => {
    gameState = {
        score: 0,
        lives: CONFIG.INITIAL_LIVES,
        streak: 0,
        multiplier: 1,
        gameOver: false,
        won: false,
        difficulty: 1,
        lastDifficultyIncrease: Date.now(),
        spawnRate: CONFIG.INITIAL_SPAWN_RATE
    };
    
    player = new Player();
    mitzvahCollectibles = [];
    mitzvahNPCs = [];
    yetzerHaraEnemies = [];
    averaObstacles = [];
    
    document.getElementById('gameOver').classList.add('hidden');
    updateUI();
    
    // Restart game loop
    lastSpawnTime = Date.now();
    gameLoop();
});

// Game Loop
let lastSpawnTime = Date.now();
let lastMitzvahSpawn = Date.now();
let lastNPCspawn = Date.now();
let lastEnemySpawn = Date.now();
let lastObstacleSpawn = Date.now();

function gameLoop() {
    if (gameState.gameOver) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Draw background
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Draw ground
    ctx.fillStyle = '#90ee90';
    ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 20, CONFIG.CANVAS_WIDTH, 20);
    
    // Update difficulty
    const now = Date.now();
    if (now - gameState.lastDifficultyIncrease > CONFIG.DIFFICULTY_INTERVAL) {
        gameState.difficulty++;
        gameState.spawnRate = Math.max(
            CONFIG.MIN_SPAWN_RATE,
            gameState.spawnRate * CONFIG.DIFFICULTY_INCREASE_RATE
        );
        gameState.lastDifficultyIncrease = now;
    }
    
    // Spawn objects
    const currentSpawnRate = gameState.spawnRate;
    
    if (now - lastMitzvahSpawn > currentSpawnRate) {
        if (Math.random() > 0.3) {
            spawnMitzvahCollectible();
        }
        lastMitzvahSpawn = now;
    }
    
    if (now - lastNPCspawn > currentSpawnRate * 1.5) {
        if (Math.random() > 0.5) {
            spawnMitzvahNPC();
        }
        lastNPCspawn = now;
    }
    
    if (now - lastEnemySpawn > currentSpawnRate * 2) {
        if (Math.random() > 0.6) {
            spawnYetzerHara();
        }
        lastEnemySpawn = now;
    }
    
    if (now - lastObstacleSpawn > currentSpawnRate * 1.8) {
        if (Math.random() > 0.5) {
            spawnAveraObstacle();
        }
        lastObstacleSpawn = now;
    }
    
    // Update player
    player.update(keys);
    
    // Update and draw mitzvah collectibles
    mitzvahCollectibles = mitzvahCollectibles.filter(item => {
        if (item.x + item.width < 0) return false;
        
        item.update();
        
        if (!item.collected && checkCollision(player.getBounds(), item.getBounds())) {
            item.collected = true;
            addMitzvah(CONFIG.MITZVAH_POINTS);
            return false;
        }
        
        item.draw();
        return true;
    });
    
    // Update and draw mitzvah NPCs
    mitzvahNPCs = mitzvahNPCs.filter(npc => {
        if (npc.x + npc.width < 0) return false;
        
        npc.update();
        
        if (!npc.helped && npc.isPlayerNearby(player)) {
            npc.helped = true;
            addMitzvah(CONFIG.MITZVAH_POINTS);
            return false;
        }
        
        npc.draw();
        return true;
    });
    
    // Update and draw Yetzer Hara enemies
    yetzerHaraEnemies = yetzerHaraEnemies.filter(enemy => {
        if (enemy.x + enemy.width < -100 || enemy.x > CONFIG.CANVAS_WIDTH + 100) return false;
        if (enemy.y + enemy.height < -100 || enemy.y > CONFIG.CANVAS_HEIGHT + 100) return false;
        
        enemy.update(player);
        
        if (checkCollision(player.getBounds(), enemy.getBounds())) {
            addAvera();
            return false;
        }
        
        enemy.draw();
        return true;
    });
    
    // Update and draw avera obstacles
    averaObstacles = averaObstacles.filter(obstacle => {
        if (obstacle.x + obstacle.width < 0) return false;
        
        obstacle.update();
        
        if (checkCollision(player.getBounds(), obstacle.getBounds())) {
            addAvera();
            return false;
        }
        
        obstacle.draw();
        return true;
    });
    
    // Draw player
    player.draw();
    
    // Check win condition
    if (gameState.score >= CONFIG.TARGET_SCORE && !gameState.won) {
        endGame(true);
        return;
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Initialize UI
updateUI();

// Start game
gameLoop();

