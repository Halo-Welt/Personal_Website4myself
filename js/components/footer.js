/**
 * Reusable Footer Component
 * Generates footer HTML with social links
 */

const FOOTER_CONFIG = {
    socialLinks: [
        {
            icon: 'fab fa-weixin',
            href: '#',
            qrCode: 'images/Wechat.jpg',
            qrAlt: 'WeChat QR Code for LIU Xinyu'
        },
        {
            icon: 'fas fa-book',
            href: 'https://www.xiaohongshu.com/user/profile/5e4ae8280000000001007545',
            target: '_blank',
            qrCode: null
        },
        {
            icon: 'fab fa-github',
            href: 'https://github.com/Halo-Welt',
            target: '_blank',
            qrCode: null
        }
    ],
    copyright: '&copy; 2025 LIU Xinyu. All rights reserved.'
};

/**
 * Generate footer HTML
 */
function generateFooter() {
    const footerContainer = document.getElementById('footer');

    if (!footerContainer) return;

    const socialLinksHtml = FOOTER_CONFIG.socialLinks.map(link => {
        let linkContent = `<i class="${link.icon}"></i>`;

        let html = '';
        if (link.qrCode) {
            html = `
                <a href="${link.href}" aria-label="WeChat">
                    ${linkContent}
                    <div class="wechat-qr">
                        <img src="${link.qrCode}" alt="${link.qrAlt}">
                    </div>
                </a>
            `;
        } else {
            html = `
                <a href="${link.href}"${link.target ? ` target="${link.target}"` : ''} aria-label="${link.icon.split(' ')[1].replace('fa-', '')}">
                    ${linkContent}
                </a>
            `;
        }
        return html;
    }).join('');

    footerContainer.innerHTML = `
        <div class="social-links">
            ${socialLinksHtml}
        </div>
        <p>${FOOTER_CONFIG.copyright}</p>
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
