# Environment Variables for Vercel Deployment

## Copy these to Vercel Dashboard

When deploying to Vercel, add these environment variables in the project settings:

### Required Variables

```bash
# Backend API URL (replace with your deployed backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Better Auth Secret (secure random string - already generated)
BETTER_AUTH_SECRET=gtiFcPgHWaMhjowsQeFmXYj2a3PAZwiTQQybH6z6/HG4=

# Better Auth URL (your Vercel deployment URL - update after first deploy)
BETTER_AUTH_URL=https://your-app.vercel.app
```

## Important Notes

⚠️ **NEXT_PUBLIC_API_URL**: 
- If backend not deployed yet, you can use `http://localhost:8000` temporarily
- The app won't work in production until you deploy the backend and update this
- Don't forget to configure CORS on your backend to allow your Vercel domain

✅ **BETTER_AUTH_SECRET**: 
- Already generated: `gtiFcPgHWaMhjowsQeFmXYj2a3PAZwiTQQybH6z6/HG4=`
- Keep this secret secure
- Must be the same on both frontend and backend

🔄 **BETTER_AUTH_URL**: 
- Leave empty on first deploy
- After deployment, update with your actual Vercel URL
- Then redeploy to apply changes

## How to Add in Vercel Dashboard

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - Enter the **Name** (e.g., `NEXT_PUBLIC_API_URL`)
   - Enter the **Value**
   - Select **Production**, **Preview**, and **Development** environments
   - Click **Save**
4. After adding all variables, redeploy your project

## How to Add via Vercel CLI

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter value when prompted

vercel env add BETTER_AUTH_SECRET production
# Enter value when prompted

vercel env add BETTER_AUTH_URL production
# Enter value when prompted
```
