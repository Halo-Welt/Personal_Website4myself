// Vercel Serverless Function for Guestbook API
// 使用 JSONBin.io 存储数据

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';
const BIN_ID = process.env.JSONBIN_BIN_ID;
const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const = process.env.;

export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const url = request.url;
    const path = url.split('?')[0];

    // GET /api/guestbook - 获取留言
    if (request.method === 'GET' && path.endsWith('/guestbook')) {
      return await getMessages(response);
    }

    // GET /api/guestbook/analyze - 获取分析结果
    if (request.method === 'GET' && path.endsWith('/analyze')) {
      return await getAnalysis(response);
    }

    // POST /api/guestbook - 提交留言
    if (request.method === 'POST' && path.endsWith('/guestbook')) {
      return await addMessage(request.body, response);
    }

    // POST /api/guestbook/analyze - 手动分析
    if (request.method === 'POST' && path.endsWith('/analyze')) {
      return await triggerAnalysis(response);
    }

    return response.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    return response.status(500).json({ error: error.message });
  }
}

// 获取留言
async function getMessages(response) {
  if (!BIN_ID) {
    return response.status(500).json({ error: 'Bin not configured' });
  }

  try {
    const apiResponse = await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY || '' },
    });

    if (!apiResponse.ok) {
      if (apiResponse.status === 404) {
        return response.status(200).json([]);
      }
      throw new Error(`HTTP ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    const messages = data.record?.messages || [];

    return response.status(200).json(messages.slice(0, 50).reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    return response.status(500).json({ error: 'Failed to get messages' });
  }
}

// 添加留言
async function addMessage(body, response) {
  const { name, message } = body;

  if (!name || !message) {
    return response.status(400).json({ error: 'Name and message required' });
  }

  if (name.length > 50 || message.length > 500) {
    return response.status(400).json({ error: 'Input too long' });
  }

  if (!BIN_ID) {
    return response.status(500).json({ error: 'Bin not configured' });
  }

  try {
    // 获取现有数据
    let messages = [];
    let analysis = { clusters: [], summary: '' };

    try {
      const getResponse = await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY || '' },
      });

      if (getResponse.ok) {
        const data = await getResponse.json();
        messages = data.record?.messages || [];
        analysis = data.record?.analysis || { clusters: [], summary: '' };
      }
    } catch (e) {
      console.log('No existing data, starting fresh');
    }

    // 添加新留言
    const newMessage = {
      id: Date.now().toString(),
      name: name.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);

    // 只保留最近 200 条
    if (messages.length > 200) {
      messages = messages.slice(-200);
    }

    // 保存
    const saveData = { messages, analysis };

    const saveResponse = await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY || '',
      },
      body: JSON.stringify(saveData),
    });

    if (!saveResponse.ok) {
      throw new Error(`Save failed: ${saveResponse.status}`);
    }

    console.log('Message saved:', newMessage.id);

    // 异步触发分析（不阻塞响应）
    triggerAnalysisInternal(messages).catch(console.error);

    return response.status(200).json(newMessage);
  } catch (error) {
    console.error('Add message error:', error);
    return response.status(500).json({ error: 'Failed to save message' });
  }
}

// 获取分析结果
async function getAnalysis(response) {
  if (!BIN_ID) {
    return response.status(200).json({ clusters: [], summary: '' });
  }

  try {
    const apiResponse = await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY || '' },
    });

    if (!apiResponse.ok) {
      return response.status(200).json({ clusters: [], summary: '' });
    }

    const data = await apiResponse.json();
    const analysis = data.record?.analysis || { clusters: [], summary: '' };

    return response.status(200).json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    return response.status(200).json({ clusters: [], summary: '' });
  }
}

// 手动触发分析
async function triggerAnalysis(response) {
  try {
    const analysis = await triggerAnalysisInternal();
    return response.status(200).json(analysis);
  } catch (error) {
    console.error('Trigger analysis error:', error);
    return response.status(500).json({ error: 'Analysis failed' });
  }
}

// 内部分析逻辑
async function triggerAnalysisInternal(existingMessages) {
  if (!BIN_ID) {
    return { clusters: [], summary: '' };
  }

  try {
    // 获取数据
    let messages = existingMessages;
    if (!messages) {
      try {
        const getResponse = await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}/latest`, {
          headers: { 'X-Master-Key': MASTER_KEY || '' },
        });

        if (getResponse.ok) {
          const data = await getResponse.json();
          messages = data.record?.messages || [];
        }
      } catch (e) {
        // 忽略
      }
    }

    if (!messages || messages.length === 0) {
      return { clusters: [], summary: '', lastUpdate: new Date().toISOString() };
    }

    if (!) {
      console.log('No API key, skipping analysis');
      return { clusters: [], summary: 'Analysis unavailable', lastUpdate: new Date().toISOString() };
    }

    // 调用 LLM 分析
    const messagesText = messages.map(m => `- ${m.name}: ${m.message}`).join('\n');

    const prompt = `请分析以下留言，对它们进行聚类。每条留言格式为 "姓名: 内容":

${messagesText}

请返回JSON格式的分析结果，包含:
1. clusters: 聚类数组，每个聚类包含 category(中文类别名，简洁如"技术咨询"、"合作意向"、"赞美感谢"、"问题建议") 和 keywords(2-3个关键词数组)
2. summary: 一句话总结这些留言的共同主题

只返回JSON，不要其他内容。`;

    console.log('Calling LLM for analysis...');

    const llmResponse = await fetch('https://api./v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${}`,
      },
      body: JSON.stringify({
        model: '',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error(`LLM API error: ${llmResponse.status}`);
    }

    const llmData = await llmResponse.json();
    const analysisText = llmData.choices[0].message.content;

    let analysis = { clusters: [], summary: '' };
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error('Failed to parse LLM response:', analysisText);
      return { clusters: [], summary: 'Analysis parsing failed', lastUpdate: new Date().toISOString() };
    }

    analysis.lastUpdate = new Date().toISOString();

    // 保存分析结果
    await saveAnalysis(analysis, messages);

    console.log('Analysis saved:', analysis);
    return analysis;
  } catch (error) {
    console.error('Analysis error:', error);
    return { clusters: [], summary: 'Analysis failed', lastUpdate: new Date().toISOString() };
  }
}

// 保存分析结果
async function saveAnalysis(analysis, messages) {
  if (!BIN_ID) return;

  try {
    await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY || '',
      },
      body: JSON.stringify({ messages, analysis }),
    });
  } catch (error) {
    console.error('Save analysis error:', error);
  }
}
