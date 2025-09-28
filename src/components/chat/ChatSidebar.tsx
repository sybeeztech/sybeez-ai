import { useState } from "react"
import { 
  MessageSquare, 
  BookOpen, 
  Sparkles, 
  Bot, 
  Presentation, 
  Plus,
  Settings,
  User,
  Crown,
  Search,
  Trash2,
  Pin,
  PinOff,
  MoreHorizontal,
  Download,
  Upload,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/contexts/ChatContext"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SettingsModal } from "./SettingsModal"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface ChatSidebarProps {
  className?: string
}

const sidebarItems = [
  { icon: BookOpen, label: "Library", type: "link", path: "/library" },
  { icon: Sparkles, label: "Sybeez AI", type: "link", path: "/" },
  { icon: Presentation, label: "Smart Slides", type: "link", path: "/slides" },
]

export function ChatSidebar({ className }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const { state, dispatch, currentSession, createNewSession, deleteSession, exportChat, importChats } = useChatContext()
  const navigate = useNavigate()

  const filteredSessions = state.sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const pinnedSessions = filteredSessions.filter(s => s.isPinned)
  const unpinnedSessions = filteredSessions.filter(s => !s.isPinned)

  const handleNewChat = () => {
    createNewSession()
    toast.success("New chat created")
  }

  const handleSelectSession = (sessionId: string) => {
    dispatch({ type: 'SET_CURRENT_SESSION', sessionId })
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this chat?")) {
      deleteSession(sessionId)
      toast.success("Chat deleted")
    }
  }

  const handleTogglePin = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({ type: 'TOGGLE_PIN_SESSION', sessionId })
    const session = state.sessions.find(s => s.id === sessionId)
    toast.success(session?.isPinned ? "Chat unpinned" : "Chat pinned")
  }

  const handleExportChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    exportChat(sessionId)
    toast.success("Chat exported")
  }

  const handleImportChats = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await importChats(file)
      toast.success("Chats imported successfully")
    } catch (error) {
      toast.error("Failed to import chats")
    }

    // Reset input
    e.target.value = ''
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  const SessionItem = ({ session }: { session: any }) => (
    <div
      className={cn(
        "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/80",
        currentSession?.id === session.id ? "bg-muted" : ""
      )}
      onClick={() => handleSelectSession(session.id)}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{session.title}</p>
        <p className="text-xs text-muted-foreground">{formatDate(session.updatedAt)}</p>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => handleTogglePin(session.id, e)}
          title={session.isPinned ? "Unpin chat" : "Pin chat"}
        >
          {session.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleExportChat(session.id, e)}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleDeleteSession(session.id, e)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      <aside className={cn(
        "flex flex-col h-screen bg-gradient-sidebar border-r border-border overflow-hidden",
        className
      )}>
        {/* Header - Always visible at top */}
        <div className="p-3 lg:p-4 border-b border-border space-y-3 bg-sidebar-bg flex-shrink-0">
          <Button variant="sybeez" size="chat" className="w-full text-sm" onClick={handleNewChat}>
            <Plus className="w-4 h-4" />
            New chat
          </Button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-border focus:border-primary/50 text-sm"
            />
          </div>
        </div>

        {/* Navigation Items - Fixed */}
        <div className="px-2 py-2 lg:py-3 border-b border-border flex-shrink-0 bg-sidebar-bg">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.label}
                variant="sidebar"
                className="w-full sidebar-item text-sm h-9"
                onClick={item.path ? () => navigate(item.path) : undefined}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>
          
          {/* AI Assistants Section */}
          <div className="mt-3 lg:mt-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">AI Assistants</h3>
            <div className="space-y-1">
              <Button variant="sidebar" className="w-full sidebar-item text-sm h-9" onClick={() => navigate('/agent')}>
                <Bot className="w-4 h-4" />
                AI Agent
              </Button>
            </div>
          </div>
        </div>

        {/* Chat History - Scrollable with enhanced mobile support */}
        <div 
          className="flex-1 overflow-y-auto p-2 min-h-0 sidebar-scroll" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {pinnedSessions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">Pinned</h3>
              <div className="space-y-1">
                {pinnedSessions.map((session) => (
                  <SessionItem key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}
          
          {unpinnedSessions.length > 0 && (
            <div>
              {pinnedSessions.length > 0 && (
                <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">Recent</h3>
              )}
              <div className="space-y-1">
                {unpinnedSessions.map((session) => (
                  <SessionItem key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}
          
          {filteredSessions.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No chats found</p>
            </div>
          )}
        </div>

        {/* Bottom Section - Always visible at bottom */}
        <div className="p-3 lg:p-4 border-t border-border space-y-2 bg-sidebar-bg flex-shrink-0">
          <input
            type="file"
            accept=".json"
            onChange={handleImportChats}
            className="hidden"
            id="import-chats"
          />
          
          <Button variant="sidebar" className="w-full text-sm h-9" asChild>
            <label htmlFor="import-chats" className="cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Chats
            </label>
          </Button>
          
          <Button variant="sidebar" className="w-full text-sm h-9">
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Button>
          <Button variant="sidebar" className="w-full text-sm h-9">
            <User className="w-4 h-4" />
            Silver Stalan
          </Button>
          <Button variant="sidebar" className="w-full text-sm h-9" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </aside>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  )
}