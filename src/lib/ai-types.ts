// AI Service Configuration
export interface AIConfig {
  provider: 'openai' | 'gemini' | 'claude' | 'ollama' | 'huggingface'
  apiKey?: string
  model: string
  baseUrl?: string
  temperature?: number
  maxTokens?: number
  streaming?: boolean
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model?: string
}

export interface StreamResponse {
  content: string
  done: boolean
}

export type AIProvider = {
  name: string
  models: string[]
  requiresApiKey: boolean
  freeModels?: string[]
  description: string
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o-mini'],
    requiresApiKey: true,
    description: 'Most advanced AI models, requires API key'
  },
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'],
    requiresApiKey: true,
    freeModels: ['gemini-1.5-flash'],
    description: 'Google\'s AI models with generous free tier'
  },
  claude: {
    name: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    requiresApiKey: true,
    description: 'Anthropic\'s advanced AI models'
  },
  ollama: {
    name: 'Ollama (Local)',
    models: ['llama3.2', 'llama3.1', 'gemma2', 'qwen2.5', 'mistral', 'codellama'],
    requiresApiKey: false,
    description: 'Run AI models locally on your machine'
  },
  huggingface: {
    name: 'Hugging Face',
    models: ['microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill', 'microsoft/phi-2'],
    requiresApiKey: false,
    freeModels: ['microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill'],
    description: 'Open source models via Hugging Face'
  }
}

export const DEFAULT_CONFIGS: Record<string, Partial<AIConfig>> = {
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 4000,
    streaming: true
  },
  gemini: {
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 4000,
    streaming: true
  },
  claude: {
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 4000,
    streaming: true
  },
  ollama: {
    model: 'llama3.2',
    baseUrl: 'http://localhost:11434',
    temperature: 0.7,
    maxTokens: 4000,
    streaming: true
  },
  huggingface: {
    model: 'microsoft/DialoGPT-large',
    baseUrl: 'https://api-inference.huggingface.co',
    temperature: 0.7,
    maxTokens: 1000,
    streaming: false
  }
}