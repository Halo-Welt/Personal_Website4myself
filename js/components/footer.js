/**
 * Reusable Footer Component
 * Generates a minimal footer with smooth transition effect
 */

const FOOTER_CONFIG = {
    copyright: '&copy; 2025 LIU Xinyu. All rights reserved.'
};

/**
 * Generate footer HTML
 */
function generateFooter() {
    const footerContainer = document.getElementById('footer');

    if (!footerContainer) return;

    // Check if this is the home page (has bottom-transition already in HTML)
    const isHomePage = document.querySelector('.bottom-transition');

    if (isHomePage) {
        // Home page already has the transition in HTML, hide footer
        footerContainer.style.display = 'none';
        return;
    }

    // For other pages, create simple footer with transition
    footerContainer.innerHTML = `
        <div class="bottom-transition">
            <div class="transition-content">
                <div class="transition-icon">
                    <i class="fas fa-infinity"></i>
                </div>
                <p class="transition-text">Design • Engineering • Innovation</p>
            </div>
        </div>
    `;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateFooter);
} else {
    generateFooter();
}

// Export for manual initialization if needed
window.Footer = {
    render: generateFooter,
    config: FOOTER_CONFIG
};
