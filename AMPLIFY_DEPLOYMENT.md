# AWS Amplify Deployment Guide for Sybeez AI

## 🚀 Quick Fix for "AI not configured" Error

When you deploy to AWS Amplify, you need to add environment variables in the Amplify console.

### Method 1: Environment Variables (Recommended)

1. **Go to AWS Amplify Console:**
   - Visit: https://console.aws.amazon.com/amplify/
   - Find your Sybeez AI app
   - Click on your app name

2. **Add Environment Variables:**
   - Click "App settings" → "Environment variables"
   - Click "Manage variables"
   - Add these variables:

   | Variable Name | Value |
   |---------------|-------|
   | `VITE_OPENAI_API_KEY` | `sk-proj-your-openai-key-here` |
   | `VITE_GEMINI_API_KEY` | `your-gemini-key` (optional) |
   | `VITE_CLAUDE_API_KEY` | `your-claude-key` (optional) |

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click "Redeploy this version"
   - Wait for build to complete

### Method 2: UI Setup (Alternative)

Users can also configure API keys directly in the deployed app:

1. Open your deployed Sybeez AI app
2. Click the **Settings** button (⚙️) in the sidebar
3. Go to **"AI Setup"** tab
4. Select **"OpenAI"** as provider
5. Enter your API key
6. Click **"Save & Test Connection"**

## 🔒 Security Notes

- ✅ Environment variables in Amplify are secure
- ✅ API keys are encrypted at rest
- ✅ Only your app can access them
- ✅ Not exposed in client-side code
- ❌ Never put API keys directly in your source code

## 🎯 Supported AI Providers

Your app supports multiple AI providers:

- **OpenAI GPT** (gpt-4, gpt-3.5-turbo)
- **Google Gemini** (gemini-pro, gemini-pro-vision)
- **Anthropic Claude** (claude-3-sonnet, claude-3-haiku)
- **Ollama** (local models)
- **Hugging Face** (various models)

## 🔄 Build Configuration

Amplify should automatically detect your build settings, but if needed:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## ✅ Verification Steps

After deployment:
1. Visit your Amplify app URL
2. Try sending a message
3. Should get AI response (not the "not configured" message)
4. Check browser console for any errors

## 🆘 Troubleshooting

**Still seeing "AI not configured"?**
- Check environment variables are saved in Amplify
- Verify the variable names exactly match: `VITE_OPENAI_API_KEY`
- Ensure you triggered a new build after adding variables
- Check your API key is valid and has credits

**API errors?**
- Verify your OpenAI API key is active
- Check you have sufficient API credits
- Test the key locally first

## 📞 Support

If you continue having issues:
1. Check the browser console for errors
2. Verify your API key works in OpenAI Playground
3. Contact support with specific error messages