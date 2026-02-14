const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajustamos al tamaño de pantalla
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// CARGAR IMÁGENES
const background = new Image();
background.src = "fondo_amor.jpg";

const player = new Image();
player.src = "messi.png";

const bulletImg = new Image();
bulletImg.src = "corazon.png";

const enemyImg = new Image();
enemyImg.src = "antonella.png";

let bullets = [];
let enemies = [];
let particles = [];

let score = 0;
let lives = 3;
let gameStarted = false;
let gameOver = false;
let win = false;

let enemySpeed = canvas.height * 0.006;

// POSICIONES
let playerX = canvas.width / 2;
let playerY = canvas.height - canvas.height * 0.15;
let isDragging = false;

// DISPARO AUTOMÁTICO
let shootTimer = 0;

// EVENTOS TÁCTILES
canvas.addEventListener("touchstart", (e) => {
    gameStarted = true;
    isDragging = true;
});

canvas.addEventListener("touchmove", (e) => {
    let touch = e.touches[0];
    playerX = touch.clientX;
});

canvas.addEventListener("touchend", () => {
    isDragging = false;
});

// FUNCIONES
function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            life: 30,
        });
    }
}

function resetGame() {
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    lives = 3;
    enemySpeed = canvas.height * 0.006;
    gameOver = false;
    win = false;
    gameStarted = false;
    playerX = canvas.width / 2;
}

function update() {
    if (!gameStarted || gameOver) return;

    // crear enemigos
    if (Math.random() < 0.025) {
        enemies.push({
            x: Math.random() * (canvas.width - 80),
            y: -80,
            width: 80,
            height: 80,
        });
    }

    // disparo automático
    if (isDragging) {
        shootTimer++;
        if (shootTimer > 20) {
            bullets.push({
                x: playerX - 25,
                y: playerY - 50,
                width: 40,
                height: 40,
            });
            shootTimer = 0;
        }
    }

    // mover balas
    bullets.forEach((b, i) => {
        b.y -= canvas.height * 0.02;
        if (b.y < -50) bullets.splice(i, 1);
    });

    // mover enemigos
    enemies.forEach((e, i) => {
        e.y += enemySpeed;
        if (e.y > canvas.height) {
            enemies.splice(i, 1);
            lives--;
        }
    });

    // colisión bull-ent
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (
                b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y
            ) {
                createExplosion(e.x + e.width / 2, e.y + e.height / 2);
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                score++;
            }
        });
    });

    // partículas
    particles.forEach((p, index) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) particles.splice(index, 1);
    });

    // dificultad progresiva
    enemySpeed = canvas.height * (0.006 + score * 0.00003);

    if (lives <= 0) gameOver = true;
    if (score >= 150) {
        win = true;
        gameOver = true;
    }
}

function draw() {
    // fondo
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // si no ha empezado
    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Toca para comenzar", canvas.width / 2, canvas.height / 2);
        return;
    }

    // jugador
    ctx.drawImage(player, playerX - (WIDTH * 0.09), playerY, WIDTH * 0.18, WIDTH * 0.18);

    // balas
    bullets.forEach((b) => {
        ctx.drawImage(bulletImg, b.x, b.y, b.width, b.height);
    });

    // enemigos
    enemies.forEach((e) => {
        ctx.drawImage(enemyImg, e.x, e.y, e.width, e.height);
    });

    // partículas
    particles.forEach((p) => {
        ctx.fillStyle = `rgba(255,${Math.floor(Math.random()*155+100)},${Math.floor(Math.random()*155+100)},1)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Puntos: " + score, 90, 40);
    ctx.fillText("Vidas: " + lives, 90, 75);

    // Final
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        let msg = win ? "VICTORIA ÉPICA" : "GAME OVER";
        ctx.fillText(msg, canvas.width / 2, canvas.height / 2 - 60);

        if (win) {
            ctx.font = "28px Arial";
            ctx.fillText("La dificultad forja campeones", canvas.width / 2, canvas.height / 2);
        }

        ctx.font = "22px Arial";
        ctx.fillText("Toca para reiniciar", canvas.width / 2, canvas.height / 2 + 60);

        canvas.addEventListener("touchstart", resetGame);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
