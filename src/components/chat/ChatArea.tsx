import { useRef, useEffect, useCallback } from "react"
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
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages, state.isTyping, scrollToBottom])

  // Enhanced message sending with better error handling
  const handleSendMessage = async (content: string, attachments?: any[]) => {
    let sessionToUse = currentSession
    
    if (!sessionToUse) {
      sessionToUse = createNewSession()
    }
    
    // Ensure we have a session before sending the message
    if (sessionToUse) {
      try {
        await sendMessage(content, attachments)
      } catch (error) {
        console.error('Failed to send message:', error)
        // You could add toast notification here
      }
    }
  }

  // Handle keyboard shortcuts for the chat area
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl/Cmd + K to focus on search (this would be handled by parent component)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      // Dispatch custom event that ChatHeader can listen to
      window.dispatchEvent(new CustomEvent('focusSearch'))
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className={cn("flex flex-col h-full max-h-full overflow-hidden", className)}>
      {/* Chat Messages - Scrollable area with search support */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 lg:px-6 lg:py-4 scroll-smooth overscroll-contain"
        style={{ scrollBehavior: 'smooth' }}
      >
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-full">
            <div className="text-center max-w-md px-3 lg:px-4 py-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 bg-background border shadow-lg overflow-hidden">
                <img 
                  src="/sybeezlogo.png" 
                  alt="Sybeez Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl lg:text-3xl font-semibold mb-2 lg:mb-3 text-foreground">
                How can I help you today?
              </h1>
              <p className="text-muted-foreground mb-4 lg:mb-6 text-sm lg:text-base leading-relaxed">
                I'm Sybeez, your AI assistant. I can help with coding, writing, analysis, creative tasks, and much more!
              </p>
              
              {/* Quick start suggestions - Enhanced mobile optimized */}
              <div className="grid grid-cols-1 gap-2 lg:gap-3 max-w-sm mx-auto">
                {[
                  { text: "Explain quantum computing", icon: "🔬" },
                  { text: "Help me write a Python script", icon: "🐍" }, 
                  { text: "Create a meal plan for this week", icon: "🍽️" },
                  { text: "Debug my JavaScript code", icon: "🐛" }
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="group flex items-center gap-2 text-left p-2.5 lg:p-3 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-200 text-xs lg:text-sm text-muted-foreground hover:text-foreground active:bg-muted/60 hover:shadow-sm"
                    onClick={() => handleSendMessage(suggestion.text)}
                  >
                    <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity">
                      {suggestion.icon}
                    </span>
                    <span className="flex-1">{suggestion.text}</span>
                  </button>
                ))}
              </div>
              
              {/* Search hint */}
              <div className="mt-6 lg:mt-8 text-xs text-muted-foreground/70">
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">Ctrl</kbd>
                {" + "}
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">K</kbd>
                {" to search"}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full space-y-0">
            {currentSession.messages.map((message, index) => (
              <div
                key={message.id}
                data-message-id={message.id}
                data-message-index={index}
                className="message-container transition-all duration-300"
              >
                <ChatMessage
                  message={message}
                  isUser={message.isUser}
                  className="border-b border-border/5 last:border-0 py-2 lg:py-3"
                />
              </div>
            ))}
            
            {/* Typing indicator with data attribute for search */}
            {state.isTyping && (
              <div
                data-message-id="typing"
                className="message-container"
              >
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
                  className="py-2 lg:py-3"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Scroll anchor - Enhanced */}
        <div ref={messagesEndRef} className="h-2 lg:h-4 flex-shrink-0" />
      </div>

      {/* Chat Input - Fixed at bottom with enhanced mobile optimizations */}
      <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={state.isTyping}
          placeholder={state.isTyping ? "Sybeez is typing..." : "Type your message..."}
        />
      </div>
    </div>
  )
}