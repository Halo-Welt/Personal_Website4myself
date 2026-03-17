# Personal Website - Desigineer

A personal portfolio website of LIU Xinyu (Desigineer) - AI Product Manager, Designer & Engineer. Built with vanilla HTML/CSS/JS and Three.js.

## Website Pages

- **Home** - Portfolio showcase with 3D model viewer and audio visualizer
- **Resume** - Professional resume with education, experience, and skills
- **GitHub** - Open source projects and repository showcase
- **Chat** - AI-powered chat with two modes (Professional & Resume)
- **Cool** - Interactive particle experiments and visual effects

## Project Structure

```
Personal_Website4myself/
├── css/
│   ├── style.css              # Global styles, variables, accessibility
│   ├── components/            # Component-specific styles
│   │   ├── navbar.css
│   │   └── footer.css
│   ├── chat.css               # Chat page styles
│   ├── cool.css               # Experiments page styles
│   ├── github.css             # GitHub page styles
│   ├── resume.css             # Resume page styles
│   └── audio-visualizer.css   # Audio visualizer styles
├── js/
│   ├── config.js              # Environment configuration
│   ├── main.js                # Main JavaScript
│   ├── chat.js                # Chat functionality
│   ├── particles.js           # Particle system engine
│   ├── spotlight.js           # Spotlight effect
│   ├── model-viewer.js        # 3D model viewer
│   ├── audio-visualizer.js    # Audio visualizer
│   └── components/
│       ├── navbar.js          # Reusable navigation component
│       └── footer.js          # Reusable footer component
├── src/
│   └── Animations/
│       └── SplashCursor.js    # Custom cursor effect
├── images/                    # Images and assets
│   ├── favicon.svg           # Site favicon
│   ├── og-image.svg          # Social sharing image
│   ├── profile.JPG           # Profile picture
│   └── Wechat.jpg            # WeChat QR code
├── index.html                 # Home page
├── resume.html                # Resume page
├── github.html               # GitHub page
├── chat.html                 # Chat page
├── cool.html                 # Experiments page
├── server.js                 # Backend server (Express)
├── package.json              # Node.js dependencies
├── vercel.json               # Vercel deployment config
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Prerequisites

- Node.js 18+ (for native fetch support)
- npm or yarn

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/Halo-Welt/Personal_Website4myself.git
cd Personal_Website4myself
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
# (required for chat functionality)
DEEPSEEK_API_KEY=your_api_key_here

# Server port (optional, defaults to 3000)
PORT=3000
```

### 4. Get an API Key

1. Visit the API provider website
2. Sign up for an account
3. Generate an API key
4. Add it to your `.env` file

## Development

### Frontend-only (static files)

Open `index.html` directly in a browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

### Full development (frontend + backend)

Start the backend server:

```bash
npm start
```

The server runs at `http://localhost:3000`.

For development with auto-restart:

```bash
npm run dev
```

## Deployment

### Full Deployment (Frontend + Chat API)

To use the chat feature on GitHub Pages, you need to deploy the API separately to Vercel:

#### Step 1: Deploy API to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the API:
   ```bash
   vercel
   ```

4. Add environment variable in Vercel Dashboard:
   - Go to your project settings
   - Add `DEEPSEEK_API_KEY` with your API key

5. Get your Vercel deployment URL (e.g., `https://your-project.vercel.app`)

#### Step 2: Update API URL

Edit `js/config.js` and update the production URL:
```javascript
return 'https://your-project.vercel.app';  // Replace with your Vercel URL
```

#### Step 3: Deploy Frontend to GitHub Pages

1. Push your code to GitHub
2. Go to Repository Settings > Pages
3. Select "main" branch as source
4. Your site will be available at: `https://halo-welt.github.io/Personal_Website4myself/`

### Local Development

For local development, you can run the backend server:

```bash
npm install
npm start
```

The server will run at `http://localhost:3000`

## Chat Functionality

The AI chat feature supports two modes:

1. **Professional Mode**: Design and engineering expert
2. **Resume Mode**: AI assistant with knowledge about LIU Xinyu's background

### Configuration

The chat uses environment-aware URLs via `js/config.js`:
- Development: `http://localhost:3000/api/chat`
- Production: Update the production URL in `js/config.js`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lighthouse Performance: >90
- Lighthouse SEO: 100
- Lighthouse Accessibility: >90
- Mobile-responsive design

## Accessibility

- Skip navigation links
- ARIA labels on interactive elements
- Semantic HTML
- Keyboard navigable
- Screen reader friendly

## License

Copyright © 2025 LIU Xinyu. All rights reserved.
