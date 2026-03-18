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
npx serve frontend            # Alternative static server
```

## Architecture

### Pages
- `frontend/index.html` - Home page with hero section, about preview, featured work
- `frontend/resume.html` - Professional resume
- `frontend/chat.html` - AI-powered chat (two modes: Consultant & Resume)
- `frontend/cool.html` - Interactive particle experiments

### Backend
- `backend/server.js` - Express backend server (handles chat API and static files)

### Key Files
- `backend/server.js` - Express backend server (also handles Vercel deployment)
- `frontend/js/config.js` - Environment-aware API URL configuration
- `frontend/js/home-new.js` - Home page logic
- `frontend/js/chat.js` - Chat functionality
- `frontend/js/cool.js` - Particle experiments
- `backend/prompts/consultant.md` - System prompt for consultant mode
- `backend/prompts/resume.md` - System prompt for resume mode
- `backend/prompts/analysis.md` - System prompt for message analysis

### Chat Feature
The chat uses:
1. **Consultant Mode**: Design and engineering expert (uses `backend/prompts/consultant.md`)
2. **Resume Mode**: AI assistant with knowledge about LIU Xinyu's background (uses `backend/prompts/resume.md`)

### Deployment
- Deploy to Vercel for full functionality (frontend + API)
- `vercel.json` configures routing: `/api/*` → backend/server.js
- Environment variable required: `DEEPSEEK_API_KEY`

## Environment

Create `.env.local` for local development:
```
DEEPSEEK_API_KEY=your_api_key_here
PORT=3000
```