const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Chat server is running'
    });
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    // Validate request body
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Messages array is required'
        });
    }

    try {
        console.log('Received chat request:', {
            messageCount: req.body.messages.length,
            lastMessage: req.body.messages[req.body.messages.length - 1]?.content?.substring(0, 50)
        });

        // Direct
        const apiKey = 'sk-8465def446a94835a95996382d3996f9';
        const apiUrl = 'https://api.deepseek.com/chat/completions';

        console.log('Making request to ');

        const requestBody = {
            model: "deepseek-chat",
            messages: req.body.messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: false
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log(':', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(':', errorText);
            throw new Error(`: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            console.error('Unexpected :', data);
            throw new Error('Unexpected response format from ');
        }

        console.log('Successfully received response from ');
        res.json(data);
    } catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Chat server running at http://localhost:${port}`);
        console.log('Using ');
    });
}

// Export for Vercel
module.exports = app;
