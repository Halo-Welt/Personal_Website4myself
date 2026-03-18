// Vercel Edge Function for AI Chat using DeepSeek API
// 部署到Vercel时会自动使用环境变量中的DEEPSEEK_API_KEY

import { readFile } from 'fs/promises';
import { join } from 'path';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, mode } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 读取对应模式的提示词文件
    let systemPrompt = '';
    try {
      const promptPath = join(process.cwd(), 'prompts', `${mode || 'resume'}.md`);
      systemPrompt = await readFile(promptPath, 'utf8');
    } catch (err) {
      console.error('Error reading prompt file:', err);
      // 如果读取失败，使用默认提示词
      systemPrompt = mode === 'consultant' 
        ? 'You are a design and engineering expert.' 
        : 'You are an AI assistant representing Liu Xinyu.';
    }

    // 使用环境变量中的API key
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-8465def446a94835a95996382d3996f9';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Calling DeepSeek API...');

    // 构建消息数组，添加系统提示词
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      return new Response(JSON.stringify({ error: `API error: ${error}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    console.log('DeepSeek API response received');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
