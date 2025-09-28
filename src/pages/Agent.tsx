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
          <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src="/sybeezlogo.png" 
                      alt="Sybeez Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h1 className="text-base sm:text-lg font-semibold">Sybeez AI Agent</h1>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-xs px-2 sm:px-3"
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Home</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDashboard(false)}
                  className="flex items-center gap-2 text-xs px-2 sm:px-3"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Chat Mode</span>
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