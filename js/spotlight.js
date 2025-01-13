let spotlightOverlay;
let spotlight;
let activeCard = null;

function createSpotlightElements() {
    // 创建遮罩层
    spotlightOverlay = document.createElement('div');
    spotlightOverlay.className = 'spotlight-overlay';
    document.body.appendChild(spotlightOverlay);

    // 创建聚光灯效果
    spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    document.body.appendChild(spotlight);
}

function handleMouseEnter(card) {
    activeCard = card;
    
    // 立即显示遮罩和聚光灯
    spotlightOverlay.style.opacity = '1';
    spotlight.style.opacity = '1';
    
    // 添加高亮效果
    card.classList.add('spotlight-active');

    // 更新聚光灯位置
    updateSpotlightPosition(card);

    // 使其他卡片变暗
    const allCards = document.querySelectorAll('.repo-card');
    allCards.forEach(otherCard => {
        if (otherCard !== card) {
            otherCard.style.filter = 'brightness(0.15)';
            otherCard.style.transition = 'filter 0.3s ease';
        }
    });
}

function handleMouseLeave(card) {
    if (activeCard === card) {
        spotlightOverlay.style.opacity = '0';
        spotlight.style.opacity = '0';
        card.classList.remove('spotlight-active');
        
        // 恢复所有卡片的亮度
        const allCards = document.querySelectorAll('.repo-card');
        allCards.forEach(otherCard => {
            otherCard.style.filter = '';
        });
        
        activeCard = null;
    }
}

function updateSpotlightPosition(card) {
    if (!activeCard) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    spotlight.style.left = `${centerX}px`;
    spotlight.style.top = `${centerY}px`;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    createSpotlightElements();

    // 为所有仓库卡片添加事件监听
    const repoCards = document.querySelectorAll('.repo-card');
    repoCards.forEach(card => {
        card.addEventListener('mouseenter', () => handleMouseEnter(card));
        card.addEventListener('mouseleave', () => handleMouseLeave(card));
    });

    // 添加鼠标移动事件监听
    document.addEventListener('mousemove', (e) => {
        if (activeCard) {
            updateSpotlightPosition(activeCard);
        }
    });

    // 添加滚动事件监听
    window.addEventListener('scroll', () => {
        if (activeCard) {
            updateSpotlightPosition(activeCard);
        }
    });
}); 