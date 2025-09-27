import React, { createContext, useContext, useState, useEffect } from 'react'
import { AIConfig, AI_PROVIDERS, DEFAULT_CONFIGS } from '../lib/ai-types'
import { toast } from 'sonner'

interface AIContextType {
  config: AIConfig | null
  isConfigured: boolean
  updateConfig: (config: Partial<AIConfig>) => void
  saveApiKey: (provider: string, apiKey: string) => void
  getApiKey: (provider: string) => string | null
  clearApiKey: (provider: string) => void
  testConnection: () => Promise<boolean>
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AIConfig | null>(() => {
    const saved = localStorage.getItem('ai-config')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    
    // Auto-configure OpenAI if no config exists
    const defaultConfig: AIConfig = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 4000,
      streaming: true
    }
    
    // Save the default config
    localStorage.setItem('ai-config', JSON.stringify(defaultConfig))
    return defaultConfig
  })

  const getApiKey = (provider: string): string | null => {
    // Check for environment variables first
    if (provider === 'openai') {
      const savedKey = localStorage.getItem(`ai-key-${provider}`)
      return savedKey || import.meta.env.VITE_OPENAI_API_KEY || null
    }
    return localStorage.getItem(`ai-key-${provider}`)
  }

  const isConfigured = !!config && (
    !AI_PROVIDERS[config.provider].requiresApiKey || 
    !!getApiKey(config.provider)
  )

  const updateConfig = (newConfig: Partial<AIConfig>) => {
    const updated = { ...config, ...newConfig } as AIConfig
    
    // Apply defaults for the provider
    if (newConfig.provider && newConfig.provider !== config?.provider) {
      const defaults = DEFAULT_CONFIGS[newConfig.provider]
      Object.assign(updated, defaults, newConfig)
    }

    setConfig(updated)
    localStorage.setItem('ai-config', JSON.stringify(updated))
    toast.success('AI configuration updated')
  }

  const saveApiKey = (provider: string, apiKey: string) => {
    localStorage.setItem(`ai-key-${provider}`, apiKey)
    toast.success('API key saved securely')
  }

  const clearApiKey = (provider: string) => {
    localStorage.removeItem(`ai-key-${provider}`)
    toast.success('API key cleared')
  }

  const testConnection = async (): Promise<boolean> => {
    if (!config) {
      toast.error('No AI configuration found')
      return false
    }

    try {
      // Import AIService dynamically to avoid circular dependency
      const { AIService } = await import('../lib/ai-service')
      
      const apiKey = getApiKey(config.provider)
      const testConfig = { ...config, apiKey }
      
      const service = new AIService(testConfig)
      
      // Send a simple test message
      await service.sendMessage([
        { role: 'user', content: 'Hello! This is a test message.' }
      ])
      
      toast.success('Connection test successful!')
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      toast.error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  return (
    <AIContext.Provider value={{
      config,
      isConfigured,
      updateConfig,
      saveApiKey,
      getApiKey,
      clearApiKey,
      testConnection
    }}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}