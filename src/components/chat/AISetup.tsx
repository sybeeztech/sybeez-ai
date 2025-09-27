import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Check, X, ExternalLink, Key, Settings, Zap, Shield } from 'lucide-react'
import { useAI } from '../../contexts/AIContext'
import { AI_PROVIDERS, DEFAULT_CONFIGS } from '../../lib/ai-types'
import { toast } from 'sonner'

interface AISetupProps {
  onComplete?: () => void
}

export function AISetup({ onComplete }: AISetupProps) {
  const { config, updateConfig, saveApiKey, getApiKey, clearApiKey, testConnection } = useAI()
  const [selectedProvider, setSelectedProvider] = useState<string>(config?.provider || 'gemini')
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  const currentProvider = AI_PROVIDERS[selectedProvider]
  const savedApiKey = getApiKey(selectedProvider)

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    setApiKey('')
    const defaults = DEFAULT_CONFIGS[provider]
    updateConfig({ 
      provider: provider as any,
      ...defaults
    })
  }

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }
    saveApiKey(selectedProvider, apiKey)
    setApiKey('')
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    try {
      await testConnection()
    } finally {
      setTestingConnection(false)
    }
  }

  const handleCompleteSetup = () => {
    if (!config) {
      toast.error('Please configure an AI provider first')
      return
    }

    if (currentProvider.requiresApiKey && !savedApiKey) {
      toast.error('Please provide an API key for this provider')
      return
    }

    toast.success('AI setup complete! You can now chat with AI.')
    onComplete?.()
  }

  const getSetupInstructions = (provider: string) => {
    const instructions = {
      openai: {
        title: 'OpenAI Setup',
        steps: [
          'Visit https://platform.openai.com/api-keys',
          'Sign in to your OpenAI account',
          'Create a new API key',
          'Copy and paste it below'
        ],
        note: 'OpenAI offers $5 free credits for new accounts. GPT-4o-mini is very cost-effective.'
      },
      gemini: {
        title: 'Google Gemini Setup',
        steps: [
          'Visit https://aistudio.google.com/app/apikey',
          'Sign in with your Google account',
          'Create a new API key',
          'Copy and paste it below'
        ],
        note: 'Gemini offers a generous free tier with 1500 requests per day for gemini-1.5-flash.'
      },
      claude: {
        title: 'Anthropic Claude Setup',
        steps: [
          'Visit https://console.anthropic.com/settings/keys',
          'Sign in to your Anthropic account',
          'Create a new API key',
          'Copy and paste it below'
        ],
        note: 'Claude offers $5 free credits for new accounts. Claude 3.5 Sonnet is highly capable.'
      },
      ollama: {
        title: 'Ollama Local Setup',
        steps: [
          'Install Ollama from https://ollama.ai',
          'Run: ollama serve',
          'Download a model: ollama pull llama3.2',
          'No API key required!'
        ],
        note: 'Run AI models locally on your machine. Free but requires decent hardware.'
      },
      huggingface: {
        title: 'Hugging Face Setup',
        steps: [
          'Visit https://huggingface.co/settings/tokens',
          'Sign in to your Hugging Face account',
          'Create a new token (optional for free models)',
          'Many models work without a token'
        ],
        note: 'Access to thousands of open-source models. Many work without API keys.'
      }
    }
    return instructions[provider as keyof typeof instructions]
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">🤖 AI Setup Wizard</h2>
        <p className="text-muted-foreground">
          Choose your AI provider and get started with real ChatGPT-like conversations
        </p>
      </div>

      <Tabs value="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Choose Provider</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test & Complete</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all ${selectedProvider === key ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => handleProviderChange(key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <div className="flex gap-2">
                      {!provider.requiresApiKey && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Free
                        </Badge>
                      )}
                      {provider.freeModels && (
                        <Badge variant="outline" className="text-xs">
                          Free Tier
                        </Badge>
                      )}
                      {selectedProvider === key && (
                        <Badge className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {provider.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Available Models:</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.models.slice(0, 3).map(model => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                      {provider.models.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.models.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          {selectedProvider && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    {currentProvider.name} Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select 
                        value={config?.model || DEFAULT_CONFIGS[selectedProvider]?.model}
                        onValueChange={(value) => updateConfig({ model: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentProvider.models.map(model => (
                            <SelectItem key={model} value={model}>
                              <div className="flex items-center gap-2">
                                {model}
                                {currentProvider.freeModels?.includes(model) && (
                                  <Badge variant="secondary" className="text-xs">Free</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Temperature ({config?.temperature || 0.7})</Label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config?.temperature || 0.7}
                        onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower = more focused, Higher = more creative
                      </p>
                    </div>
                  </div>

                  {selectedProvider === 'ollama' && (
                    <div className="space-y-2">
                      <Label>Base URL</Label>
                      <Input
                        placeholder="http://localhost:11434"
                        value={config?.baseUrl || 'http://localhost:11434'}
                        onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {currentProvider.requiresApiKey && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      API Key Setup
                    </CardTitle>
                    <CardDescription>
                      {savedApiKey ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          API key saved securely
                        </span>
                      ) : (
                        'Enter your API key to enable AI features'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter your API key..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSaveApiKey}
                        disabled={!apiKey.trim()}
                      >
                        Save Key
                      </Button>
                      {savedApiKey && (
                        <Button 
                          variant="outline" 
                          onClick={() => clearApiKey(selectedProvider)}
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    <Alert>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">{getSetupInstructions(selectedProvider)?.title}</p>
                          <ol className="list-decimal list-inside space-y-1 text-sm">
                            {getSetupInstructions(selectedProvider)?.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                          <p className="text-sm text-muted-foreground mt-2">
                            💡 {getSetupInstructions(selectedProvider)?.note}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Your AI Configuration</CardTitle>
              <CardDescription>
                Make sure everything is working before you start chatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleTestConnection}
                  disabled={testingConnection || !config}
                  className="flex-1"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test AI Connection
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Current Configuration:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Provider:</span> {currentProvider?.name || 'None'}</p>
                  <p><span className="font-medium">Model:</span> {config?.model || 'Not set'}</p>
                  <p><span className="font-medium">Temperature:</span> {config?.temperature || 'Not set'}</p>
                  <p>
                    <span className="font-medium">API Key:</span> 
                    <span className={savedApiKey ? 'text-green-600' : 'text-red-600'}>
                      {savedApiKey ? ' ✓ Configured' : ' ✗ Required'}
                    </span>
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleCompleteSetup}
                size="lg"
                className="w-full"
                disabled={!config || (currentProvider?.requiresApiKey && !savedApiKey)}
              >
                Complete Setup & Start Chatting
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}