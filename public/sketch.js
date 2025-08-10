// p5.js Endless Runner Game: Pixel Dino Run

 // --- Game Configuration ---
let dino;
let obstacles = [];
let birds = [];
let score = 0;
let highScore = 0;
let gameOver = false;
let gameStarted = false; // To control initial screen
let groundY; // Y position of the ground
let gameSpeed = 6; // Initial game speed

// Background layers for parallax scrolling
let bgLayers = [];
const numBgLayers = 3; // Number of background layers
const bgColors = ['#4a5568', '#2d3748', '#1a202c']; // Darker colors for background
const bgSpeeds = [0.5, 0.7, 0.9]; // Slower speeds for distant layers

// Game elements dimensions and properties
const dinoWidth = 40;
const dinoHeight = 60;
const obstacleWidth = 20;
const obstacleHeight = 40;
const birdWidth = 40;
const birdHeight = 30;

// Gemini API related variables
let dinoFact = 'API_Key'; // Your API Key to store the generated dinosaur fact
let isLoadingFact = false; // To show loading state for the API call

// Preload function (optional, but good for loading assets if any)
function preload() {
    // No external assets for now, drawing everything with p5.js primitives
}

function setup() {
    // Create the canvas and attach it to the 'game-container' div
    const gameContainer = document.getElementById('game-container');
    const canvas = createCanvas(800, 400); // Standard endless runner size
    canvas.parent(gameContainer);

    // Set ground level
    groundY = height - 80;

    // Initialize the dinosaur
    dino = new Dino();

    // Initialize background layers
    for (let i = 0; i < numBgLayers; i++) {
        bgLayers.push(new BackgroundLayer(bgColors[i], bgSpeeds[i]));
    }

    // Set text properties
    textAlign(CENTER);
    textSize(24);
    textFont('Inter'); // Use the Inter font loaded in HTML
}

function draw() {
    background(20, 30, 40); // Dark background for the sky

    // Draw and update background layers
    for (let i = 0; i < numBgLayers; i++) {
        bgLayers[i].show();
        bgLayers[i].update();
    }

    // Draw the ground
    drawGround();

    if (!gameStarted) {
        // Display start screen
        fill(255);
        textSize(32);
        text('PIXEL DINO RUN', width / 2, height / 2 - 50);
        textSize(20);
        text('Press SPACE or UP ARROW to Start & Jump', width / 2, height / 2);
        text('Press R to Restart (after Game Over)', width / 2, height / 2 + 30);
        textSize(16);
        text('Score: ' + score + ' | High Score: ' + highScore, width / 2, height - 30);
    } else if (!gameOver) {
        // Game is running
        dino.show();
        dino.update();

        // Generate obstacles
        if (frameCount % 90 === 0) { // Adjust frequency of obstacles
            if (random(1) < 0.7) { // 70% chance for a ground obstacle
                obstacles.push(new Obstacle());
            } else { // 30% chance for a bird obstacle
                birds.push(new Bird());
            }
        }

        // Update and show obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].show();
            obstacles[i].update();

            // Check for collision with dinosaur
            if (dino.hits(obstacles[i])) {
                endGame();
            }

            // Remove off-screen obstacles
            if (obstacles[i].offscreen()) {
                obstacles.splice(i, 1);
            }
        }

        // Update and show birds
        for (let i = birds.length - 1; i >= 0; i--) {
            birds[i].show();
            birds[i].update();

            // Check for collision with dinosaur
            if (dino.hits(birds[i])) {
                endGame();
            }

            // Remove off-screen birds
            if (birds[i].offscreen()) {
                birds.splice(i, 1);
            }
        }

        // Increase score
        score++;
        gameSpeed += 0.001; // Gradually increase game speed

        // Display score
        fill(255);
        textSize(20);
        text('Score: ' + score, width - 100, 30);
        text('High Score: ' + highScore, width - 100, 60);

    } else {
        // Game over screen
        fill(255, 0, 0); // Red color for game over text
        textSize(48);
        text('GAME OVER!', width / 2, height / 2 - 30);
        fill(255);
        textSize(24);
        text('Score: ' + score, width / 2, height / 2 + 20);
        text('High Score: ' + highScore, width / 2, height / 2 + 50);
        textSize(18);
        text('Press R to Restart', width / 2, height / 2 + 90);

        // Draw "Generate Dino Fact" button
        drawDinoFactButton();

        // Display loading text or the fact
        if (isLoadingFact) {
            fill(255);
            textSize(16);
            text('Loading Dino Fact...', width / 2, height / 2 + 180);
        } else if (dinoFact) {
            fill(255);
            textSize(16);
            // Split fact into multiple lines if too long
            let words = dinoFact.split(' ');
            let line = '';
            let yOffset = 180;
            for (let i = 0; i < words.length; i++) {
                let testLine = line + words[i] + ' ';
                if (textWidth(testLine) > width - 100 && i > 0) {
                    text(line, width / 2, height / 2 + yOffset);
                    line = words[i] + ' ';
                    yOffset += 20;
                } else {
                    line = testLine;
                }
            }
            text(line, width / 2, height / 2 + yOffset);
        }
    }
}

// Handle key presses
function keyPressed() {
    if (keyCode === 32 || keyCode === UP_ARROW) { // Spacebar or Up Arrow
        if (!gameStarted) {
            startGame();
        } else if (!gameOver) {
            dino.jump();
        }
    }
    if (keyCode === 82) { // 'R' key
        if (gameOver) {
            resetGame();
        }
    }
}

// Handle mouse clicks for the button
function mousePressed() {
    if (gameOver) {
        // Check if mouse is over the "Generate Dino Fact" button
        let buttonX = width / 2 - 100;
        let buttonY = height / 2 + 120;
        let buttonWidth = 200;
        let buttonHeight = 40;

        if (mouseX > buttonX && mouseX < buttonX + buttonWidth &&
            mouseY > buttonY && mouseY < buttonY + buttonHeight) {
            generateDinoFact();
        }
    }
}

// Function to start the game
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    gameSpeed = 6;
    dino = new Dino();
    obstacles = [];
    birds = [];
    dinoFact = ''; // Clear previous fact
}

// Function to end the game
function endGame() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
    }
    noLoop(); // Stop the draw loop
}

// Function to reset the game
function resetGame() {
    loop(); // Resume the draw loop
    startGame(); // Call startGame to reset everything
}

// Draw the ground
function drawGround() {
    noStroke();
    fill(80, 80, 80); // Dark grey for ground
    rect(0, groundY, width, height - groundY); // Ground rectangle
    fill(100, 100, 100); // Slightly lighter for ground texture
    for (let i = 0; i < width; i += 20) {
        rect(i, groundY + 5, 10, 5);
    }
}

// Function to draw the "Generate Dino Fact" button
function drawDinoFactButton() {
    let buttonX = width / 2 - 100;
    let buttonY = height / 2 + 120;
    let buttonWidth = 200;
    let buttonHeight = 40;

    // Button background
    fill(70, 130, 180); // Steel blue color
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 10); // Rounded rectangle

    // Button text
    fill(255);
    textSize(18);
    text('Generate Dino Fact ✨', width / 2, buttonY + buttonHeight / 2 + 5);
}

// Function to call the Gemini API and get a dinosaur fact
async function generateDinoFact() {
    isLoadingFact = true;
    dinoFact = ''; // Clear previous fact
    loop(); // Temporarily loop to show loading state
    console.log("Fetching dino fact...");

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: "Give me one interesting and concise fact about dinosaurs. Keep it under 100 words." }] });
    const payload = { contents: chatHistory };
    const apiKey = "API_Key"; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            dinoFact = result.candidates[0].content.parts[0].text;
            console.log("Dino Fact:", dinoFact);
        } else {
            dinoFact = "Could not generate a fact. Try again!";
            console.error("Unexpected API response structure:", result);
        }
    } catch (error) {
        dinoFact = "Error fetching fact. Check console for details.";
        console.error("Error calling Gemini API:", error);
    } finally {
        isLoadingFact = false;
        noLoop(); // Stop the loop again after fact is loaded
    }
}


// Dinosaur class
class Dino {
    constructor() {
        this.x = 50;
        this.y = groundY - dinoHeight;
        this.vy = 0; // Vertical velocity
        this.gravity = 0.8; // Gravity strength
        this.isJumping = false;
    }

    jump() {
        if (!this.isJumping) {
            this.vy = -15; // Jump strength
            this.isJumping = true;
        }
    }

    update() {
        this.y += this.vy;
        this.vy += this.gravity;
        this.y = constrain(this.y, 0, groundY - dinoHeight); // Keep dino above ground

        if (this.y >= groundY - dinoHeight) {
            this.isJumping = false;
        }
    }

    show() {
        noStroke();
        fill(100, 200, 100); // Green pixelated dino color
        // Body
        rect(this.x, this.y + 10, dinoWidth, dinoHeight - 10);
        // Head
        rect(this.x + dinoWidth / 2, this.y, dinoWidth / 2, dinoHeight / 3);
        // Legs
        rect(this.x + 5, this.y + dinoHeight - 15, 10, 15);
        rect(this.x + dinoWidth - 15, this.y + dinoHeight - 15, 10, 15);
        // Eye (simple pixel)
        fill(0);
        rect(this.x + dinoWidth - 10, this.y + 10, 5, 5);
    }

    hits(obstacle) {
        // Simple AABB collision detection
        return collideRectRect(
            this.x, this.y, dinoWidth, dinoHeight,
            obstacle.x, obstacle.y, obstacle.width, obstacle.height
        );
    }
}

// Obstacle class (cactus)
class Obstacle {
    constructor() {
        this.x = width; // Start off-screen to the right
        this.y = groundY - obstacleHeight;
        this.width = obstacleWidth;
        this.height = obstacleHeight;
    }

    update() {
        this.x -= gameSpeed; // Move left
    }

    show() {
        noStroke();
        fill(150, 100, 50); // Brown/orange for cactus
        // Main body
        rect(this.x, this.y, this.width, this.height);
        // Arms
        rect(this.x - 5, this.y + this.height / 3, 10, 20);
        rect(this.x + this.width, this.y + this.height / 2, 10, 15);
    }

    offscreen() {
        return this.x < -this.width; // Check if off-screen
    }
}

// Bird class (flying obstacle)
class Bird {
    constructor() {
        this.x = width; // Start off-screen to the right
        this.y = random(height / 3, groundY - dinoHeight - 50); // Random height above ground
        this.width = birdWidth;
        this.height = birdHeight;
        this.wingPhase = 0; // For simple wing animation
    }

    update() {
        this.x -= gameSpeed * 1.2; // Birds move a bit faster
        this.wingPhase = (frameCount * 0.1) % (PI * 2); // Simple sine wave for wing flapping
    }

    show() {
        noStroke();
        fill(150, 150, 250); // Light blue for bird
        // Body
        ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height / 2);
        // Wings (simple triangles)
        let wingHeight = sin(this.wingPhase) * 10;
        triangle(
            this.x, this.y + this.height / 2,
            this.x + this.width / 2, this.y + wingHeight,
            this.x + this.width, this.y + this.height / 2
        );
        // Beak
        fill(255, 165, 0); // Orange beak
        triangle(this.x + this.width, this.y + this.height / 2 - 5,
                 this.x + this.width + 10, this.y + this.height / 2,
                 this.x + this.width, this.y + this.height / 2 + 5);
    }

    offscreen() {
        return this.x < -this.width;
    }
}

// BackgroundLayer class for parallax scrolling
class BackgroundLayer {
    constructor(color, speedFactor) {
        this.color = color;
        this.speedFactor = speedFactor;
        this.x1 = 0;
        this.x2 = width; // Second instance for seamless scrolling
        this.y = random(0, height / 2); // Random height for background elements
        this.elementWidth = random(50, 150); // Width of background elements
        this.elementHeight = random(20, 80); // Height of background elements
    }

    update() {
        this.x1 -= gameSpeed * this.speedFactor;
        this.x2 -= gameSpeed * this.speedFactor;

        // Reset position when off-screen
        if (this.x1 < -width) {
            this.x1 = width;
            this.y = random(0, height / 2);
            this.elementWidth = random(50, 150);
            this.elementHeight = random(20, 80);
        }
        if (this.x2 < -width) {
            this.x2 = width;
            this.y = random(0, height / 2);
            this.elementWidth = random(50, 150);
            this.elementHeight = random(20, 80);
        }
    }

    show() {
        noStroke();
        fill(this.color);
        // Draw two instances for seamless scrolling
        rect(this.x1, this.y, this.elementWidth, this.elementHeight);
        rect(this.x2, this.y, this.elementWidth, this.elementHeight);
    }
}

// Utility function for AABB collision detection (p5.collide2d library includes this, but implementing manually for self-containment)
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Check if the rectangles overlap on the x-axis
    if (x1 < x2 + w2 && x1 + w1 > x2) {
        // Check if the rectangles overlap on the y-axis
        if (y1 < y2 + h2 && y1 + h1 > y2) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}
