import { useState } from "react"
import { Bot, MessageSquare, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AgentDashboard } from "@/components/agent/AgentDashboard"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { useNavigate } from "react-router-dom"

export function AgentPage() {
  const [showDashboard, setShowDashboard] = useState(true) // Start with dashboard by default
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {showDashboard ? (
        <div>
          {/* Header */}
          <div className="border-b border-border bg-background sticky top-0 z-50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/sybeezlogo.png" 
                  alt="Sybeez" 
                  className="w-8 h-8"
                />
                <h1 className="text-lg font-semibold">Sybeez AI Agent</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDashboard(false)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat Mode
                </Button>
              </div>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <AgentDashboard />
        </div>
      ) : (
        <div>
          {/* Chat Mode with Navigation */}
          <div className="relative">
            <ChatLayout />
            
            {/* Navigation buttons - Fixed positioned */}
            <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
              <Button
                onClick={() => navigate('/')}
                className="bg-white text-black hover:bg-gray-100 shadow-lg border"
                size="sm"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => setShowDashboard(true)}
                className="bg-black text-white hover:bg-gray-800 shadow-lg"
                size="sm"
              >
                <Bot className="w-4 h-4 mr-2" />
                Agent Control
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}