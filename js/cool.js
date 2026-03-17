/**
 * Cool Experiments - Interactive Generative Art
 * Anthropic Theme - Warm beige background with orange accents
 */

// Simple Perlin noise implementation
const Noise = {
    p: new Uint8Array(512),
    permutation: [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],

    init() {
        for (let i = 0; i < 256; i++) {
            this.p[256 + i] = this.p[i] = this.permutation[i];
        }
    },

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    lerp(t, a, b) { return a + t * (b - a); },
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    },

    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        const A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;
        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
            this.grad(this.p[BA], x - 1, y, z)),
            this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
            this.grad(this.p[BB], x - 1, y - 1, z))),
            this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
            this.grad(this.p[BA + 1], x - 1, y, z - 1)),
            this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
            this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    }
};

Noise.init();

// Anthropic Theme Colors
const THEME = {
    primary: '#d97757',
    secondary: '#6a9bcc',
    accent: '#788c5d',
    bg: '#faf9f5',
    text: '#141413'
};

// Experiment Manager
class ExperimentManager {
    constructor() {
        this.experiments = new Map();
        this.activeExperiment = null;
    }

    register(name, experiment) {
        this.experiments.set(name, experiment);
    }

    activate(name) {
        if (this.activeExperiment) {
            this.activeExperiment.stop();
        }
        const exp = this.experiments.get(name);
        if (exp) {
            this.activeExperiment = exp;
            exp.start();
        }
    }
}

const manager = new ExperimentManager();

// Flow Field Experiment
class FlowFieldExperiment {
    constructor() {
        this.canvas = document.getElementById('flowField-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.noiseScale = 0.005;
        this.particleCount = 1500;
        this.time = 0;
        this.isRunning = false;
        this.mouse = { x: 0, y: 0, active: false };
        this.resize();
        this.initParticles();
        this.bindEvents();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0, vy: 0,
                life: Math.random() * 100 + 50,
                hue: Math.random() * 40 + 10 // Orange range
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.active = true;
        });
        this.canvas.addEventListener('mouseleave', () => this.mouse.active = false);

        const noiseInput = document.getElementById('flow-noise');
        const particleInput = document.getElementById('flow-particles');
        if (noiseInput) {
            noiseInput.addEventListener('input', (e) => {
                this.noiseScale = parseFloat(e.target.value);
            });
        }
        if (particleInput) {
            particleInput.addEventListener('input', (e) => {
                this.particleCount = parseInt(e.target.value);
                this.initParticles();
            });
        }
    }

    start() { this.isRunning = true; this.animate(); }
    stop() { this.isRunning = false; }

    animate() {
        if (!this.isRunning) return;
        this.ctx.fillStyle = 'rgba(250, 249, 245, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.005;

        this.particles.forEach(p => {
            const angle = Noise.noise(p.x * this.noiseScale, p.y * this.noiseScale, this.time) * Math.PI * 4;
            p.vx += Math.cos(angle) * 0.1;
            p.vy += Math.sin(angle) * 0.1;

            if (this.mouse.active) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    const force = (100 - dist) / 100;
                    p.vx += (dx / dist) * force * 0.5;
                    p.vy += (dy / dist) * force * 0.5;
                }
            }

            p.vx *= 0.98; p.vy *= 0.98;
            p.x += p.vx * 2; p.y += p.vy * 2;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue + 10}, 70%, 50%, ${Math.min(speed / 3, 1)})`;
            this.ctx.fill();
        });
        requestAnimationFrame(() => this.animate());
    }
}

// Neural Network Experiment
class NeuralNetworkExperiment {
    constructor() {
        this.canvas = document.getElementById('neural-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.nodeCount = 25;
        this.connectionRange = 200;
        this.isRunning = false;
        this.signals = [];
        this.resize();
        this.initNodes();
        this.bindEvents();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    initNodes() {
        this.nodes = [];
        this.connections = [];
        for (let i = 0; i < this.nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * (this.canvas.height - 100) + 50,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 3,
                activation: 0,
                id: i
            });
        }
        this.updateConnections();
    }

    updateConnections() {
        this.connections = [];
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.connectionRange) {
                    this.connections.push({ from: i, to: j, strength: 1 - dist / this.connectionRange });
                }
            }
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        const nodeInput = document.getElementById('neural-nodes');
        const rangeInput = document.getElementById('neural-range');
        if (nodeInput) {
            nodeInput.addEventListener('input', (e) => {
                this.nodeCount = parseInt(e.target.value);
                this.initNodes();
            });
        }
        if (rangeInput) {
            rangeInput.addEventListener('input', (e) => {
                this.connectionRange = parseInt(e.target.value);
                this.updateConnections();
            });
        }
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            let closest = null, minDist = Infinity;
            this.nodes.forEach(node => {
                const dx = node.x - x, dy = node.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist && dist < 50) { minDist = dist; closest = node; }
            });
            if (closest) this.activateNode(closest);
        });
    }

    activateNode(node) {
        node.activation = 1;
        this.connections.forEach(conn => {
            if (conn.from === node.id || conn.to === node.id) {
                const targetId = conn.from === node.id ? conn.to : conn.from;
                this.signals.push({
                    from: { ...node },
                    to: this.nodes[targetId],
                    progress: 0,
                    speed: 0.02 + Math.random() * 0.02
                });
            }
        });
    }

    start() {
        this.isRunning = true;
        setInterval(() => {
            if (this.isRunning && Math.random() < 0.3) {
                this.activateNode(this.nodes[Math.floor(Math.random() * this.nodes.length)]);
            }
        }, 500);
        this.animate();
    }
    stop() { this.isRunning = false; }

    animate() {
        if (!this.isRunning) return;
        this.ctx.fillStyle = 'rgba(250, 249, 245, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.nodes.forEach(node => {
            node.x += node.vx; node.y += node.vy;
            if (node.x < node.radius || node.x > this.canvas.width - node.radius) node.vx *= -1;
            if (node.y < node.radius || node.y > this.canvas.height - node.radius) node.vy *= -1;
            node.activation *= 0.95;

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsl(15, 70%, ${50 + node.activation * 30}%)`;
            this.ctx.shadowBlur = node.activation * 15;
            this.ctx.shadowColor = THEME.primary;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        this.connections.forEach(conn => {
            const from = this.nodes[conn.from], to = this.nodes[conn.to];
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.strokeStyle = `rgba(217, 119, 87, ${conn.strength * 0.3})`;
            this.ctx.lineWidth = conn.strength * 1;
            this.ctx.stroke();
        });

        this.signals = this.signals.filter(signal => {
            signal.progress += signal.speed;
            if (signal.progress >= 1) { signal.to.activation = 1; return false; }
            const x = signal.from.x + (signal.to.x - signal.from.x) * signal.progress;
            const y = signal.from.y + (signal.to.y - signal.from.y) * signal.progress;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = THEME.primary;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = THEME.primary;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            return true;
        });
        requestAnimationFrame(() => this.animate());
    }
}

// Fractal Tree Experiment
class FractalTreeExperiment {
    constructor() {
        this.canvas = document.getElementById('fractal-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.maxDepth = 8;
        this.angleSpread = 25;
        this.time = 0;
        this.isRunning = false;
        this.wind = 0;
        this.resize();
        this.bindEvents();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        const depthInput = document.getElementById('fractal-depth');
        const angleInput = document.getElementById('fractal-angle');
        if (depthInput) {
            depthInput.addEventListener('input', (e) => { this.maxDepth = parseInt(e.target.value); });
        }
        if (angleInput) {
            angleInput.addEventListener('input', (e) => { this.angleSpread = parseInt(e.target.value); });
        }
    }

    drawBranch(x, y, length, angle, depth) {
        if (depth === 0) return;
        const windEffect = Math.sin(this.time + depth) * this.wind * (this.maxDepth - depth);
        const actualAngle = (angle + windEffect) * Math.PI / 180;
        const endX = x + Math.cos(actualAngle) * length;
        const endY = y + Math.sin(actualAngle) * length;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `hsl(${20 + depth * 5}, 60%, ${40 + depth * 3}%)`;
        this.ctx.lineWidth = depth * 0.8;
        this.ctx.stroke();

        if (depth <= 2) {
            this.ctx.beginPath();
            this.ctx.arc(endX, endY, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${30 + Math.random() * 20}, 70%, 55%, 0.8)`;
            this.ctx.fill();
        }

        const newLength = length * 0.7;
        this.drawBranch(endX, endY, newLength, angle - this.angleSpread, depth - 1);
        this.drawBranch(endX, endY, newLength, angle + this.angleSpread, depth - 1);
    }

    start() { this.isRunning = true; this.animate(); }
    stop() { this.isRunning = false; }

    animate() {
        if (!this.isRunning) return;
        this.ctx.fillStyle = 'rgba(250, 249, 245, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.02;
        this.wind = Math.sin(this.time * 0.5) * 5;
        const startX = this.canvas.width / 2;
        const startY = this.canvas.height - 50;
        const trunkLength = this.canvas.height / 5;
        this.drawBranch(startX, startY, trunkLength, -90, this.maxDepth);
        requestAnimationFrame(() => this.animate());
    }
}

// Matrix Rain Experiment
class MatrixRainExperiment {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.drops = [];
        this.fontSize = 14;
        this.columns = 0;
        this.density = 25;
        this.speed = 3;
        this.isRunning = false;
        this.mouse = { x: -1000, y: -1000 };
        this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
        this.resize();
        this.initDrops();
        this.bindEvents();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.initDrops();
    }

    initDrops() {
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops.push({ y: Math.random() * -100, speed: Math.random() * 2 + 1, chars: [] });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('mouseleave', () => { this.mouse.x = -1000; this.mouse.y = -1000; });
        const densityInput = document.getElementById('matrix-density');
        const speedInput = document.getElementById('matrix-speed');
        if (densityInput) {
            densityInput.addEventListener('input', (e) => { this.density = parseInt(e.target.value); });
        }
        if (speedInput) {
            speedInput.addEventListener('input', (e) => { this.speed = parseInt(e.target.value); });
        }
    }

    start() { this.isRunning = true; this.animate(); }
    stop() { this.isRunning = false; }

    animate() {
        if (!this.isRunning) return;
        this.ctx.fillStyle = 'rgba(250, 249, 245, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.columns; i += Math.floor(50 / this.density)) {
            const drop = this.drops[i];
            if (Math.random() > 0.95) {
                drop.chars.push({
                    char: this.chars[Math.floor(Math.random() * this.chars.length)],
                    y: drop.y,
                    brightness: 1
                });
            }
            const colX = i * this.fontSize;
            const distToMouse = Math.abs(colX - this.mouse.x);
            const mouseEffect = distToMouse < 100 ? (100 - distToMouse) / 100 : 0;
            const actualSpeed = this.speed * drop.speed * (1 + mouseEffect * 2);
            drop.y += actualSpeed;

            if (drop.y > this.canvas.height && Math.random() > 0.975) {
                drop.y = -this.fontSize;
                drop.chars = [];
            }

            drop.chars.forEach((char, idx) => {
                char.y += actualSpeed;
                char.brightness *= 0.97;
                const isHead = idx === drop.chars.length - 1;
                this.ctx.fillStyle = isHead ? THEME.primary : `rgba(217, 119, 87, ${char.brightness})`;
                this.ctx.fillText(char.char, colX, char.y);
            });
            drop.chars = drop.chars.filter(char => char.brightness > 0.1 && char.y < this.canvas.height + 50);
        }
        requestAnimationFrame(() => this.animate());
    }
}

// Particle Life Experiment
class ParticleLifeExperiment {
    constructor() {
        this.canvas = document.getElementById('life-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.count = 100;
        this.interactionRadius = 100;
        this.isRunning = false;
        this.resize();
        this.initParticles();
        this.bindEvents();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    initParticles() {
        this.particles = [];
        const types = 3;
        for (let i = 0; i < this.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                type: Math.floor(Math.random() * types),
                radius: 3
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        const countInput = document.getElementById('life-count');
        const radiusInput = document.getElementById('life-radius');
        if (countInput) {
            countInput.addEventListener('input', (e) => { this.count = parseInt(e.target.value); this.initParticles(); });
        }
        if (radiusInput) {
            radiusInput.addEventListener('input', (e) => { this.interactionRadius = parseInt(e.target.value); });
        }
    }

    start() { this.isRunning = true; this.animate(); }
    stop() { this.isRunning = false; }

    animate() {
        if (!this.isRunning) return;
        this.ctx.fillStyle = 'rgba(250, 249, 245, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const colors = [THEME.primary, THEME.secondary, THEME.accent];
        const attractionMatrix = [[0.5, -0.3, 0.1], [0.1, 0.5, -0.3], [-0.3, 0.1, 0.5]];

        this.particles.forEach(p => {
            this.particles.forEach(other => {
                if (p === other) return;
                const dx = other.x - p.x, dy = other.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.interactionRadius && dist > 0) {
                    const force = attractionMatrix[p.type][other.type];
                    const strength = (1 - dist / this.interactionRadius) * force * 0.5;
                    p.vx += (dx / dist) * strength;
                    p.vy += (dy / dist) * strength;
                }
            });
            p.vx *= 0.99; p.vy *= 0.99;
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = colors[p.type];
            this.ctx.fill();
        });

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i], p2 = this.particles[j];
                if (p1.type !== p2.type) continue;
                const dx = p1.x - p2.x, dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.interactionRadius * 0.5) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    const c = colors[p1.type].replace(')', ', 0.2)').replace('rgb', 'rgba');
                    this.ctx.strokeStyle = c;
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

// Fullscreen Manager
class FullscreenManager {
    constructor() {
        this.isFullscreen = false;
        this.currentExperiment = null;
        this.fullscreenElement = null;
        this.originalCanvas = null;
        this.parameters = {};
    }

    enterFullscreen(experimentName, canvas) {
        if (this.isFullscreen) return;

        this.currentExperiment = experimentName;
        this.originalCanvas = canvas;
        this.isFullscreen = true;

        // Save current parameters
        this.saveParameters(experimentName);

        // Create fullscreen container
        this.createFullscreenContainer(experimentName, canvas);
    }

    exitFullscreen() {
        if (!this.isFullscreen) return;

        // Restore parameters
        this.restoreParameters();

        // Remove fullscreen container
        if (this.fullscreenElement) {
            this.fullscreenElement.remove();
        }

        this.isFullscreen = false;
        this.currentExperiment = null;
        this.originalCanvas = null;
        this.parameters = {};
    }

    saveParameters(experimentName) {
        switch(experimentName) {
            case 'flowField':
                this.parameters.noiseScale = document.getElementById('flow-noise')?.value;
                this.parameters.particleCount = document.getElementById('flow-particles')?.value;
                break;
            case 'neural':
                this.parameters.nodeCount = document.getElementById('neural-nodes')?.value;
                this.parameters.connectionRange = document.getElementById('neural-range')?.value;
                break;
            case 'fractal':
                this.parameters.depth = document.getElementById('fractal-depth')?.value;
                this.parameters.angle = document.getElementById('fractal-angle')?.value;
                break;
            case 'matrix':
                this.parameters.fontSize = document.getElementById('matrix-font')?.value;
                this.parameters.speed = document.getElementById('matrix-speed')?.value;
                break;
            case 'life':
                this.parameters.particleCount = document.getElementById('life-particles')?.value;
                this.parameters.interactionRadius = document.getElementById('life-radius')?.value;
                break;
        }
    }

    restoreParameters() {
        if (!this.currentExperiment) return;

        switch(this.currentExperiment) {
            case 'flowField':
                const noiseInput = document.getElementById('flow-noise');
                const particleInput = document.getElementById('flow-particles');
                if (noiseInput && this.parameters.noiseScale) noiseInput.value = this.parameters.noiseScale;
                if (particleInput && this.parameters.particleCount) particleInput.value = this.parameters.particleCount;
                break;
            case 'neural':
                const nodeInput = document.getElementById('neural-nodes');
                const rangeInput = document.getElementById('neural-range');
                if (nodeInput && this.parameters.nodeCount) nodeInput.value = this.parameters.nodeCount;
                if (rangeInput && this.parameters.connectionRange) rangeInput.value = this.parameters.connectionRange;
                break;
            // Add other cases as needed
        }
    }

    createFullscreenContainer(experimentName, canvas) {
        // Create fullscreen overlay
        this.fullscreenElement = document.createElement('div');
        this.fullscreenElement.className = 'fullscreen-experiment';
        this.fullscreenElement.innerHTML = `
            <div class="fullscreen-header">
                <h2>${experimentName.charAt(0).toUpperCase() + experimentName.slice(1)}</h2>
                <button class="exit-fullscreen-btn" id="exit-fullscreen">
                    <i class="fas fa-times"></i> Exit Fullscreen
                </button>
            </div>
            <div class="fullscreen-canvas-container" id="fullscreen-canvas-container"></div>
            <div class="fullscreen-controls" id="fullscreen-controls"></div>
        `;

        document.body.appendChild(this.fullscreenElement);

        // Clone controls
        const originalControls = canvas.parentElement.querySelector('.experiment-controls');
        const fullscreenControls = this.fullscreenElement.querySelector('#fullscreen-controls');
        if (originalControls && fullscreenControls) {
            fullscreenControls.innerHTML = originalControls.innerHTML;
        }

        // Create new canvas for fullscreen
        const canvasContainer = this.fullscreenElement.querySelector('#fullscreen-canvas-container');
        const newCanvas = document.createElement('canvas');
        newCanvas.id = `${experimentName}-fullscreen-canvas`;
        newCanvas.style.width = '100%';
        newCanvas.style.height = '100%';
        canvasContainer.appendChild(newCanvas);

        // Update experiment to use new canvas
        const experiment = manager.experiments.get(experimentName);
        if (experiment) {
            experiment.canvas = newCanvas;
            experiment.ctx = newCanvas.getContext('2d');
            experiment.resize();

            // Rebind events to new controls
            this.rebindControls(experimentName, experiment);
        }

        // Bind exit button
        document.getElementById('exit-fullscreen').addEventListener('click', () => {
            // Restore original canvas
            if (experiment) {
                experiment.canvas = this.originalCanvas;
                experiment.ctx = this.originalCanvas.getContext('2d');
                experiment.resize();
            }
            this.exitFullscreen();
        });
    }

    rebindControls(experimentName, experiment) {
        switch(experimentName) {
            case 'flowField':
                const noiseInput = document.getElementById('flow-noise');
                const particleInput = document.getElementById('flow-particles');
                if (noiseInput) {
                    noiseInput.addEventListener('input', (e) => {
                        experiment.noiseScale = parseFloat(e.target.value);
                    });
                }
                if (particleInput) {
                    particleInput.addEventListener('input', (e) => {
                        experiment.particleCount = parseInt(e.target.value);
                        experiment.initParticles();
                    });
                }
                break;
            case 'neural':
                const nodeInput = document.getElementById('neural-nodes');
                const rangeInput = document.getElementById('neural-range');
                if (nodeInput) {
                    nodeInput.addEventListener('input', (e) => {
                        experiment.nodeCount = parseInt(e.target.value);
                        experiment.initNodes();
                    });
                }
                if (rangeInput) {
                    rangeInput.addEventListener('input', (e) => {
                        experiment.connectionRange = parseInt(e.target.value);
                        experiment.updateConnections();
                    });
                }
                break;
            // Add other cases as needed
        }
    }
}

const fullscreenManager = new FullscreenManager();

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    manager.register('flowField', new FlowFieldExperiment());
    manager.register('neural', new NeuralNetworkExperiment());
    manager.register('fractal', new FractalTreeExperiment());
    manager.register('matrix', new MatrixRainExperiment());
    manager.register('life', new ParticleLifeExperiment());

    const cards = document.querySelectorAll('.experiment-card');
    cards.forEach(card => {
        // Add fullscreen button to each card
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'fullscreen-btn';
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.title = 'Enter Fullscreen';
        card.appendChild(fullscreenBtn);

        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const experimentName = card.dataset.experiment;
            const canvas = card.querySelector('canvas');
            fullscreenManager.enterFullscreen(experimentName, canvas);
        });

        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            manager.activate(card.dataset.experiment);
        });
    });

    manager.activate('flowField');
});
