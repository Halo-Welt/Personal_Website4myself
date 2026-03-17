/**
 * Reusable Navigation Component
 * Generates navbar HTML dynamically and highlights current page
 */

const NAVBAR_CONFIG = {
    logo: 'DESIGINEER',
    pages: [
        { name: 'Home', href: 'index.html' },
        { name: 'Resume', href: 'resume.html' },
        { name: 'Chat', href: 'chat.html' },
        { name: 'Cool', href: 'cool.html' }
    ]
};

/**
 * Get current page from URL
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename;
}

/**
 * Generate navbar HTML
 */
function generateNavbar() {
    const currentPage = getCurrentPage();
    const navContainer = document.getElementById('navbar');

    if (!navContainer) return;

    const navLinks = NAVBAR_CONFIG.pages.map(page => {
        const isActive = page.href === currentPage || (currentPage === '' && page.href === 'index.html');
        return `<li role="none"><a href="${page.href}" role="menuitem" class="${isActive ? 'active' : ''}">${page.name}</a></li>`;
    }).join('');

    navContainer.innerHTML = `
        <div class="logo">${NAVBAR_CONFIG.logo}</div>
        <div class="nav-toggle" role="button" aria-label="Toggle navigation menu" tabindex="0">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <ul class="nav-links" role="menubar">
            ${navLinks}
        </ul>
    `;

    // Initialize mobile toggle
    initMobileToggle();
}

/**
 * Initialize mobile menu toggle
 */
function initMobileToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Keyboard accessibility
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle.click();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateNavbar);
} else {
    generateNavbar();
}

// Export for manual initialization if needed
window.Navbar = {
    render: generateNavbar,
    config: NAVBAR_CONFIG
};
