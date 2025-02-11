export class SplashCursor {
    constructor(options = {}) {
        this.options = {
            size: options.size || 8,
            color: options.color || '#39ff14',
            splashSize: options.splashSize || 50,
            duration: options.duration || 600,
            interval: options.interval || 50,
            ...options
        };
        
        this.init();
    }

    init() {
        this.createCursor();
        this.createStyles();
        this.bindEvents();
        this.lastSplash = 0;
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .splash-cursor {
                width: ${this.options.size}px;
                height: ${this.options.size}px;
                background: ${this.options.color};
                border-radius: 50%;
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: width 0.2s, height 0.2s;
            }

            .splash-effect {
                position: fixed;
                border: 2px solid ${this.options.color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                animation: splash ${this.options.duration}ms ease-out forwards;
            }

            @keyframes splash {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0);
                }
                100% {
                    width: ${this.options.splashSize}px;
                    height: ${this.options.splashSize}px;
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    createCursor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'splash-cursor';
        document.body.appendChild(this.cursor);
    }

    createSplashEffect(x, y) {
        const now = Date.now();
        if (now - this.lastSplash < this.options.interval) return;
        
        const splash = document.createElement('div');
        splash.className = 'splash-effect';
        splash.style.left = x + 'px';
        splash.style.top = y + 'px';
        document.body.appendChild(splash);

        setTimeout(() => {
            splash.remove();
        }, this.options.duration);

        this.lastSplash = now;
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
            this.createSplashEffect(e.clientX, e.clientY);
        });

        document.addEventListener('mousedown', () => {
            this.cursor.style.width = (this.options.size * 1.5) + 'px';
            this.cursor.style.height = (this.options.size * 1.5) + 'px';
        });

        document.addEventListener('mouseup', () => {
            this.cursor.style.width = this.options.size + 'px';
            this.cursor.style.height = this.options.size + 'px';
        });
    }
} 