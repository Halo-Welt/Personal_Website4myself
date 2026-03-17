// Message API for danmu system
// In production, use Vercel KV or a database for persistence

let messages = [
  { text: "���迎来到我的网站！✨", time: Date.now() - 10000 },
  { text: "Cool design! 🔥", time: Date.now() - 20000 },
  { text: "Love the particles effect", time: Date.now() - 30000 },
];

// In production, you would use Vercel KV or another database
/*
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (req.method === 'GET') {
      // Get recent messages
      const msgs = await kv.lrange('danmu_messages', 0, 49);
      return res.status(200).json({ messages: msgs || [] });
    }

    if (req.method === 'POST') {
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Message text is required' });
      }

      if (text.length > 100) {
        return res.status(400).json({ error: 'Message too long (max 100 characters)' });
      }

      // Add message
      const message = {
        text: text.trim(),
        time: Date.now()
      };

      await kv.lpush('danmu_messages', JSON.stringify(message));
      await kv.ltrim('danmu_messages', 0, 99); // Keep only last 100 messages

      return res.status(200).json({ success: true, message });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process message' });
  }
}
*/

// Fallback implementation for development
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (req.method === 'GET') {
      // Return recent messages
      return res.status(200).json({
        messages: messages.slice(-50),
        note: 'This is a development store. Set up Vercel KV for production persistence.'
      });
    }

    if (req.method === 'POST') {
      const { text } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Message text is required' });
      }

      if (text.length > 100) {
        return res.status(400).json({ error: 'Message too long (max 100 characters)' });
      }

      // Add message
      const message = {
        text: text.trim(),
        time: Date.now()
      };

      messages.push(message);

      // Keep only last 100 messages
      if (messages.length > 100) {
        messages = messages.slice(-100);
      }

      return res.status(200).json({
        success: true,
        message,
        note: 'This is a development store. Set up Vercel KV for production persistence.'
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process message' });
  }
}
