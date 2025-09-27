import { useState, useRef } from "react"
import { Send, Mic, MicOff, Paperclip, X, Image, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { type Attachment } from "@/contexts/ChatContext"

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Attachment[]) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined)
      setMessage("")
      setAttachments([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        toast.error(`File ${file.name} is too large. Maximum size is 25MB.`)
        return
      }

      const attachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }

      // Read file content for text files
      if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          attachment.content = e.target?.result as string
          setAttachments(prev => [...prev, attachment])
          toast.success(`Added ${file.name}`)
        }
        reader.readAsText(file)
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          attachment.url = e.target?.result as string
          setAttachments(prev => [...prev, attachment])
          toast.success(`Added ${file.name}`)
        }
        reader.readAsDataURL(file)
      } else {
        setAttachments(prev => [...prev, attachment])
        toast.success(`Added ${file.name}`)
      }
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const attachment: Attachment = {
          id: crypto.randomUUID(),
          name: `Voice message ${new Date().toLocaleTimeString()}.webm`,
          size: blob.size,
          type: 'audio/webm',
          url: URL.createObjectURL(blob)
        }
        setAttachments(prev => [...prev, attachment])
        
        // Stop all tracks
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
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setIsRecording(false)
      toast.success("Recording saved")
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type.startsWith('audio/')) return <Mic className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="p-3 lg:p-4 bg-background border-t border-border">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg border"
              >
                {getFileIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 lg:gap-3 p-2 lg:p-3 bg-muted rounded-xl border border-border focus-within:border-primary/50 focus-within:shadow-sm transition-all duration-200">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,text/*,.md,.txt,.pdf,.doc,.docx"
            className="hidden"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={disabled}
            className="flex-1 min-h-0 max-h-32 resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0"
            rows={1}
          />
          
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`text-muted-foreground hover:text-foreground ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button
              type="submit"
              variant="sybeez"
              size="icon"
              disabled={(!message.trim() && attachments.length === 0) || disabled}
              className="shadow-glow"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Sybeez can make mistakes. Consider checking important information.
          </p>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {message.length > 0 && `${message.length} characters`}
          </p>
        </div>
      </form>
    </div>
  )
}