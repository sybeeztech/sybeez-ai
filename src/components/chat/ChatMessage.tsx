import { useState } from "react"
import { Bot, User, Copy, Edit2, RotateCcw, Check, X, Volume2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useChatContext, type Message } from "@/contexts/ChatContext"
import { toast } from "sonner"

interface ChatMessageProps {
  message: Message
  isUser?: boolean
  isTyping?: boolean
  className?: string
  showActions?: boolean
}

export function ChatMessage({ 
  message, 
  isUser = false, 
  isTyping = false, 
  className,
  showActions = true
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const { editMessage, regenerateResponse, sendMessage } = useChatContext()

  const handleSaveEdit = async () => {
    if (editContent.trim() !== message.content) {
      editMessage(message.id, editContent.trim())
      // If it's a user message, regenerate the AI response
      if (isUser) {
        await sendMessage(editContent.trim())
      }
      toast.success("Message updated")
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      toast.success("Copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy message")
    }
  }

  const handleRegenerateResponse = () => {
    regenerateResponse(message.id)
    toast.success("Regenerating response...")
  }

  const handleSpeakMessage = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.content)
      utterance.rate = 0.8
      utterance.pitch = isUser ? 1.1 : 0.9
      speechSynthesis.speak(utterance)
      toast.success("Reading message aloud")
    } else {
      toast.error("Speech synthesis not supported")
    }
  }

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded mt-2 mb-2 overflow-x-auto"><code>$1</code></pre>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className={cn(
      "group message-slide-in transition-colors",
      isUser ? "flex flex-row-reverse gap-3 lg:gap-4 p-4 lg:p-6 bg-transparent" : "flex gap-3 lg:gap-4 p-4 lg:p-6 bg-transparent",
      className
    )}>
      <div className={cn(
        "flex-shrink-0 w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-transparent" 
          : "bg-transparent"
      )}>
        {/* No icons for both user and bot messages */}
      </div>
      
      <div className={cn(
        "flex-1 min-w-0",
        isUser ? "text-right" : "text-left"
      )}>
        <div className={cn(
          "mb-1 flex items-center gap-2",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <div className={cn(
            "flex items-center gap-2",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="text-sm font-medium text-foreground">
              {isUser ? "" : "Sybeez"}
            </span>
            {message.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className={cn(
          "prose prose-neutral dark:prose-invert max-w-none prose-sm lg:prose-base",
          isUser ? "ml-auto max-w-3xl" : "max-w-none"
        )}>
          {isTyping ? (
            <div className="flex items-center gap-1 typing-indicator">
              <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          ) : isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] resize-none text-sm lg:text-base"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className={cn(
                "text-foreground text-sm lg:text-base leading-relaxed",
                isUser ? "bg-gray-100 dark:bg-gray-800 rounded-lg p-3 inline-block" : ""
              )}
              dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
            />
          )}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 bg-muted rounded border text-sm"
              >
                <span className="flex-1 truncate">{attachment.name}</span>
                <span className="text-muted-foreground text-xs">
                  {(attachment.size / 1024).toFixed(1)} KB
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}