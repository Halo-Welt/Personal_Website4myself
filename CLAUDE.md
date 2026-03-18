# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for LIU Xinyu (Desigineer) - AI Product Manager, Designer & Engineer. Built with vanilla HTML/CSS/JS with Express backend for the AI chat feature.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start production server (Express on port 3000)
npm run dev          # Start development server with nodemon auto-restart
```

For static file development:
```bash
python -m http.server 8000   # Serve static files
npx serve .                  # Alternative static server
```

## Architecture

### Pages
- `index.html` - Home page with hero section, about preview, featured work
- `resume.html` - Professional resume
- `chat.html` - AI-powered chat (two modes: Consultant & Resume)
- `cool.html` - Interactive particle experiments

### API (Vercel Serverless Functions)
- `api/chat.js` -

### Key Files
- `server.js` - Express backend server (also handles Vercel deployment)
- `js/config.js` - Environment-aware API URL configuration
- `js/home-new.js` - Home page logic
- `js/chat.js` - Chat functionality
- `js/cool.js` - Particle experiments
- `prompts/consultant.md` - System prompt for consultant mode
- `prompts/resume.md` - System prompt for resume mode

### Chat Feature
The chat uses :
1. **Consultant Mode**: Design and engineering expert (uses `prompts/consultant.md`)
2. **Resume Mode**: AI assistant with knowledge about LIU Xinyu's background (uses `prompts/resume.md`)

### Deployment
- Deploy to Vercel for full functionality (frontend + API)
- `vercel.json` configures routing: `/api/*` → server.js
- Environment variable required: ``

## Environment

Create `.env.local` for local development:
```
DEEPSEEK_API_KEY=your_api_key_here
PORT=3000
```
