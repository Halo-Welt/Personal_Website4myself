/**
 * Environment Configuration
 * Automatically switches between development and production URLs
 */

const CONFIG = {
    // API server URL - automatically detects environment
    API_URL: (function() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        // Development (localhost or file://)
        if (hostname === 'localhost' || hostname === '127.0.0.1' || protocol === 'file:') {
            return 'http://localhost:3000';
        }

        // Production - use relative path for same-origin requests
        // This will work automatically when deployed to Vercel
        return '';
    })(),

    // API endpoints - use relative paths for production
    API_ENDPOINTS: {
        CHAT: '/api/chat',
        GUESTBOOK: '/api/guestbook',
        GUESTBOOK_ANALYZE: '/api/guestbook/analyze'
    },

    // Build full API URL helper
    getChatUrl: function() {
        // Use relative URL in production, absolute in development
        if (this.API_URL) {
            return this.API_URL + this.API_ENDPOINTS.CHAT;
        }
        return this.API_ENDPOINTS.CHAT;
    }
};

// Make CONFIG globally available
window.CONFIG = CONFIG;
