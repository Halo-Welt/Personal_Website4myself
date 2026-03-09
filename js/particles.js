/**
 * Particle Engine for Cool Page
 * Provides various particle system effects
 */

class Particle {
    constructor(x, y, vx, vy, size, color, life = Infinity) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.alpha = 1;
        this.friction = 0.99;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;

        if (this.life !== Infinity) {
            this.life--;
            this.alpha = Math.max(0, this.life / this.maxLife);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0 || this.alpha <= 0;
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        this.width = canvas.width;
        this.height = canvas.height;

        // Performance optimization
        this.lastTime = 0;
        this.deltaTime = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', () => {
            this.isMouseDown = true;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.isMouseDown = true;
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
            this.mouseY = touch.clientY - rect.top;
            e.preventDefault();
        });

        this.canvas.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
            this.mouseY = touch.clientY - rect.top;
            e.preventDefault();
        });

        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(p => p.draw(this.ctx));
    }

    animate(timestamp = 0) {
        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.clear();
        this.update();
        this.draw();

        requestAnimationFrame((t) => this.animate(t));
    }

    // Override these in subclasses
    update() {}
    draw() {}
    stop() {}
}

// Interactive Particle Field with trails
class ParticleField extends ParticleSystem {
    constructor(canvas) {
        super(canvas);
        this.particleCount = 150;
        this.connectionDistance = 100;
        this.mouseRepelDistance = 150;
        this.mouseRepelForce = 2;
        this.trailLength = 0.15;
        this.hue = 120;
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            const size = Math.random() * 2 + 1;
            const color = `hsl(${this.hue}, 100%, 60%)`;

            this.addParticle(new Particle(x, y, vx, vy, size, color));
        }
    }

    update() {
        this.hue = (this.hue + 0.5) % 360;

        this.particles.forEach(p => {
            // Mouse interaction
            const dx = p.x - this.mouseX;
            const dy = p.y - this.mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.mouseRepelDistance) {
                const force = (this.mouseRepelDistance - dist) / this.mouseRepelDistance;
                const angle = Math.atan2(dy, dx);
                p.vx += Math.cos(angle) * force * this.mouseRepelForce;
                p.vy += Math.sin(angle) * force * this.mouseRepelForce;
            }

            // Random movement
            p.vx += (Math.random() - 0.5) * 0.2;
            p.vy += (Math.random() - 0.5) * 0.2;

            // Speed limit
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 4) {
                p.vx = (p.vx / speed) * 4;
                p.vy = (p.vy / speed) * 4;
            }

            // Update position
            p.update();

            // Wrap around edges
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            // Update color
            p.color = `hsl(${this.hue}, 100%, 60%)`;
        });

        this.updateParticles();
    }

    draw() {
        // Draw trails (semi-transparent background)
        this.ctx.fillStyle = `rgba(18, 18, 18, ${this.trailLength})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw particles
        this.particles.forEach(p => p.draw(this.ctx));

        // Draw connections
        this.ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    const alpha = 1 - (dist / this.connectionDistance);
                    this.ctx.strokeStyle = `rgba(57, 255, 20, ${alpha * 0.3})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Gravity Simulation
class GravitySimulation extends ParticleSystem {
    constructor(canvas) {
        super(canvas);
        this.gravity = 0.15;
        this.particleCount = 100;
        this.attractStrength = 0.5;
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const vx = (Math.random() - 0.5) * 3;
            const vy = (Math.random() - 0.5) * 3;
            const size = Math.random() * 3 + 2;
            const color = `hsl(${Math.random() * 60 + 90}, 100%, 60%)`;

            this.addParticle(new Particle(x, y, vx, vy, size, color));
        }
    }

    update() {
        this.particles.forEach(p => {
            // Gravity toward mouse
            if (this.isMouseDown) {
                const dx = this.mouseX - p.x;
                const dy = this.mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 5) {
                    const force = this.attractStrength;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
            }

            // Add gravity
            p.vy += this.gravity;

            p.update();

            // Bounce off edges
            if (p.x < 0 || p.x > this.width) {
                p.vx *= -0.8;
                p.x = Math.max(0, Math.min(this.width, p.x));
            }
            if (p.y > this.height) {
                p.vy *= -0.6;
                p.y = this.height;
            }
            if (p.y < 0) {
                p.vy *= -0.8;
                p.y = 0;
            }
        });

        this.updateParticles();
    }

    draw() {
        this.clear();

        // Draw gravity indicator
        if (this.isMouseDown) {
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 30, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(57, 255, 20, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        this.particles.forEach(p => p.draw(this.ctx));
    }
}

// Particle Explosions
class ParticleExplosion extends ParticleSystem {
    constructor(canvas) {
        super(canvas);
        this.explosionParticles = [];
    }

    update() {
        // Handle explosion particles
        for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
            const p = this.explosionParticles[i];
            p.update();
            if (p.isDead()) {
                this.explosionParticles.splice(i, 1);
            }
        }

        // Also update background particles
        this.updateParticles();
    }

    draw() {
        this.clear();

        // Draw explosion particles
        this.explosionParticles.forEach(p => p.draw(this.ctx));
    }

    triggerExplosion(x, y) {
        const colors = ['#39FF14', '#00FF88', '#7CFC00', '#ADFF2F', '#00FA9A'];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = Math.random() * 8 + 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = Math.random() * 4 + 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const life = Math.random() * 60 + 40;

            this.explosionParticles.push(new Particle(x, y, vx, vy, size, color, life));
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.triggerExplosion(x, y);
    }

    handleTouch(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.triggerExplosion(x, y);
    }
}

// Flow Field using Perlin Noise
class FlowField extends ParticleSystem {
    constructor(canvas) {
        super(canvas);
        this.particleCount = 300;
        this.scale = 0.005;
        this.time = 0;
        this.zOff = 0;
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 2 + 1;
            const color = `hsl(${Math.random() * 60 + 90}, 100%, 60%)`;

            this.addParticle(new Particle(x, y, 0, 0, size, color));
        }
    }

    noise(x, y, z) {
        // Simple pseudo-noise function
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }

    getAngle(x, y) {
        const angle = this.noise(x * this.scale, y * this.scale, this.time) * Math.PI * 4;
        return angle;
    }

    update() {
        this.time += 0.003;
        this.zOff += 0.003;

        this.particles.forEach(p => {
            const angle = this.getAngle(p.x, p.y);
            p.vx += Math.cos(angle) * 0.3;
            p.vy += Math.sin(angle) * 0.3;

            // Speed limit
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 3) {
                p.vx = (p.vx / speed) * 3;
                p.vy = (p.vy / speed) * 3;
            }

            p.update();

            // Wrap around with trail effect
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;
        });

        this.updateParticles();
    }

    draw() {
        // Trail effect
        this.ctx.fillStyle = 'rgba(18, 18, 18, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

// Color Cycling Particles
class ColorCyclingParticles extends ParticleSystem {
    constructor(canvas) {
        super(canvas);
        this.particleCount = 200;
        this.hue = 0;
    }

    init() {
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const vx = (Math.random() - 0.5) * 3;
            const vy = (Math.random() - 0.5) * 3;
            const size = Math.random() * 4 + 2;

            this.addParticle(new Particle(x, y, vx, vy, size, '#39FF14'));
        }
    }

    update() {
        this.hue = (this.hue + 1) % 360;

        this.particles.forEach(p => {
            // Color based on velocity
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const hue = (this.hue + speed * 20) % 360;
            p.color = `hsl(${hue}, 100%, 60%)`;

            // Mouse repulsion
            const dx = p.x - this.mouseX;
            const dy = p.y - this.mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                const force = (100 - dist) / 100;
                p.vx += (dx / dist) * force * 0.5;
                p.vy += (dy / dist) * force * 0.5;
            }

            p.update();

            // Wrap around
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;
        });

        this.updateParticles();
    }

    draw() {
        this.clear();

        // Draw glow
        this.ctx.shadowBlur = 15;

        this.particles.forEach(p => {
            this.ctx.shadowColor = p.color;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.shadowBlur = 0;
    }
}

// Export all particle system classes
window.ParticleSystemClasses = {
    ParticleField,
    GravitySimulation,
    ParticleExplosion,
    FlowField,
    ColorCyclingParticles
};
