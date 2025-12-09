const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d', { alpha: false });

let particlesArray = [];
let mouse = { x: null, y: null, radius: 150 };

// Set canvas size
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setCanvasSize();

// Mouse interaction
canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.baseColor = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Mouse interaction - particles avoid mouse
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius && mouse.x != null) {
            // Push particles away from mouse
            if (this.x < mouse.x && this.x > mouse.radius) {
                this.x -= 3;
            }
            if (this.x > mouse.x && this.x < canvas.width - mouse.radius) {
                this.x += 3;
            }
            if (this.y < mouse.y && this.y > mouse.radius) {
                this.y -= 3;
            }
            if (this.y > mouse.y && this.y < canvas.height - mouse.radius) {
                this.y += 3;
            }
            // Change color on hover
            this.color = 'rgba(102, 126, 234, 0.3)';
        } else {
            this.color = this.baseColor;
        }

        // Move particle
        this.x += this.directionX;
        this.y += this.directionY;

        this.draw();
    }
}

// Initialize particle array
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 12000;

    // Cap particles for performance
    if (numberOfParticles > 150) numberOfParticles = 150;

    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2.5) + 0.5;
        let x = (Math.random() * (canvas.width - size * 2)) + size;
        let y = (Math.random() * (canvas.height - size * 2)) + size;
        let directionX = (Math.random() * 0.8) - 0.4;
        let directionY = (Math.random() * 0.8) - 0.4;

        // Gradient colors for variety
        const colors = [
            'rgba(255, 255, 255, 0.08)',
            'rgba(102, 126, 234, 0.12)',
            'rgba(118, 75, 162, 0.1)',
            'rgba(240, 147, 251, 0.08)'
        ];
        let color = colors[Math.floor(Math.random() * colors.length)];

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// Connect nearby particles with lines
function connect() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Draw line if particles are close
            if (distance < 120) {
                let opacity = 1 - (distance / 120);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.08})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
let lastTime = 0;
const fps = 60;
const frameDelay = 1000 / fps;

function animate(currentTime) {
    requestAnimationFrame(animate);

    // Throttle to target FPS
    const deltaTime = currentTime - lastTime;
    if (deltaTime < frameDelay) return;
    lastTime = currentTime - (deltaTime % frameDelay);

    // Clear canvas with a subtle trail effect
    ctx.fillStyle = 'rgba(15, 15, 35, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }

    // Connect particles
    connect();
}

// Resize event with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        setCanvasSize();
        init();
    }, 200);
});

// Initialize and start animation
init();
animate(0);

// Performance optimization: Pause animation when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab is hidden, animations will naturally pause
    } else {
        // Tab is visible again, ensure animation continues
        lastTime = performance.now();
    }
});
