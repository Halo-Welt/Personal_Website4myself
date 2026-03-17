const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Proxy API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        const response = await fetch('https://api.ofox.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-of-PbQmRwcOVRyoNLEkEyfpijrfwTJwsHEFrJbmOVyWkCsjeKmbTXqdWRkeHohFCYdm'
            },
            body: JSON.stringify({
                model: 'z-ai//',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open chat.html in your browser`);
});
