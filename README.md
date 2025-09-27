# 🤖 Sybeez AI - ChatGPT-like Assistant

A powerful, feature-rich ChatGPT-like interface with multiple AI provider support, built with React, TypeScript, and Tailwind CSS.

## ✨ Key Features

- **🤖 Multiple AI Providers**: OpenAI GPT, Google Gemini, Anthropic Claude, Ollama (local), Hugging Face
- **💬 Advanced Chat**: Multi-session, message editing, attachments, voice input, streaming responses
- **🎨 Modern UI**: Dark/light theme, responsive design, keyboard shortcuts, customizable settings
- **🔒 Privacy First**: All data stored locally, API keys secured in browser storage
- **⚡ Free Options**: Google Gemini (1500 requests/day), Ollama (completely local), HuggingFace

## 🚀 Quick Start

### Local Development
1. **Clone & Install**
   ```bash
   git clone https://github.com/sybeeztech/sybeez-ai.git
   cd sybeez-ai
   npm install
   ```

2. **Set up API Keys** (Optional - can also be done in the UI)
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your API keys
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### 🌐 Deploy to AWS Amplify

1. **Connect Repository**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app" → "GitHub"
   - Select this repository

2. **Configure Environment Variables** (Optional)
   
   **If Environment Variables option is available:**
   - Go to App Settings → Environment Variables (or Build Settings → Environment Variables)
   - Add: `VITE_OPENAI_API_KEY` = `your-openai-key`
   - Add other AI provider keys as needed
   
   **If Environment Variables option is NOT available:**
   - Don't worry! Users can configure API keys directly in the deployed app
   - Skip to step 3

3. **Deploy**
   - Amplify automatically builds and deploys
   - Your app will be live at: `https://your-app.amplifyapp.com`

4. **Setup AI Provider** (If no environment variables were set)
   - Open your deployed app
   - Click **Settings** (⚙️) in the sidebar
   - Go to **AI Setup** tab
   - Select your preferred AI provider
   - Enter your API key
   - Click **Save & Test Connection**

📖 **Detailed deployment guide**: See [AMPLIFY_DEPLOYMENT.md](AMPLIFY_DEPLOYMENT.md)

## ⚙️ Setup AI Provider (Choose one):
   
   **Option A: Google Gemini (Free & Easy)**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Get your free API key (1500 requests/day)
   - Configure in Settings → AI Setup

   **Option B: Local AI (Completely Free)**
   - Install [Ollama](https://ollama.ai)
   - Run: `ollama serve` and `ollama pull llama3.2`
   - No API key needed!

   **Option C: OpenAI GPT (Most Powerful)**
   - Get API key from [OpenAI](https://platform.openai.com/api-keys)
   - $5 free credits for new accounts

3. **Start Chatting!**
   - Open http://localhost:8081 (or shown port)
   - Complete the setup wizard
   - Begin your AI conversations

## 📖 Full Documentation

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions, all features, and development guide.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI  
- **AI Integration**: Multi-provider service layer with streaming support
- **Storage**: Browser LocalStorage for privacy and offline capability

## 🤝 Contributing

Contributions welcome! See [SETUP_GUIDE.md](SETUP_GUIDE.md) for development setup and contribution guidelines.

---

**Transform your conversations with the power of AI!** 🚀

## 🚀 Features

### Core Chat Functionality
- **💬 Real-time Conversations** - Instant AI responses with typing indicators
- **🎯 Multiple Chat Sessions** - Create, manage, and switch between different conversations
- **📝 Message Management** - Edit, delete, copy, and regenerate messages
- **🔄 Message History** - Persistent chat history with auto-save functionality
- **📌 Pin Important Chats** - Pin frequently used conversations for quick access

### Advanced Features
- **🎤 Voice Input** - Record voice messages with built-in audio recording
- **📎 File Attachments** - Upload and attach files (images, documents, text files)
- **🔍 Smart Search** - Search across all conversations and messages
- **⌨️ Keyboard Shortcuts** - Extensive keyboard shortcuts for power users
- **🎨 Rich Text Formatting** - Support for markdown, code blocks, and formatting
- **🗣️ Text-to-Speech** - Read messages aloud with built-in speech synthesis

### User Experience
- **🌙 Dark Theme** - Beautiful dark theme with purple/blue gradients
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **⚡ Fast Performance** - Optimized with React 18 and Vite
- **🎭 Smooth Animations** - Polished animations and transitions
- **🔔 Toast Notifications** - User-friendly feedback for all actions

### Data Management
- **💾 Export/Import** - Export conversations as JSON, import chat history
- **🗂️ Session Management** - Organize chats with titles, timestamps, and metadata
- **🏠 Local Storage** - All data stored locally in your browser
- **🔒 Privacy First** - No data sent to external servers
- **🧹 Data Control** - Clear all data with one click

### Customization
- **⚙️ Settings Panel** - Comprehensive settings with multiple tabs
- **🎨 Theme Options** - Dark/light theme support
- **📏 Font Sizing** - Adjustable text size for accessibility
- **🎵 Sound Controls** - Toggle sound effects and notifications
- **⌨️ Input Preferences** - Customize message sending behavior

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Framework:** Tailwind CSS, Radix UI, shadcn/ui
- **State Management:** React Context + useReducer
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Animations:** Tailwind CSS + Custom CSS
- **Notifications:** Sonner (toast notifications)
- **Build Tool:** Vite
- **Package Manager:** npm

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Sybeez AI"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8081` (or the port shown in terminal)

## ⌨️ Keyboard Shortcuts

- **⌘/Ctrl + N** - Create new chat
- **⌘/Ctrl + S** - Export current chat
- **⌘/Ctrl + /** - Focus search bar
- **⌘/Ctrl + K** - Focus message input
- **⌘/Ctrl + 1-9** - Switch between chats
- **Enter** - Send message
- **Shift + Enter** - New line in message
- **Escape** - Cancel edit mode

## 🎯 Usage Guide

### Starting a Conversation
1. Click "New Chat" or use `⌘+N`
2. Type your message in the input field
3. Press Enter to send or Shift+Enter for a new line
4. Watch as Sybeez responds with intelligent answers

### Managing Conversations
- **Search:** Use the search bar to find specific chats or messages
- **Pin Chats:** Click the pin icon to keep important conversations at the top
- **Export:** Download conversation history as JSON files
- **Import:** Upload previously exported chat files

### Using Attachments
1. Click the paperclip icon in the message input
2. Select files (images, documents, text files up to 10MB)
3. Files will be attached to your message
4. Send the message with attachments

### Voice Recording
1. Click the microphone icon
2. Allow microphone permissions when prompted
3. Speak your message
4. Click the microphone again to stop recording
5. The voice message will be attached automatically

### Message Actions
- **Copy:** Click the copy icon to copy message text
- **Edit:** Click the edit icon on your messages to modify them
- **Delete:** Remove any message from the conversation
- **Regenerate:** Get a new AI response for any message
- **Read Aloud:** Have AI responses read to you

## 🔧 Configuration

### Settings Options
- **Theme:** Switch between dark and light themes
- **Font Size:** Adjust text size (small, medium, large)
- **Send on Enter:** Toggle Enter key behavior
- **Streaming:** Enable/disable response streaming
- **Sound Effects:** Control audio feedback
- **Auto-save:** Manage automatic chat saving

### Data Storage
- All conversations are stored locally in your browser
- No data is transmitted to external servers
- Export feature allows backing up conversations
- Clear all data option available in settings

## 🏗️ Architecture

The application follows a modern React architecture:

```
src/
├── components/          # Reusable UI components
│   ├── chat/           # Chat-specific components
│   └── ui/             # shadcn/ui components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── pages/              # Page components
```

### Key Components
- **ChatContext:** Global state management for conversations
- **ChatLayout:** Main application layout with sidebar
- **ChatArea:** Message display and conversation interface  
- **ChatInput:** Message composition with attachments and voice
- **ChatMessage:** Individual message rendering with actions
- **ChatSidebar:** Navigation and session management
- **SettingsModal:** Configuration and preferences

## 🎨 Customization

### Adding New Features
1. Extend the `ChatContext` for new state management
2. Create components in the appropriate directory
3. Use existing UI components from shadcn/ui
4. Follow the established TypeScript patterns

### Styling
- Tailwind CSS for utility-first styling
- CSS custom properties for theming
- Responsive design patterns
- Smooth animations and transitions

### AI Integration
The current implementation uses simulated AI responses. To integrate with real AI services:

1. Replace the `generateAIResponse` function in `ChatContext`
2. Add API integration (OpenAI, Anthropic, etc.)
3. Implement streaming responses if desired
4. Add error handling for API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Radix UI](https://radix-ui.com/) for accessible components
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Lucide](https://lucide.dev/) for beautiful icons
- [Vite](https://vitejs.dev/) for fast development experience

---

**Sybeez AI** - Where conversations come alive! 🚀

Built with ❤️ by Silver Stalan
# sybeez-ai
