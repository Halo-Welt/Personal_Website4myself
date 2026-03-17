/**
 * Home Page - Cyberpunk Minimalist
 * Particle network, glitch effects, floating bubbles, scroll animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initParticleNetwork();
    initTypingEffect();
    initFloatingBubbles();
    initScrollAnimations();
    initStatCounters();
});

// ============================================
// Particle Network Background
// ============================================
function initParticleNetwork() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animationId;
    let isActive = true;

    // Configuration
    const config = {
        particleCount: window.innerWidth < 768 ? 30 : 60,
        connectionDistance: 150,
        mouseDistance: 200,
        speed: 0.5,
        color: 'rgba(217, 119, 87, 0.5)',
        lineColor: 'rgba(217, 119, 87, 0.15)'
    };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            // Mouse attraction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseDistance) {
                    const force = (config.mouseDistance - distance) / config.mouseDistance;
                    this.vx += dx * force * 0.001;
                    this.vy += dy * force * 0.001;
                }
            }

            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Boundary check
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Keep in bounds
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));

            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;

            // Minimum movement
            if (Math.abs(this.vx) < 0.1) this.vx += (Math.random() - 0.5) * 0.1;
            if (Math.abs(this.vy) < 0.1) this.vy += (Math.random() - 0.5) * 0.1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = config.color;
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.connectionDistance) {
                    const opacity = (1 - distance / config.connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(217, 119, 87, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Connect to mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.mouseDistance) {
                    const opacity = (1 - distance / config.mouseDistance) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(217, 119, 87, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        if (!isActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        drawConnections();

        animationId = requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', () => {
        resize();
        init();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Visibility handling
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isActive = false;
            cancelAnimationFrame(animationId);
        } else {
            isActive = true;
            animate();
        }
    });

    init();
    animate();
}

// ============================================
// Interactive Glitch Text Effect
// ============================================
function initTypingEffect() {
    // Setup glitch word cycling (extraordinary)
    const glitchWord = document.getElementById('glitch-word');
    if (glitchWord) {
        const words = [
            'extraordinary',
            'amazing',
            'innovative',
            'remarkable',
            'incredible',
            'fantastic',
            'awesome'
        ];

        let currentWordIndex = 0;
        let isHovering = false;

        glitchWord.addEventListener('mouseenter', () => {
            if (!isHovering) {
                isHovering = true;
            }
        });

        glitchWord.addEventListener('mouseleave', () => {
            if (isHovering) {
                isHovering = false;

                // Change to next word
                setTimeout(() => {
                    currentWordIndex = (currentWordIndex + 1) % words.length;
                    glitchWord.textContent = words[currentWordIndex];
                    glitchWord.dataset.word = words[currentWordIndex];
                }, 300);
            }
        });
    }
}

// ============================================
// Floating Skill Bubbles
// ============================================
function initFloatingBubbles() {
    const bubbles = document.querySelectorAll('.skill-bubble');
    if (!bubbles.length) return;

    const time = Date.now();

    bubbles.forEach((bubble, index) => {
        const speed = parseFloat(bubble.dataset.speed) || 0.5;
        const angle = parseFloat(bubble.dataset.angle) || 0;
        const radius = 20;

        function animate() {
            const now = Date.now();
            const elapsed = (now - time) / 1000;

            const x = Math.cos((elapsed * speed) + (angle * Math.PI / 180)) * radius;
            const y = Math.sin((elapsed * speed) + (angle * Math.PI / 180)) * (radius * 0.5);

            bubble.style.transform = `translate(${x}px, ${y}px)`;

            requestAnimationFrame(animate);
        }

        // Stagger start
        setTimeout(() => {
            animate();
        }, index * 200);
    });
}

// ============================================
// Scroll Animations
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('.about-preview, .work-preview, .contact-cta').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// Stat Counters
// ============================================
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const count = parseInt(target.dataset.count) || 0;
                animateCounter(target, count);
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * (target - start) + start);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}
