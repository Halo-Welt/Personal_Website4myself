// Vercel Serverless Function for AI Chat using
export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, mode } = request.body;

    if (!messages || !Array.isArray(messages)) {
      return response.status(400).json({ error: 'Messages array required' });
    }

    // 使用环境变量中的API key
    const apiKey = process.env.;

    if (!apiKey) {
      return response.status(500).json({ error: 'API key not configured' });
    }

    console.log('Calling ');

    // 构建消息数组
    const systemPrompts = {
      resume: 'You are an AI assistant representing Liu Xinyu, an AI Product Manager, Designer & Engineer. Answer questions about Liu Xinyu\'s background, skills, and experience.',
      consultant: 'You are a design and engineering expert. Help users with design, engineering, and product management challenges.'
    };

    const apiMessages = [
      { role: 'system', content: systemPrompts[mode] || systemPrompts.resume },
      ...messages
    ];

    // Call
    const apiResponse = await fetch('https://api./v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: '',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      console.error(':', error);
      return response.status(apiResponse.status).json({ error: `API error: ${error}` });
    }

    const data = await apiResponse.json();
    console.log('');

    return response.status(200).json(data);
  } catch (error) {
    console.error('Chat function error:', error);
    return response.status(500).json({ error: error.message });
  }
}
