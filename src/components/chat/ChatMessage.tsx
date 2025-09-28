import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { 
  Copy, Edit2, RotateCcw, Check, X, Volume2, VolumeX, 
  Download, Share, ThumbsUp, ThumbsDown, MoreHorizontal, Image,
  FileText, Code, Play, Pause
} from "lucide-react"
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showFullActions, setShowFullActions] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const { editMessage, regenerateResponse, sendMessage } = useChatContext()
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (editContent.trim() !== message.content && editContent.trim()) {
      try {
        await editMessage(message.id, editContent.trim())
        
        // If it's a user message, regenerate the AI response
        if (isUser) {
          await sendMessage(editContent.trim())
        }
        toast.success("Message updated successfully")
      } catch (error) {
        toast.error("Failed to update message")
        console.error('Edit error:', error)
      }
    }
    setIsEditing(false)
  }, [editContent, message.content, message.id, editMessage, isUser, sendMessage])

  const handleCancelEdit = useCallback(() => {
    setEditContent(message.content)
    setIsEditing(false)
  }, [message.content])

  const handleCopyMessage = useCallback(async () => {
    try {
      // Strip HTML tags for clipboard
      const plainText = message.content.replace(/<[^>]*>/g, '')
      await navigator.clipboard.writeText(plainText)
      toast.success("Copied to clipboard")
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = message.content.replace(/<[^>]*>/g, '')
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success("Copied to clipboard")
    }
  }, [message.content])

  const handleRegenerateResponse = useCallback(() => {
    if (!isUser) {
      regenerateResponse(message.id)
      toast.success("Regenerating response...")
    }
  }, [regenerateResponse, message.id, isUser])

  const handleSpeakMessage = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      toast.error("Speech synthesis not supported")
      return
    }

    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    // Strip HTML for speech
    const textToSpeak = message.content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    
    utterance.rate = 0.9
    utterance.pitch = isUser ? 1.1 : 0.9
    utterance.volume = 0.8
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsSpeaking(false)
      toast.error("Speech synthesis failed")
    }

    speechRef.current = utterance
    speechSynthesis.speak(utterance)
    toast.success("Reading message aloud")
  }, [message.content, isSpeaking, isUser])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'Sybeez Chat Message',
      text: message.content.replace(/<[^>]*>/g, ''),
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          handleCopyMessage() // Fallback to copy
        }
      }
    } else {
      handleCopyMessage() // Fallback to copy
    }
  }, [message.content, handleCopyMessage])

  // Enhanced markdown formatting with better regex patterns
  const formatMessageContent = useMemo(() => {
    return (content: string) => {
      if (!content) return ''
      
      return content
        // Code blocks (must come before inline code)
        .replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
          const language = lang || 'text'
          return `<div class="code-block-container my-3">
            <div class="code-header bg-muted/50 px-3 py-1 rounded-t-lg border text-xs text-muted-foreground flex items-center justify-between">
              <span>${language}</span>
              <button class="copy-code-btn hover:text-foreground transition-colors" data-code="${encodeURIComponent(code.trim())}">
                Copy
              </button>
            </div>
            <pre class="bg-muted p-3 rounded-b-lg overflow-x-auto border border-t-0"><code class="language-${language}">${code.trim()}</code></pre>
          </div>`
        })
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="bg-muted/70 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
        // Bold text
        .replace(/\*\*((?:(?!\*\*).)+)\*\*/g, '<strong class="font-semibold">$1</strong>')
        // Italic text
        .replace(/\*((?:(?!\*).)+)\*/g, '<em class="italic">$1</em>')
        // Links (basic support)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Lists (basic support)
        .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
    }
  }, [])

  // Handle code copy buttons
  const handleCodeCopy = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('copy-code-btn')) {
      const code = decodeURIComponent(target.getAttribute('data-code') || '')
      navigator.clipboard.writeText(code).then(() => {
        toast.success("Code copied to clipboard")
        target.textContent = 'Copied!'
        setTimeout(() => {
          target.textContent = 'Copy'
        }, 2000)
      })
    }
  }, [])

  const getAttachmentIcon = useCallback((type: string, name: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (name.includes('code') || name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.py')) {
      return <Code className="w-4 h-4" />
    }
    return <FileText className="w-4 h-4" />
  }, [])

  const messageActions = useMemo(() => [
    {
      icon: Copy,
      label: 'Copy',
      onClick: handleCopyMessage,
      show: true
    },
    {
      icon: isSpeaking ? VolumeX : Volume2,
      label: isSpeaking ? 'Stop reading' : 'Read aloud',
      onClick: handleSpeakMessage,
      show: true
    },
    {
      icon: Edit2,
      label: 'Edit',
      onClick: () => setIsEditing(true),
      show: isUser && showActions
    },
    {
      icon: RotateCcw,
      label: 'Regenerate',
      onClick: handleRegenerateResponse,
      show: !isUser && showActions
    },
    {
      icon: Share,
      label: 'Share',
      onClick: handleShare,
      show: true
    }
  ].filter(action => action.show), [
    handleCopyMessage,
    handleSpeakMessage,
    handleRegenerateResponse,
    handleShare,
    isUser,
    showActions,
    isSpeaking
  ])

  return (
    <div 
      className={cn(
        "group message-container transition-all duration-200 hover:bg-muted/20 relative",
        "border-b border-border/5 last:border-0",
        className
      )}
      data-message-id={message.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "flex gap-3 lg:gap-4 p-3 lg:p-4 relative",
        isUser ? "justify-end" : "flex-row"
      )}>
        
        {/* No avatar for any messages */}
        
        {/* Message Content */}
        <div className={cn(
          "flex-1 min-w-0 space-y-1",
          isUser ? "text-right" : "text-left"
        )}>
          
          {/* Header - Only show edit status if message is edited */}
          {message.isEdited && (
            <div className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground",
              isUser ? "flex-row-reverse" : "flex-row"
            )}>
              <span className="text-xs text-muted-foreground">(edited)</span>
            </div>
          )}
          
          {/* Message Body */}
          <div className={cn(
            "prose prose-neutral dark:prose-invert max-w-none prose-sm lg:prose-base",
            "prose-pre:my-0 prose-code:text-sm",
            isUser && "ml-auto max-w-3xl"
          )}>
            {isTyping ? (
              <div className="flex items-center gap-1 py-2">
                <div className="typing-indicator flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-sm text-muted-foreground ml-2">Sybeez thinking...</span>
              </div>
            ) : isEditing ? (
              <div className="space-y-3 mt-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none text-sm lg:text-base"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      handleSaveEdit()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      handleCancelEdit()
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || editContent.trim() === message.content}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save (Ctrl+Enter)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel (Esc)
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className={cn(
                  "text-foreground text-sm lg:text-base leading-relaxed",
                  isUser ? "bg-primary/10 rounded-lg p-3 inline-block max-w-fit ml-auto" : ""
                )}
                data-message-content
                onClick={handleCodeCopy}
                dangerouslySetInnerHTML={{ 
                  __html: formatMessageContent(message.content) 
                }}
              />
            )}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors group"
                >
                  <div className="text-muted-foreground">
                    {getAttachmentIcon(attachment.type, attachment.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = attachment.url || ''
                      link.download = attachment.name
                      link.click()
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && !isEditing && !isTyping && (
          <div className={cn(
            "absolute top-2 transition-all duration-200",
            isUser ? "left-2" : "right-2",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg border p-1 shadow-sm">
              {messageActions.slice(0, 3).map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={action.onClick}
                  title={action.label}
                >
                  <action.icon className="w-3 h-3" />
                </Button>
              ))}
              
              {messageActions.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowFullActions(!showFullActions)}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            {/* Extended actions menu */}
            {showFullActions && messageActions.length > 3 && (
              <div className="absolute top-full mt-1 right-0 bg-background border rounded-lg shadow-lg p-1 z-10">
                {messageActions.slice(3).map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-8"
                    onClick={() => {
                      action.onClick()
                      setShowFullActions(false)
                    }}
                  >
                    <action.icon className="w-3 h-3" />
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}