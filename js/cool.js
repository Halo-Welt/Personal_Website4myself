document.addEventListener('DOMContentLoaded', () => {
    const experimentCards = document.querySelectorAll('.experiment-card');
    const ParticleSystemClasses = window.ParticleSystemClasses;

    // Store active particle systems
    const particleSystems = {};
    let currentFullscreen = null;

    // Matrix Rain Effect (separate class)
    class MatrixRain {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.resize();
            this.characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
            this.fontSize = 14;
            this.columns = 0;
            this.drops = [];
            this.animationId = null;

            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.columns = Math.floor(this.canvas.width / this.fontSize);
            this.drops = Array(this.columns).fill(1);
        }

        draw() {
            // Semi-transparent black background for trail effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#39FF14';
            this.ctx.font = `${this.fontSize}px monospace`;

            for (let i = 0; i < this.drops.length; i++) {
                const char = this.characters[Math.floor(Math.random() * this.characters.length)];
                const x = i * this.fontSize;
                const y = this.drops[i] * this.fontSize;

                // Random brightness
                const brightness = Math.random();
                if (brightness > 0.9) {
                    this.ctx.fillStyle = '#FFFFFF';
                } else if (brightness > 0.7) {
                    this.ctx.fillStyle = '#ADFF2F';
                } else {
                    this.ctx.fillStyle = '#39FF14';
                }

                this.ctx.fillText(char, x, y);

                if (y > this.canvas.height && Math.random() > 0.975) {
                    this.drops[i] = 0;
                }

                this.drops[i]++;
            }

            this.animationId = requestAnimationFrame(() => this.draw());
        }

        start() {
            if (!this.animationId) {
                this.draw();
            }
        }

        stop() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }

    // Initialize experiments
    function initParticleField() {
        const canvas = document.getElementById('particleField-canvas');
        if (!canvas || particleSystems['particleField']) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const system = new ParticleSystemClasses.ParticleField(canvas);
        system.init();
        particleSystems['particleField'] = system;
        system.animate();
    }

    function initGravity() {
        const canvas = document.getElementById('gravity-canvas');
        if (!canvas || particleSystems['gravity']) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const system = new ParticleSystemClasses.GravitySimulation(canvas);
        system.init();
        particleSystems['gravity'] = system;
        system.animate();
    }

    function initExplosion() {
        const canvas = document.getElementById('explosion-canvas');
        if (!canvas || particleSystems['explosion']) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const system = new ParticleSystemClasses.ParticleExplosion(canvas);
        particleSystems['explosion'] = system;

        // Add click handler
        canvas.addEventListener('click', (e) => system.handleClick(e));
        canvas.addEventListener('touchstart', (e) => system.handleTouch(e));

        system.animate();
    }

    function initFlowField() {
        const canvas = document.getElementById('flowField-canvas');
        if (!canvas || particleSystems['flowField']) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const system = new ParticleSystemClasses.FlowField(canvas);
        system.init();
        particleSystems['flowField'] = system;
        system.animate();
    }

    function initColorCycling() {
        const canvas = document.getElementById('colorCycling-canvas');
        if (!canvas || particleSystems['colorCycling']) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const system = new ParticleSystemClasses.ColorCyclingParticles(canvas);
        system.init();
        particleSystems['colorCycling'] = system;
        system.animate();
    }

    function initMatrix() {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas || particleSystems['matrix']) return;

        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const system = new MatrixRain(canvas);
        particleSystems['matrix'] = system;
        system.start();
    }

    // Initialize all experiments
    function initAll() {
        initParticleField();
        initGravity();
        initExplosion();
        initFlowField();
        initColorCycling();
        initMatrix();
    }

    // Fullscreen functionality
    function createFullscreenCanvas(experimentName) {
        // Remove existing fullscreen
        const existing = document.querySelector('.fullscreen-canvas');
        if (existing) {
            existing.remove();
        }

        const fullscreen = document.createElement('div');
        fullscreen.className = 'fullscreen-canvas';
        fullscreen.innerHTML = `
            <canvas id="fullscreen-${experimentName}"></canvas>
            <button class="close-fullscreen"><i class="fas fa-times"></i></button>
        `;
        document.body.appendChild(fullscreen);

        const canvas = document.getElementById(`fullscreen-${experimentName}`);
        const closeBtn = fullscreen.querySelector('.close-fullscreen');

        // Initialize the experiment in fullscreen
        setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let system;

            switch(experimentName) {
                case 'particleField':
                    system = new ParticleSystemClasses.ParticleField(canvas);
                    system.init();
                    system.particleCount = 300;
                    break;
                case 'gravity':
                    system = new ParticleSystemClasses.GravitySimulation(canvas);
                    system.init();
                    system.particleCount = 200;
                    break;
                case 'explosion':
                    system = new ParticleSystemClasses.ParticleExplosion(canvas);
                    canvas.addEventListener('click', (e) => system.handleClick(e));
                    break;
                case 'flowField':
                    system = new ParticleSystemClasses.FlowField(canvas);
                    system.init();
                    system.particleCount = 500;
                    break;
                case 'colorCycling':
                    system = new ParticleSystemClasses.ColorCyclingParticles(canvas);
                    system.init();
                    system.particleCount = 400;
                    break;
                case 'matrix':
                    system = new MatrixRain(canvas);
                    system.start();
                    break;
            }

            if (system && experimentName !== 'matrix') {
                system.animate();
            }

            currentFullscreen = system;
        }, 100);

        // Close handler
        closeBtn.addEventListener('click', () => {
            fullscreen.classList.remove('active');
            if (currentFullscreen && currentFullscreen.stop) {
                currentFullscreen.stop();
            }
            setTimeout(() => fullscreen.remove(), 300);
        });

        fullscreen.classList.add('active');
    }

    // Event listeners for experiment cards
    experimentCards.forEach(card => {
        card.addEventListener('click', () => {
            const experiment = card.dataset.experiment;
            createFullscreenCanvas(experiment);
        });
    });

    // Initial delay to ensure DOM is ready
    setTimeout(initAll, 100);

    // Handle resize
    window.addEventListener('resize', () => {
        Object.values(particleSystems).forEach(system => {
            if (system && system.resize) {
                system.resize();
            }
        });
    });
});
