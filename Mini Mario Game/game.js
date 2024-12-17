// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size dynamically
canvas.width = window.innerWidth * 0.9; // 90% of the browser width
canvas.height = window.innerHeight * 0.8; // 80% of the browser height

// Game variables
const gravity = 0.5;
let gameRunning = true;
let score = 0;
let coins = [];
let hurdles = [];
let playerSpeed = 5; // Default player speed

// Player object
const player = {
  x: 50,
  y: canvas.height - 150,
  width: 50,
  height: 100,
  velocityY: 0,
  jumping: false,
  jumpCount: 0, // Track number of jumps (0 or 1 for double jump)
  jumpHeight: -12, // Normal jump height
  jumpHeightDouble: -18 // Double jump height (higher jump)
};

// Platforms (grass platform)
const platforms = [
  { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 }
];

// Key controls
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Update player position
function updatePlayer() {
  if (keys['ArrowRight']) player.x += playerSpeed;
  if (keys['ArrowLeft']) player.x -= playerSpeed;

  // Prevent player from leaving the screen
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  // Jumping logic - Double jump condition with higher second jump
  if (keys[' '] && player.jumpCount === 0) {
    player.velocityY = player.jumpHeight; // Normal jump
    player.jumpCount = 1; // First jump
    player.jumping = true;
  } else if (keys[' '] && player.jumpCount === 1) {
    player.velocityY = player.jumpHeightDouble; // Higher second jump
    player.jumpCount = 2; // Second jump
  }

  // Apply gravity
  player.velocityY += gravity;
  player.y += player.velocityY;

  // Collision with platforms
  for (const platform of platforms) {
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height < platform.y + platform.height &&
      player.y + player.height + player.velocityY >= platform.y
    ) {
      player.jumping = false;
      player.velocityY = 0;
      player.y = platform.y - player.height;
      player.jumpCount = 0; // Reset jump count when player lands on a platform
    }
  }

  // Prevent falling through the bottom
  if (player.y + player.height > canvas.height) {
    player.jumping = false;
    player.velocityY = 0;
    player.y = canvas.height - player.height;
    player.jumpCount = 0; // Reset jump count when player reaches the ground
  }
}

// Generate new coins and hurdles with reduced probability
function generateObstaclesAndCoins() {
  // Decreased probability for coin and hurdle spawning
  if (Math.random() < 0.01) { // Reduced coin spawn rate
    let coinY = Math.random() * (canvas.height - 200) + 100; // Coins spawn randomly on the screen
    coins.push({ x: canvas.width, y: coinY, width: 30, height: 30 });
  }

  if (Math.random() < 0.005) { // Reduced hurdle spawn rate
    let hurdleY = canvas.height - 100; // Hurdles spawn at the bottom
    hurdles.push({ x: canvas.width, y: hurdleY, width: 50, height: 50 });
  }

  // Move coins and hurdles
  for (let i = 0; i < coins.length; i++) {
    coins[i].x -= 3; // Coin speed
    if (coins[i].x + coins[i].width < 0) {
      coins.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < hurdles.length; i++) {
    hurdles[i].x -= 3; // Hurdle speed
    if (hurdles[i].x + hurdles[i].width < 0) {
      hurdles.splice(i, 1);
      i--;
    }
  }
}

// Collision detection
function checkCollisions() {
  // Collision with coins
  for (let i = 0; i < coins.length; i++) {
    if (
      player.x < coins[i].x + coins[i].width &&
      player.x + player.width > coins[i].x &&
      player.y < coins[i].y + coins[i].height &&
      player.y + player.height > coins[i].y
    ) {
      score += 10; // Increase score when coin is collected
      coins.splice(i, 1); // Remove coin from the array
      i--;
    }
  }

  // Collision with hurdles
  for (let i = 0; i < hurdles.length; i++) {
    if (
      player.x < hurdles[i].x + hurdles[i].width &&
      player.x + player.width > hurdles[i].x &&
      player.y < hurdles[i].y + hurdles[i].height &&
      player.y + player.height > hurdles[i].y
    ) {
      gameRunning = false; // End the game if collided with hurdle
      document.getElementById('restartButton').style.display = 'block'; // Show restart button
    }
  }
}

// Draw all game elements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Draw player character
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw coins
  ctx.fillStyle = 'gold';
  for (const coin of coins) {
    ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
  }

  // Draw hurdles
  ctx.fillStyle = 'red';
  for (const hurdle of hurdles) {
    ctx.fillRect(hurdle.x, hurdle.y, hurdle.width, hurdle.height);
  }

  // Display score
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 20, 40);

  // If game over, show "Game Over" text
  if (!gameRunning) {
    ctx.fillStyle = 'red';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 150, canvas.height / 2);
  }
}

// Restart the game by refreshing the page
function restartGame() {
  location.reload(); // This will reload the page and reset the game
}

// Game loop
function gameLoop() {
  if (gameRunning) {
    updatePlayer(); // Update player state
    generateObstaclesAndCoins(); // Generate new coins and hurdles
    checkCollisions(); // Check for collisions
    draw(); // Draw all elements
    requestAnimationFrame(gameLoop); // Keep the game loop going
  }
}

// Start the game once the page loads
window.onload = () => {
  gameLoop(); // Start the game loop
};
