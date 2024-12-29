document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 打字机效果
    const typingText = document.getElementById('typing-text');
    const words = ['LIU Xinyu.', 'A Designer.', 'A Student.'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // 删除效果
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // 打字效果
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typingSpeed = 200; // 基础打字速度

        // 处理删除和切换单词的逻辑
        if (!isDeleting && charIndex === currentWord.length) {
            // 完成打字，等待1.5秒后开始删除
            typingSpeed = 1000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // 完成删除，切换到下一个词
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // 在切换到下一个词之前稍作停顿
        } else if (isDeleting) {
            typingSpeed = 100; // 删除速度更快
        }

        setTimeout(type, typingSpeed);
    }

    // 启动打字机效果
    type();
}); 