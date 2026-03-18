// Vercel Serverless Function for Guestbook API
// 使用 JSONBin.io 存储数据

export const config = {
  runtime: 'edge',
};

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';
const BIN_ID = process.env.JSONBIN_BIN_ID;
const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname;

    // GET - 获取留言
    if (request.method === 'GET' && path.endsWith('/api/guestbook')) {
      return await getMessages(corsHeaders);
    }

    // GET - 获取分析结果
    if (request.method === 'GET' && path.endsWith('/api/guestbook/analyze')) {
      return await getAnalysis(corsHeaders);
    }

    // POST - 提交留言
    if (request.method === 'POST' && path.endsWith('/api/guestbook')) {
      const body = await request.json();
      return await addMessage(body, corsHeaders);
    }

    // POST - 手动分析
    if (request.method === 'POST' && path.endsWith('/api/guestbook/analyze')) {
      return await triggerAnalysis(corsHeaders);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 获取留言
async function getMessages(corsHeaders) {
  if (!BIN_ID) {
    return new Response(JSON.stringify({ error: 'Bin not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': MASTER_KEY || '',
      },
    });

    if (!response.ok) {
      // 如果 bin 不存在，返回空数组
      if (response.status === 404) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const messages = data.record?.messages || [];
    return new Response(JSON.stringify(messages.slice(0, 50).reverse()), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get messages' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 添加留言
async function addMessage(body, corsHeaders) {
  const { name, message } = body;

  if (!name || !message) {
    return new Response(JSON.stringify({ error: 'Name and message required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (name.length > 50 || message.length > 500) {
    return new Response(JSON.stringify({ error: 'Input too long' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!BIN_ID) {
    return new Response(JSON.stringify({ error: 'Bin not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

    // 异步触发分析
    triggerAnalysisInternal().catch(console.error);

    return new Response(JSON.stringify(newMessage), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Add message error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save message' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 获取分析结果
async function getAnalysis(corsHeaders) {
  if (!BIN_ID) {
    return new Response(JSON.stringify({ clusters: [], summary: '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY || '' },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ clusters: [], summary: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const analysis = data.record?.analysis || { clusters: [], summary: '' };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    return new Response(JSON.stringify({ clusters: [], summary: '' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 手动触发分析
async function triggerAnalysis(corsHeaders) {
  try {
    await triggerAnalysisInternal();
    return await getAnalysis(corsHeaders);
  } catch (error) {
    console.error('Trigger analysis error:', error);
    return new Response(JSON.stringify({ error: 'Analysis failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 内部分析逻辑
async function triggerAnalysisInternal() {
  if (!BIN_ID) return;

  try {
    // 获取数据
    const getResponse = await fetch(`${JSONBIN_BASE_URL}/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY || '' },
    });

    if (!getResponse.ok) return;

    const data = await getResponse.json();
    const messages = data.record?.messages || [];

    if (messages.length === 0) {
      // 空数据，更新分析为空
      await saveAnalysis({ clusters: [], summary: '', lastUpdate: new Date().toISOString() });
      return;
    }

    const apiKey = process.env.;
    if (!apiKey) {
      console.log('No API key, skipping analysis');
      return;
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
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: '-chat',
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
      console.error('Failed to parse LLM response');
      return;
    }

    analysis.lastUpdate = new Date().toISOString();

    // 保存分析结果
    await saveAnalysis(analysis);

    console.log('Analysis saved:', analysis);
  } catch (error) {
    console.error('Analysis error:', error);
  }
}

// 保存分析结果
async function saveAnalysis(analysis) {
  if (!BIN_ID) return;

  try {
    // 获取现有数据
    let messages = [];

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

    // 保存
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
