import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Bot, Sparkles, MessageCircle, Settings, ArrowRight } from 'lucide-react'
import { AISetup } from './AISetup'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

interface WelcomeScreenProps {
  onComplete?: () => void
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [showAISetup, setShowAISetup] = useState(false)

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'Multiple AI Providers',
      description: 'Choose from OpenAI GPT, Google Gemini, Anthropic Claude, and more'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Advanced Chat Features',
      description: 'Message editing, attachments, voice input, and conversation search'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Smart Interface',
      description: 'Multi-session chats, keyboard shortcuts, and customizable settings'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden bg-background border">
              <img 
                src="/sybeezlogo.png" 
                alt="Sybeez Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Sybeez AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent AI assistant with ChatGPT-like capabilities. 
            Connect to multiple AI providers and start having meaningful conversations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-2 text-primary">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Provider Badges */}
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Supported AI Providers:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              OpenAI GPT
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Google Gemini
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              Anthropic Claude
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Ollama (Local)
            </Badge>
            <Badge variant="outline">+ More</Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => setShowAISetup(true)}
            className="flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Setup AI Provider
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onComplete?.()}
          >
            Skip for Now
          </Button>
        </div>

        {/* Quick Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            💡 You can always configure AI providers later in Settings
          </p>
          <p className="text-xs text-muted-foreground">
            🔒 Your API keys are stored securely in your browser's local storage
          </p>
        </div>
      </div>

      {/* AI Setup Dialog */}
      <Dialog open={showAISetup} onOpenChange={setShowAISetup}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Setup Your AI Assistant</DialogTitle>
          </DialogHeader>
          <AISetup 
            onComplete={() => {
              setShowAISetup(false)
              onComplete?.()
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}