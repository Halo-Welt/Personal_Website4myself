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
    initGuestbook();
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
                // Animate stats sequentially with staggered delay
                stats.forEach((stat, index) => {
                    const count = parseInt(stat.dataset.count) || 0;
                    setTimeout(() => {
                        animateCounter(stat, count);
                    }, index * 200); // 200ms delay between each counter
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe the stats container
    const statsContainer = document.querySelector('.about-stats');
    if (statsContainer) {
        observer.observe(statsContainer);
    }
}

function animateCounter(element, target) {
    // 根据目标值大小动态调整动画持续时间
    const duration = Math.max(800, Math.min(1500, target * 40));
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用更适合计数的缓动函数
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(easeOutCubic * target);

        element.textContent = current;

        // 当数字已经达到目标值时，提前结束动画
        if (current >= target) {
            element.textContent = target;
            return;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

// ============================================
// Guestbook - 留言功能
// ============================================
function initGuestbook() {
    const nameInput = document.getElementById('guestbook-name');
    const messageInput = document.getElementById('guestbook-message');
    const submitBtn = document.getElementById('guestbook-submit');
    const danmakuContainer = document.getElementById('danmaku-container');
    const analysisContent = document.getElementById('analysis-content');

    if (!nameInput || !messageInput || !submitBtn) return;

    let messages = [];
    let danmakuCount = 0;

    // Load messages and analysis on init
    loadMessages();
    loadAnalysis();

    // Auto-refresh analysis every 30 seconds
    setInterval(loadAnalysis, 30000);

    // Submit message
    submitBtn.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();

        if (!name || !message) {
            alert('Please enter both name and message');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            // 构建完整的API URL
            const apiUrl = CONFIG.API_URL ? CONFIG.API_URL + CONFIG.API_ENDPOINTS.GUESTBOOK : CONFIG.API_ENDPOINTS.GUESTBOOK;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, message })
            });

            if (!response.ok) {
                throw new Error('Failed to submit message');
            }

            const newMessage = await response.json();
            messages.unshift(newMessage);

            // Clear inputs
            nameInput.value = '';
            messageInput.value = '';

            // Add danmaku
            addDanmaku(newMessage);

            // Refresh analysis after a short delay
            setTimeout(loadAnalysis, 2000);
        } catch (error) {
            console.error('Error submitting message:', error);
            alert('Failed to submit message. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
        }
    });

    // Load messages from server
    async function loadMessages() {
        try {
            // 构建完整的API URL
            const apiUrl = CONFIG.API_URL ? CONFIG.API_URL + CONFIG.API_ENDPOINTS.GUESTBOOK : CONFIG.API_ENDPOINTS.GUESTBOOK;
            const response = await fetch(apiUrl);
            if (response.ok) {
                messages = await response.json();
                // Clear placeholder and show messages
                if (danmakuContainer) {
                    danmakuContainer.innerHTML = '';
                }
                // Display latest 10 messages as danmaku
                messages.slice(0, 10).reverse().forEach(msg => addDanmaku(msg, false));
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    // Load analysis results
    async function loadAnalysis() {
        if (!analysisContent) return;

        try {
            // 构建完整的API URL
            const apiUrl = CONFIG.API_URL ? CONFIG.API_URL + CONFIG.API_ENDPOINTS.GUESTBOOK_ANALYZE : CONFIG.API_ENDPOINTS.GUESTBOOK_ANALYZE;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const analysis = await response.json();
                displayAnalysis(analysis);
            }
        } catch (error) {
            console.error('Error loading analysis:', error);
        }
    }

    // 弹幕轨道管理
    let danmakuTracks = [];
    const TRACK_HEIGHT = 40; // 每条轨道的高度
    
    // 初始化轨道
    function initDanmakuTracks() {
        if (!danmakuContainer) return;
        const containerHeight = danmakuContainer.offsetHeight;
        const trackCount = Math.floor(containerHeight / TRACK_HEIGHT);
        danmakuTracks = Array(trackCount).fill(false); // false表示轨道空闲
    }

    // 获取可用轨道
    function getAvailableTrack() {
        for (let i = 0; i < danmakuTracks.length; i++) {
            if (!danmakuTracks[i]) {
                return i;
            }
        }
        // 如果没有可用轨道，返回随机轨道
        return Math.floor(Math.random() * danmakuTracks.length);
    }

    // Add danmaku animation
    function addDanmaku(msg, animate = true) {
        if (!danmakuContainer) return;

        // 初始化轨道（如果还没初始化）
        if (danmakuTracks.length === 0) {
            initDanmakuTracks();
        }

        // Remove placeholder if exists
        const placeholder = danmakuContainer.querySelector('.danmaku-placeholder');
        if (placeholder) placeholder.remove();

        danmakuCount++;
        const danmaku = document.createElement('div');
        danmaku.className = 'danmaku-item';
        danmaku.innerHTML = `<span class="danmaku-name">${escapeHtml(msg.name)}:</span> ${escapeHtml(msg.message)}`;

        // 获取可用轨道
        const trackIndex = getAvailableTrack();
        const top = trackIndex * TRACK_HEIGHT;
        danmaku.style.top = `${top}px`;

        // 标记轨道为占用
        danmakuTracks[trackIndex] = true;

        // Set random speed (4-10 seconds to cross the screen)
        const duration = 4 + Math.random() * 6;
        danmaku.style.animationDuration = `${duration}s`;

        danmakuContainer.appendChild(danmaku);

        // Start animation
        setTimeout(() => danmaku.classList.add('animate'), 10);

        // Remove after animation and re-add to create loop
        setTimeout(() => {
            if (danmaku.parentNode) {
                danmaku.remove();
                // 标记轨道为空闲
                danmakuTracks[trackIndex] = false;
                // Re-add the danmaku to create loop
                setTimeout(() => addDanmaku(msg, false), 1000);
            }
        }, duration * 1000);
    }

    // Display analysis results
    function displayAnalysis(analysis) {
        if (!analysisContent) return;

        let html = '';

        if (analysis.clusters && analysis.clusters.length > 0) {
            if (analysis.summary) {
                html += `<p class="analysis-summary">${escapeHtml(analysis.summary)}</p>`;
            }

            // 词云展示
            if (analysis.wordcloud && analysis.wordcloud.length > 0) {
                html += '<div class="wordcloud-container">';
                html += '<h4>Word Cloud</h4>';
                html += '<div class="wordcloud">';
                
                analysis.wordcloud.forEach((word, index) => {
                    const colors = ['#d97757', '#6a9bcc', '#8bc34a', '#ff9800', '#9c27b0'];
                    const color = colors[index % colors.length];
                    const fontSize = 12 + (word.value / 5);
                    const rotate = Math.random() * 45 - 22.5; // -22.5 to 22.5 degrees
                    
                    html += `
                        <span class="word" style="
                            font-size: ${fontSize}px;
                            color: ${color};
                            transform: rotate(${rotate}deg);
                            display: inline-block;
                            margin: 5px;
                            padding: 2px 5px;
                            border-radius: 3px;
                            background: rgba(255, 255, 255, 0.7);
                        ">
                            ${escapeHtml(word.text)}
                        </span>
                    `;
                });
                
                html += '</div></div>';
            }

            html += '<div class="cluster-container">';
            html += '<div class="cluster-bubbles">';

            analysis.clusters.forEach((cluster, index) => {
                const colors = ['#d97757', '#6a9bcc', '#8bc34a', '#ff9800', '#9c27b0'];
                const color = colors[index % colors.length];
                const size = 60 + (cluster.keywords?.length || 1) * 10;

                html += `
                    <div class="cluster-bubble" style="
                        --color: ${color};
                        --size: ${size}px;
                        --delay: ${index * 0.1}s;
                    ">
                        <span class="cluster-name">${escapeHtml(cluster.category)}</span>
                        <div class="cluster-keywords">
                            ${(cluster.keywords || []).map(k => `<span class="keyword">${escapeHtml(k)}</span>`).join('')}
                        </div>
                    </div>
                `;
            });

            html += '</div></div>';

            if (analysis.lastUpdate) {
                const date = new Date(analysis.lastUpdate);
                html += `<p class="analysis-time">Updated: ${date.toLocaleTimeString()}</p>`;
            }
        } else {
            html = '<p class="analysis-placeholder">No messages to analyze yet. Be the first to leave a message!</p>';
        }

        analysisContent.innerHTML = html;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
