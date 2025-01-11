function createVisualizer(container) {
    // 创建80个音频条
    for (let i = 0; i < 80; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        // 随机初始高度，但保持较慢的动画速度
        bar.style.animationDuration = 1.8 + Math.random() * 0.4 + 's';
        container.appendChild(bar);
    }
}

// 当页面加载完成时初始化可视化器
document.addEventListener('DOMContentLoaded', () => {
    const visualizers = document.querySelectorAll('.audio-visualizer');
    visualizers.forEach(visualizer => {
        createVisualizer(visualizer);
    });
}); 