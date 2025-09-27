import { useRef, useEffect } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/contexts/ChatContext"

interface ChatAreaProps {
  className?: string
}

export function ChatArea({ className }: ChatAreaProps) {
  const { state, currentSession, createNewSession, sendMessage } = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages, state.isTyping])

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    let sessionToUse = currentSession
    
    if (!sessionToUse) {
      sessionToUse = createNewSession()
    }
    
    // Ensure we have a session before sending the message
    if (sessionToUse) {
      await sendMessage(content, attachments)
    }
  }

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Chat Messages - Scrollable area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 scroll-smooth">
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-full">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-background border shadow-lg overflow-hidden">
                <img 
                  src="/sybeezlogo.png" 
                  alt="Sybeez Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl lg:text-3xl font-semibold mb-3 text-foreground">
                How can I help you today?
              </h1>
              <p className="text-muted-foreground mb-6 text-sm lg:text-base">
                I'm Sybeez, your AI assistant. I can help with coding, writing, analysis, creative tasks, and much more!
              </p>
              
              {/* Quick start suggestions */}
              <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
                {[
                  "Explain quantum computing",
                  "Help me write a Python script", 
                  "Create a meal plan for this week",
                  "Debug my JavaScript code"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => handleSendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full space-y-0">
            {currentSession.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isUser={message.isUser}
                className="border-b border-border/5 last:border-0"
              />
            ))}
            {state.isTyping && (
              <ChatMessage
                message={{
                  id: 'typing',
                  content: '',
                  isUser: false,
                  timestamp: new Date()
                }}
                isUser={false}
                isTyping={true}
                showActions={false}
              />
            )}
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-border">
        <ChatInput onSendMessage={handleSendMessage} disabled={state.isTyping} />
      </div>
    </div>
  )
}