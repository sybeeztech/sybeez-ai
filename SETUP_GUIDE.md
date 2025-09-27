# 🤖 Sybeez AI - ChatGPT-like Assistant

A powerful, feature-rich ChatGPT-like interface with multiple AI provider support, built with React, TypeScript, and Tailwind CSS.

![Sybeez AI Screenshot](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Sybeez+AI+Interface)

## ✨ Features

### 🤖 Multiple AI Providers
- **OpenAI GPT** (GPT-4, GPT-3.5 Turbo, GPT-4o-mini)
- **Google Gemini** (Gemini 1.5 Flash, Pro) - Free tier available!
- **Anthropic Claude** (Claude 3.5 Sonnet, Haiku, Opus)
- **Ollama** (Local AI models - Llama, Mistral, CodeLlama)
- **Hugging Face** (Open source models)

### 💬 Advanced Chat Features
- **Multi-session chats** with smart session management
- **Message editing** and regeneration
- **File attachments** with preview
- **Voice input** support
- **Real-time streaming** responses
- **Conversation search** and filtering
- **Export/Import** chat history
- **Message pinning** and favorites

### 🎨 Modern UI/UX
- **Dark/Light theme** toggle
- **Responsive design** for all devices
- **Keyboard shortcuts** for power users
- **Customizable settings** (font size, behavior)
- **Toast notifications** for better feedback
- **Loading states** and error handling

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/sybeez-ai.git
cd sybeez-ai
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Configure AI Provider

#### Option A: Google Gemini (Recommended - Free!)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. In Sybeez, go to Settings → AI Setup
5. Select "Google Gemini" and paste your API key
6. Choose "gemini-1.5-flash" (free tier: 1500 requests/day)

#### Option B: OpenAI GPT
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in and create a new API key
3. In Sybeez, select "OpenAI" and paste your key
4. Choose "gpt-4o-mini" for cost-effectiveness

#### Option C: Local AI (Ollama)
1. Install [Ollama](https://ollama.ai)
2. Run: `ollama serve`
3. Download a model: `ollama pull llama3.2`
4. In Sybeez, select "Ollama" (no API key needed!)

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env.local` file for default configurations:

```env
# Default AI Provider (optional)
VITE_DEFAULT_AI_PROVIDER=gemini

# Default API Keys (not recommended for production)
VITE_OPENAI_API_KEY=your_key_here
VITE_GEMINI_API_KEY=your_key_here
```

### AI Provider Setup Details

#### 🟢 Google Gemini (Free Tier)
- **Free quota**: 1500 requests per day
- **Best model**: `gemini-1.5-flash`
- **Cost**: Free for personal use
- **Setup time**: 2 minutes

#### 🔵 OpenAI GPT
- **Free credits**: $5 for new accounts
- **Best value**: `gpt-4o-mini` ($0.15/1M tokens)
- **Most capable**: `gpt-4` ($30/1M tokens)
- **Setup time**: 3 minutes

#### 🟡 Anthropic Claude
- **Free credits**: $5 for new accounts  
- **Best model**: `claude-3-5-sonnet-20241022`
- **Cost**: $3/1M tokens
- **Setup time**: 3 minutes

#### 🟠 Ollama (Local)
- **Cost**: Completely free
- **Privacy**: Runs entirely on your machine
- **Models**: Llama 3.2, Mistral, CodeLlama
- **Requirements**: 8GB+ RAM recommended

## 📱 Usage

### Basic Chat
1. Open Sybeez AI in your browser
2. Complete the AI setup if first time
3. Start typing your message
4. Press Enter to send (or Ctrl+Enter if disabled in settings)

### Advanced Features

#### Multi-Session Management
- **New Chat**: `Ctrl+N` or click "+" button
- **Switch Sessions**: Click on chat titles in sidebar
- **Pin Important Chats**: Click pin icon
- **Search Chats**: Use search bar in sidebar

#### Message Operations
- **Edit Message**: Click edit icon on any message
- **Regenerate Response**: Click regenerate on AI messages
- **Copy Message**: Click copy icon
- **Delete Message**: Click delete icon

#### Attachments & Voice
- **Upload Files**: Click attachment icon or drag & drop
- **Voice Input**: Click microphone icon
- **Supported Files**: Text, images, documents

#### Keyboard Shortcuts
- `Ctrl+N`: New chat
- `Ctrl+/`: Toggle shortcuts help
- `Ctrl+K`: Focus search
- `Escape`: Close modals
- `↑/↓`: Navigate message history

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **State**: React Context + Reducer
- **HTTP**: Fetch API with streaming support
- **Storage**: LocalStorage for settings & history

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── chat/            # Chat-specific components
├── contexts/            # React contexts (ChatContext, AIContext)
├── hooks/              # Custom hooks
├── lib/                # Utilities and services
│   ├── ai-service.ts   # AI provider integrations
│   └── ai-types.ts     # AI-related types
└── pages/              # Route components
```

### Adding New AI Providers

1. **Update Types** (`src/lib/ai-types.ts`):
```typescript
export const AI_PROVIDERS = {
  // ... existing providers
  myProvider: {
    name: 'My AI Provider',
    models: ['model-1', 'model-2'],
    requiresApiKey: true,
    description: 'Description of your provider'
  }
}
```

2. **Implement Service** (`src/lib/ai-service.ts`):
```typescript
private async sendMyProvider(messages: AIMessage[]): Promise<AIResponse> {
  // Implementation for your provider
}
```

3. **Add to Switch Statement**:
```typescript
switch (this.config.provider) {
  case 'myProvider':
    return this.sendMyProvider(messages)
  // ... other cases
}
```

### Building for Production
```bash
npm run build
npm run preview  # Test production build locally
```

## 🔒 Security & Privacy

### API Key Storage
- All API keys are stored in browser's `localStorage`
- Keys are never sent to any server except the AI provider
- Clear keys anytime in Settings

### Data Privacy
- All conversations are stored locally in your browser
- No data is sent to Sybeez servers
- Export your data anytime via Settings

### Recommended Security
- Use environment variables for API keys in production
- Implement rate limiting for public deployments
- Consider using a backend proxy for API calls

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Create a Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Add tests for new features
- Update documentation as needed
- Test with multiple AI providers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons
- [Radix UI](https://www.radix-ui.com/) for accessibility
- OpenAI, Google, Anthropic for their amazing AI APIs

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/sybeez-ai/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/sybeez-ai/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/sybeez-ai/wiki)

---

**Made with ❤️ by the Sybeez Team**

*Transform your conversations with the power of AI!*