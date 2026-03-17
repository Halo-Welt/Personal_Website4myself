// Visitor Counter API
// Uses Vercel KV for storage (or fallback to memory for development)

let visitorCount = 0;

// In production, you would use Vercel KV or another database
// For now, we'll use a simple in-memory counter that resets on redeploy
// To implement proper persistence, set up Vercel KV:

/*
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (req.method === 'GET') {
      // Get current count
      const count = await kv.get('visitor_count');
      return res.status(200).json({ count: count || 0 });
    }

    if (req.method === 'POST') {
      // Increment count
      const newCount = await kv.incr('visitor_count');
      return res.status(200).json({ count: newCount });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update visitor count' });
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
      // Return current count (in development, this will reset on server restart)
      return res.status(200).json({
        count: visitorCount,
        note: 'This is a development counter. Set up Vercel KV for production persistence.'
      });
    }

    if (req.method === 'POST') {
      // Increment count
      visitorCount += 1;
      return res.status(200).json({
        count: visitorCount,
        note: 'This is a development counter. Set up Vercel KV for production persistence.'
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update visitor count' });
  }
}
