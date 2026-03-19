const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// jsonbin配置
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_ANALYSIS_BIN_ID = process.env.JSONBIN_ANALYSIS_BIN_ID;
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';

// 辅助函数：获取数据
async function fetchJsonBin(binId) {
  const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}`, {
    headers: {
      'X-Master-Key': JSONBIN_API_KEY
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch jsonbin ${binId}: ${response.status}`);
  }
  const data = await response.json();
  return data.record;
}

// 辅助函数：更新数据
async function updateJsonBin(binId, data) {
  try {
    const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update data');
    return await response.json();
  } catch (error) {
    console.error('Error updating jsonbin:', error);
    throw error;
  }
}

function canUseJsonBin(binId) {
    return Boolean(JSONBIN_API_KEY && binId);
}

async function fetchMessages() {
    if (!canUseJsonBin(JSONBIN_BIN_ID)) {
        throw new Error('JSONBIN_API_KEY and JSONBIN_BIN_ID are required for guestbook messages');
    }
    const messages = await fetchJsonBin(JSONBIN_BIN_ID);
    return Array.isArray(messages) ? messages : [];
}

async function saveMessages(messages) {
    if (!canUseJsonBin(JSONBIN_BIN_ID)) {
        throw new Error('JSONBIN_API_KEY and JSONBIN_BIN_ID are required for guestbook messages');
    }
    await updateJsonBin(JSONBIN_BIN_ID, messages);
}

function normalizeAnalysis(analysis) {
    return {
        clusters: Array.isArray(analysis?.clusters) ? analysis.clusters : [],
        summary: typeof analysis?.summary === 'string' ? analysis.summary : '',
        wordcloud: Array.isArray(analysis?.wordcloud) ? analysis.wordcloud : [],
        lastUpdate: analysis?.lastUpdate || null
    };
}

async function fetchAnalysis() {
    if (!canUseJsonBin(JSONBIN_ANALYSIS_BIN_ID)) {
        throw new Error('JSONBIN_API_KEY and JSONBIN_ANALYSIS_BIN_ID are required for guestbook analysis');
    }
    const analysis = await fetchJsonBin(JSONBIN_ANALYSIS_BIN_ID);
    return normalizeAnalysis(analysis);
}

async function saveAnalysis(analysis) {
    if (!canUseJsonBin(JSONBIN_ANALYSIS_BIN_ID)) {
        throw new Error('JSONBIN_API_KEY and JSONBIN_ANALYSIS_BIN_ID are required for guestbook analysis');
    }
    const normalized = normalizeAnalysis(analysis);
    await updateJsonBin(JSONBIN_ANALYSIS_BIN_ID, normalized);
}

async function readPrompt(promptFile) {
    const promptPath = path.join(__dirname, 'prompts', promptFile);
    return fs.readFile(promptPath, 'utf8');
}

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());
// Use absolute path for static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Chat server is running'
    });
});

// ============================================
// Guestbook API - 留言功能
// ============================================

// 获取所有留言
app.get('/api/guestbook', async (req, res) => {
    try {
        const messages = await fetchMessages();
        // 返回最近50条留言，按时间倒序
        res.json(messages.slice(0, 50).reverse());
    } catch (error) {
        console.error('Error reading messages:', error);
        res.status(500).json({ error: 'Failed to read messages' });
    }
});

// 提交留言 - 自动分析
app.post('/api/guestbook', async (req, res) => {
    const { name, message } = req.body;

    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
    }

    if (name.length > 50 || message.length > 500) {
        return res.status(400).json({ error: 'Name or message too long' });
    }

    try {
        const messages = await fetchMessages();

        const newMessage = {
            id: Date.now().toString(),
            name: name.trim(),
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        messages.push(newMessage);

        // 只保留最近200条留言
        if (messages.length > 200) {
            messages.splice(0, messages.length - 200);
        }

        await saveMessages(messages);

        console.log('New guestbook message:', newMessage);

        // 自动触发分析（异步，不阻塞响应）
        analyzeMessagesAsync().catch((err) => {
            console.error('Background analysis failed:', err);
        });

        res.json(newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// 异步分析留言
async function analyzeMessagesAsync() {
    try {
        const messages = await fetchMessages();

        if (messages.length === 0) {
            const emptyAnalysis = {
                clusters: [],
                summary: 'No messages to analyze yet.',
                wordcloud: [],
                lastUpdate: new Date().toISOString()
            };
            await saveAnalysis(emptyAnalysis);
            return emptyAnalysis;
        }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.log('No API key, skipping analysis');
            const previous = await fetchAnalysis();
            const fallback = {
                ...previous,
                summary: previous.summary || 'Analysis unavailable: missing DEEPSEEK_API_KEY.',
                lastUpdate: new Date().toISOString()
            };
            await saveAnalysis(fallback);
            return fallback;
        }

        // 构建分析提示词
        const messagesText = JSON.stringify(messages, null, 2);

        // 读取分析提示词文件
        let prompt = '';
        try {
            prompt = await readPrompt('analysis.md');
            // 替换占位符
            prompt = prompt.replace('{{messagesText}}', messagesText);
            console.log('Successfully read analysis prompt file');
        } catch (err) {
            console.error('Error reading analysis prompt file:', err);
            // 如果读取失败，使用空提示词
            prompt = '';
        }

        console.log('Calling LLM for message analysis...');

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 1500,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data.choices[0].message.content;

        // 解析JSON
        let analysis = { clusters: [], summary: '', wordcloud: [] };
        try {
            // 移除JSON代码块标记
            let cleanText = analysisText.trim();
            const fencedMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (fencedMatch?.[1]) {
                cleanText = fencedMatch[1].trim();
            }
            analysis = JSON.parse(cleanText);
            // 确保wordcloud字段存在
            if (!analysis.wordcloud) {
                // 从聚类中生成词云数据
                analysis.wordcloud = [];
                analysis.clusters.forEach(cluster => {
                    if (cluster.keywords && cluster.keywords.length > 0) {
                        cluster.keywords.forEach(keyword => {
                            analysis.wordcloud.push({
                                text: keyword,
                                value: Math.floor(Math.random() * 50) + 10 // 随机权重
                            });
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Failed to parse analysis JSON:', error);
            console.error('Raw analysis text:', analysisText);
            return;
        }

        analysis.lastUpdate = new Date().toISOString();
        await saveAnalysis(analysis);
        console.log('Analysis updated:', analysis);
        return normalizeAnalysis(analysis);
    } catch (error) {
        console.error('Error analyzing messages:', error);
        throw error;
    }
}

// 获取分析结果
app.get('/api/guestbook/analyze', async (req, res) => {
    try {
        const analysis = await fetchAnalysis();
        res.json(analysis);
    } catch (error) {
        console.error('Error reading analysis:', error);
        res.status(500).json({ error: 'Failed to read analysis' });
    }
});

// 手动触发分析
app.post('/api/guestbook/analyze', async (req, res) => {
    try {
        await analyzeMessagesAsync();
        const analysis = await fetchAnalysis();
        res.json(analysis);
    } catch (error) {
        console.error('Error triggering analysis:', error);
        res.status(500).json({ error: 'Failed to analyze messages' });
    }
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
            mode: req.body.mode,
            lastMessage: req.body.messages[req.body.messages.length - 1]?.content?.substring(0, 50)
        });

        // 读取对应模式的提示词文件
        let systemPrompt = '';
        const mode = req.body.mode || 'resume';
        try {
            systemPrompt = await readPrompt(`${mode}.md`);
            console.log(`Successfully read prompt file for mode: ${mode}`);
        } catch (err) {
            console.error('Error reading prompt file:', err);
            // 如果读取失败，使用默认提示词
            systemPrompt = mode === 'consultant' 
                ? 'You are a design and engineering expert.' 
                : 'You are an AI assistant representing Liu Xinyu.';
        }

        // 使用环境变量中的API key
        const apiKey = process.env.DEEPSEEK_API_KEY ;
        const apiUrl = 'https://api.deepseek.com/v1/chat/completions';

        console.log('Making request to DeepSeek API...');

        // 构建消息数组，添加系统提示词
        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...req.body.messages
        ];

        const requestBody = {
            model: "deepseek-chat",
            messages: apiMessages,
            temperature: 0.2,
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

        console.log('DeepSeek API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API error:', errorText);
            throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            console.error('Unexpected DeepSeek API response:', data);
            throw new Error('Unexpected response format from DeepSeek API');
        }

        console.log('Successfully received response from DeepSeek API');
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
        console.log('Using DeepSeek API');
    });
}

// Export for Vercel
module.exports = app;
