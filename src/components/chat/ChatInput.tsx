import { useState, useRef, useCallback, useEffect } from "react"
import { Send, Mic, MicOff, Paperclip, X, Image, FileText, Video, Archive, Code, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { type Attachment } from "@/contexts/ChatContext"
import { generateUUID, cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Attachment[]) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSendMessage, disabled, placeholder = "Ask anything..." }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout>()

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const maxHeight = window.innerWidth < 768 ? 96 : 128 // 24 or 32 in pixels
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [])

  // Auto-resize when message changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [message, adjustTextareaHeight])

  // Focus textarea when not disabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      setRecordingTime(0)
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || attachments.length > 0) && !disabled && !isComposing) {
      onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined)
      setMessage("")
      setAttachments([])
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [message, attachments, disabled, isComposing, onSendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit(e as any)
    }
    // Handle Ctrl+/ for shortcuts help (could be implemented)
    else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      // Could show shortcuts modal
    }
  }, [handleSubmit, isComposing])

  const processFile = useCallback((file: File) => {
    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      toast.error(`File ${file.name} is too large. Maximum size is 25MB.`)
      return
    }

    // Check for duplicate files
    const isDuplicate = attachments.some(att => att.name === file.name && att.size === file.size)
    if (isDuplicate) {
      toast.error(`File ${file.name} is already attached.`)
      return
    }

    const attachment: Attachment = {
      id: generateUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }

    // Read file content based on type
    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        attachment.content = e.target?.result as string
        setAttachments(prev => [...prev, attachment])
        toast.success(`Added ${file.name}`)
      }
      reader.onerror = () => toast.error(`Failed to read ${file.name}`)
      reader.readAsText(file)
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        attachment.url = e.target?.result as string
        setAttachments(prev => [...prev, attachment])
        toast.success(`Added ${file.name}`)
      }
      reader.onerror = () => toast.error(`Failed to read ${file.name}`)
      reader.readAsDataURL(file)
    } else {
      setAttachments(prev => [...prev, attachment])
      toast.success(`Added ${file.name}`)
    }
  }, [attachments])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(processFile)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFile])

  // Enhanced drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragOver) setIsDragOver(true)
  }, [isDragOver])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach(processFile)
  }, [processFile])

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id)
      if (attachment?.url && attachment.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url)
      }
      return prev.filter(att => att.id !== id)
    })
    toast.success("Attachment removed")
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunks, { type: mimeType })
        const extension = mimeType.includes('webm') ? 'webm' : 'mp4'
        
        const attachment: Attachment = {
          id: generateUUID(),
          name: `Voice message ${new Date().toLocaleTimeString()}.${extension}`,
          size: blob.size,
          type: mimeType,
          url: URL.createObjectURL(blob)
        }
        setAttachments(prev => [...prev, attachment])
        toast.success(`Voice message saved (${formatTime(recordingTime)})`)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.onerror = (e) => {
        toast.error("Recording failed")
        console.error('Recording error:', e)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      toast.success("Recording started...")
    } catch (error) {
      toast.error("Could not access microphone")
      console.error('Error starting recording:', error)
    }
  }, [recordingTime])

  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setIsRecording(false)
    }
  }, [mediaRecorder])

  const getFileIcon = useCallback((type: string, name: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.startsWith('audio/')) return <Mic className="w-4 h-4" />
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />
    if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return <Archive className="w-4 h-4" />
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.py') || name.endsWith('.html') || name.endsWith('.css')) return <Code className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }, [])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const canSubmit = (message.trim() || attachments.length > 0) && !disabled && !isComposing

  return (
    <div 
      className={cn(
        "p-2 lg:p-4 bg-background border-t border-border transition-all duration-200",
        isDragOver && "bg-primary/5 border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Plus className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium text-primary">Drop files here to attach</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
        {/* Attachments - Enhanced mobile optimized */}
        {attachments.length > 0 && (
          <div className="mb-2 lg:mb-3 space-y-1.5 lg:space-y-2 max-h-32 overflow-y-auto">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-muted rounded-lg border group hover:bg-muted/80 transition-colors"
              >
                <div className="text-muted-foreground">
                  {getFileIcon(attachment.type, attachment.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                </div>
                {attachment.type.startsWith('audio/') && (
                  <audio 
                    controls 
                    className="h-8 max-w-32 lg:max-w-48" 
                    preload="metadata"
                    src={attachment.url}
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 lg:h-7 lg:w-7 text-muted-foreground hover:text-destructive p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <div className="flex items-end gap-1.5 lg:gap-3 p-2 lg:p-3 bg-muted rounded-xl border border-border focus-within:border-primary/50 focus-within:shadow-sm transition-all duration-200">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,text/*,.md,.txt,.pdf,.doc,.docx,.js,.ts,.py,.html,.css,.json,.xml,.zip,.rar"
            className="hidden"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 lg:h-8 lg:w-8 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="Attach file"
          >
            <Paperclip className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={disabled ? "Sybeez is thinking..." : placeholder}
            disabled={disabled}
            className="flex-1 min-h-[1.75rem] lg:min-h-[2rem] max-h-24 lg:max-h-32 resize-none border-0 bg-transparent p-1 lg:p-0 text-sm lg:text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 leading-relaxed"
            rows={1}
          />
          
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            {/* Recording Button with Timer */}
            <div className="flex items-center gap-1">
              {isRecording && (
                <span className="text-xs text-destructive font-mono hidden sm:inline">
                  {formatTime(recordingTime)}
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 lg:h-8 lg:w-8 p-0 text-muted-foreground hover:text-foreground transition-colors",
                  isRecording && "bg-destructive/20 text-destructive hover:text-destructive animate-pulse"
                )}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                title={isRecording ? `Stop recording (${formatTime(recordingTime)})` : "Start voice recording"}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <Mic className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
              </Button>
            </div>
            
            <Button
              type="submit"
              variant="default"
              size="sm"
              className={cn(
                "h-7 w-7 lg:h-8 lg:w-8 p-0 transition-all duration-200",
                canSubmit && "shadow-glow bg-primary hover:bg-primary/90"
              )}
              disabled={!canSubmit}
              title="Send message (Enter)"
            >
              <Send className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </Button>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="flex items-center justify-between mt-1.5 lg:mt-2">
          <p className="text-xs text-muted-foreground">
            Sybeez can make mistakes. Consider checking important information.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isRecording && (
              <span className="sm:hidden text-destructive font-mono">
                {formatTime(recordingTime)}
              </span>
            )}
            {message.length > 0 && (
              <span className="hidden sm:block">
                {message.length} characters
              </span>
            )}
            {attachments.length > 0 && (
              <span className="hidden sm:block">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}