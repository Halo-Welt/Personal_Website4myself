# Deployment Guide - Vercel

This guide will help you deploy your personal website to Vercel with all features enabled.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- GitHub account
-

## Step 1: Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configure Environment Variables**
   - Go to your project Settings → Environment Variables
   - Add the following variable:
     - Name: ``
     - Value: `sk-c28290ea731946878bd94393755f7e8c`
   - Click "Save"

4. **Redeploy**
   - After adding environment variables, trigger a new deployment
   - Go to "Deployments" → Click "..." → "Redeploy"

## Step 2: Enable Persistent Storage (Optional)

To make the visitor counter and danmu messages persistent across deployments:

1. **Install Vercel KV**
   - Go to your project in Vercel Dashboard
   - Click "Storage" → "Create Database"
   - Select "KV" (Redis)
   - Follow the setup wizard

2. **Update API Files**
   - Uncomment the Vercel KV code in `api/visitor.js` and `api/message.js`
   - The fallback in-memory storage will work for development

## Step 3: Update Domain (Optional)

1. Go to your project Settings → Domains
2. Add your custom domain or use the generated `.vercel.app` domain
3. Update `js/config.js` if using a custom domain

## Step 4: Test All Features

After deployment, test these features:

- ✅ Home page loads with vertical layout
- ✅ Visitor counter displays and increments
- ✅ Danmu messages can be submitted and display
- ✅ Footer background is beige
- ✅ Resume page has collapsible GitHub section
- ✅ Cool page experiments have fullscreen buttons
- ✅ Chat functionality works with AI responses

## Troubleshooting

### Chat not working
- Check that `` is set in Vercel environment variables
- Check the browser console for errors
- Verify the API endpoint is accessible

### Visitor counter resets
- This is expected without Vercel KV
- Install Vercel KV for persistent storage

### Danmu messages not persisting
- Same as visitor counter - install Vercel KV

### API routes returning 404
- Check that `vercel.json` is in the project root
- Verify the API files are in the `api/` directory

## Environment Variables Summary

| Variable | Description | Required |
|----------|-------------|----------|
| `` | Your | Yes |
| `KV_URL` | Vercel KV URL | Optional |
| `KV_REST_API_URL` | Vercel KV REST API URL | Optional |
| `KV_REST_API_TOKEN` | Vercel KV REST API Token | Optional |

## Local Development

For local development with the API:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```
   =sk-c28290ea731946878bd94393755f7e8c
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Production URL

After deployment, your site will be available at:
```
https://your-project-name.vercel.app
```

Update this URL in your documentation and social links!
