import { AIConfig, AIMessage, AIResponse, StreamResponse } from './ai-types'

export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.sendOpenAI(messages)
      case 'gemini':
        return this.sendGemini(messages)
      case 'claude':
        return this.sendClaude(messages)
      case 'ollama':
        return this.sendOllama(messages)
      case 'huggingface':
        return this.sendHuggingFace(messages)
      default:
        throw new Error(`Unsupported AI provider: ${this.config.provider}`)
    }
  }

  async *streamMessage(messages: AIMessage[]): AsyncGenerator<StreamResponse> {
    if (!this.config.streaming) {
      const response = await this.sendMessage(messages)
      yield { content: response.content, done: true }
      return
    }

    switch (this.config.provider) {
      case 'openai':
        yield* this.streamOpenAI(messages)
        break
      case 'gemini':
        yield* this.streamGemini(messages)
        break
      case 'claude':
        yield* this.streamClaude(messages)
        break
      case 'ollama':
        yield* this.streamOllama(messages)
        break
      default:
        const response = await this.sendMessage(messages)
        yield { content: response.content, done: true }
    }
  }

  private async sendOpenAI(messages: AIMessage[]): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    }
  }

  private async *streamOpenAI(messages: AIMessage[]): AsyncGenerator<StreamResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No response stream')

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() && line.startsWith('data: '))
        
        for (const line of lines) {
          const data = line.slice(6) // Remove 'data: '
          if (data === '[DONE]') {
            yield { content: '', done: true }
            return
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content || ''
            if (content) {
              yield { content, done: false }
            }
          } catch (e) {
            // Ignore parsing errors for streaming chunks
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  private async sendGemini(messages: AIMessage[]): Promise<AIResponse> {
    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })).filter(msg => msg.role !== 'system') // Gemini doesn't use system messages the same way

    const systemPrompt = messages.find(m => m.role === 'system')?.content || ''

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Gemini API error')
    }

    const data = await response.json()
    return {
      content: data.candidates[0].content.parts[0].text,
      model: this.config.model
    }
  }

  private async *streamGemini(messages: AIMessage[]): AsyncGenerator<StreamResponse> {
    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })).filter(msg => msg.role !== 'system')

    const systemPrompt = messages.find(m => m.role === 'system')?.content || ''

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:streamGenerateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Gemini API error')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No response stream')

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line)
            if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
              const content = parsed.candidates[0].content.parts[0].text
              yield { content, done: false }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
      yield { content: '', done: true }
    } finally {
      reader.releaseLock()
    }
  }

  private async sendClaude(messages: AIMessage[]): Promise<AIResponse> {
    // Separate system message from conversation
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemMessage,
        messages: conversationMessages
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Claude API error')
    }

    const data = await response.json()
    return {
      content: data.content[0].text,
      usage: data.usage,
      model: data.model
    }
  }

  private async *streamClaude(messages: AIMessage[]): AsyncGenerator<StreamResponse> {
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemMessage,
        messages: conversationMessages,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Claude API error')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No response stream')

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() && line.startsWith('data: '))
        
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            yield { content: '', done: true }
            return
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta') {
              yield { content: parsed.delta.text || '', done: false }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  private async sendOllama(messages: AIMessage[]): Promise<AIResponse> {
    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens
        }
      })
    })

    if (!response.ok) {
      throw new Error('Ollama API error')
    }

    const data = await response.json()
    return {
      content: data.message.content,
      model: this.config.model
    }
  }

  private async *streamOllama(messages: AIMessage[]): AsyncGenerator<StreamResponse> {
    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: true,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens
        }
      })
    })

    if (!response.ok) {
      throw new Error('Ollama API error')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No response stream')

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line)
            if (parsed.message?.content) {
              yield { content: parsed.message.content, done: parsed.done || false }
            }
            if (parsed.done) {
              return
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  private async sendHuggingFace(messages: AIMessage[]): Promise<AIResponse> {
    // Simple implementation for Hugging Face inference API
    const lastMessage = messages[messages.length - 1]?.content || ''
    
    const response = await fetch(`${this.config.baseUrl}/models/${this.config.model}`, {
      method: 'POST',
      headers: {
        'Authorization': this.config.apiKey ? `Bearer ${this.config.apiKey}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: lastMessage,
        parameters: {
          temperature: this.config.temperature,
          max_length: this.config.maxTokens
        }
      })
    })

    if (!response.ok) {
      throw new Error('Hugging Face API error')
    }

    const data = await response.json()
    return {
      content: Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '',
      model: this.config.model
    }
  }
}