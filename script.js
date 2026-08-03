const canvas = document.getElementById('deepSpaceCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let shootingStars = [];

// Setup colors for the core galaxy spiral
const galaxyColors = [
    { r: 0,   g: 243, b: 255 }, // Cyan
    { r: 176, g: 38,  b: 255 }, // Purple
    { r: 255, g: 0,   b: 234 }  // Magenta
];

// 1. Particle Class for the background Galaxy Spirit
class Particle {
    constructor(x, y, radius, color, angle, distance, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color; // RGBA object
        this.angle = angle;
        this.distance = distance;
        this.speed = speed;
        // The closer to the center, the faster they spin
        this.angularSpeed = (1 - (this.distance / canvas.width)) * 0.002 + 0.0005;
    }

    update() {
        this.angle += this.angularSpeed;
        // Center the galaxy in the middle of the screen
        this.x = (canvas.width / 2) + Math.cos(this.angle) * this.distance;
        this.y = (canvas.height / 2) + Math.sin(this.angle) * this.distance;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        // Varying alpha makes some stars look more distant
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.random() * 0.3 + 0.1})`;
        ctx.fill();
        ctx.closePath();
    }
}

// 2. Class for individual Shooting Stars (extremely bright and rare)
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        // Shooting stars come from the top and sides, and travel fast
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * (canvas.height * 0.3); // Starts only in top 30%
        this.len = Math.random() * 100 + 100; // Trail length
        this.speed = Math.random() * 15 + 10; // Intense speed
        // The bright white/yellow effect
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
        this.finished = false;
    }

    update() {
        // Move diagonally (down and to the right)
        this.x += this.speed;
        this.y += (this.speed * 0.7); // Steep diagonal

        // Kill the star once it goes off-screen
        if (this.x > canvas.width || this.y > canvas.height) {
            this.finished = true;
        }
    }

    draw() {
        // Draw the main trail
        ctx.beginPath();
        // A gradient line trail is key for beauty
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.len, this.y - (this.len * 0.7));
        ctx.stroke();
        ctx.closePath();
        
        // Add an extra bright core to the tip of the star
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.closePath();
        
        // Reset shadows (very important for performance)
        ctx.shadowBlur = 0;
    }
}

// 3. Initialize the Galaxy background particles
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    
    const count = 1500; // High particle count for density
    
    for (let i = 0; i < count; i++) {
        const radius = Math.random() * 1.5;
        // The distance logic creates a central hub and spiral arms
        const distance = Math.pow(Math.random(), 2) * (canvas.width > canvas.height ? canvas.width / 1.5 : canvas.height / 1.5);
        // Math to create the swirling spiral shape (tied to distance)
        const angle = distance * 0.1 + Math.random() * Math.PI * 2;
        const colorIndex = Math.floor(Math.random() * galaxyColors.length);
        
        particles.push(new Particle(canvas.width/2, canvas.height/2, radius, galaxyColors[colorIndex], angle, distance));
    }
}

// 4. The main animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Clear the screen with a slight fade effect (rgba(0,0,0,0.1))
    // This creates trails for ALL particles, making the movement beautiful.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw the galaxy particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Handle Shooting Stars (Update, draw, and spawn)
    
    // a) Randomly spawn a new shooting star rarely
    if (Math.random() < 0.015 && shootingStars.length < 3) { 
        shootingStars.push(new ShootingStar());
    }
    
    // b) Update and Draw active shooting stars
    shootingStars.forEach(s => {
        s.update();
        s.draw();
    });

    // c) Remove finished stars
    shootingStars = shootingStars.filter(s => !s.finished);
}

// 5. Setup and resize listener
init();
animate();

window.addEventListener('resize', () => {
    init(); // Regenerates the galaxy on resize to match the screen
});
