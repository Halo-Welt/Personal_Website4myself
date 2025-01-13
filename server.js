const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

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
        apiKey: process.env.DEEPSEEK_API_KEY ? 'configured' : 'missing'
    });
});

// Server start endpoint
app.post('/start-server', (req, res) => {
    exec('pm2 restart chat-server || pm2 start ecosystem.config.js', (error, stdout, stderr) => {
        if (error) {
            console.error('Error starting server:', error);
            res.status(500).json({ error: 'Failed to start server' });
            return;
        }
        console.log('Server started successfully:', stdout);
        res.json({ status: 'ok', message: 'Server started successfully' });
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
            lastMessage: req.body.messages[req.body.messages.length - 1]
        });

        if (!process.env.DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API key is not configured');
        }

        const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        console.log('Making request to DeepSeek API...');
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: req.body.messages,
                stream: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('DeepSeek API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: data
            });
            throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        }

        console.log('Received response from DeepSeek API:', {
            status: response.status,
            messageContent: data.choices?.[0]?.message?.content?.substring(0, 50) + '...'
        });

        // Send the response back to the client
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

// 启动服务器
function startServer() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('Environment check:', {
            hasApiKey: !!process.env.DEEPSEEK_API_KEY,
            apiKeyLength: process.env.DEEPSEEK_API_KEY?.length
        });
    }).on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.log('Port is already in use, attempting to close existing connection...');
            exec('pm2 restart chat-server', (err, stdout, stderr) => {
                if (err) {
                    console.error('Error restarting server:', err);
                    return;
                }
                console.log('Server restarted successfully');
            });
        } else {
            console.error('Server error:', error);
        }
    });
}

startServer(); 