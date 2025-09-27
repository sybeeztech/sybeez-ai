import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatSidebar } from "./ChatSidebar"
import { ChatHeader } from "./ChatHeader"
import { ChatArea } from "./ChatArea"
import { cn } from "@/lib/utils"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0 lg:w-64" : "-translate-x-full lg:w-0"
      )}>
        <ChatSidebar className={cn(
          "h-full w-full transition-opacity duration-300 lg:w-64",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none lg:opacity-0"
        )} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-background sticky top-0 z-30 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src="/sybeezlogo.png" alt="Sybeez" className="w-6 h-6" />
            <span className="font-semibold text-lg">Sybeez</span>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block flex-shrink-0">
          <ChatHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        {/* Chat Area - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatArea className="h-full" />
        </div>
      </div>

      {/* Mobile Sidebar Close Button */}
      {sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}