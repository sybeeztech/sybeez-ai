import { useState, useCallback, useEffect, useRef } from "react"
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatSidebar } from "./ChatSidebar"
import { ChatHeader } from "./ChatHeader"
import { ChatArea } from "./ChatArea"
import { cn } from "@/lib/utils"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Initialize based on screen size and localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-open')
      if (saved !== null) return JSON.parse(saved)
      return window.innerWidth >= 1024 // lg breakpoint
    }
    return true
  })
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      // Auto-close sidebar on mobile when screen gets too small
      if (mobile && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen])

  // Save sidebar state to localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
    }
  }, [sidebarOpen, isMobile])

  // Handle keyboard shortcuts for sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
      // Escape to close sidebar on mobile
      else if (e.key === 'Escape' && isMobile && sidebarOpen) {
        e.preventDefault()
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, sidebarOpen])

  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setSidebarOpen(false)
      }
    }

    if (isMobile && sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, sidebarOpen])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  return (
    <div className="flex h-screen bg-background lg:overflow-hidden">
      {/* Mobile backdrop with better performance */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar with enhanced animations */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-out lg:relative lg:translate-x-0",
          // Mobile behavior
          isMobile ? [
            "w-80",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          ] : [
            // Desktop behavior
            sidebarOpen ? (isCollapsed ? "w-16" : "w-64") : "w-0",
            "translate-x-0"
          ]
        )}
      >
        <div
          ref={sidebarRef}
          className={cn(
            "h-full transition-all duration-300 bg-background border-r border-border",
            isMobile ? "w-full" : (sidebarOpen ? (isCollapsed ? "w-16" : "w-64") : "w-0"),
            !sidebarOpen && !isMobile && "opacity-0 pointer-events-none"
          )}
        >
          <ChatSidebar 
            className="h-full"
            isCollapsed={!isMobile && isCollapsed}
            onToggleCollapse={!isMobile ? toggleCollapse : undefined}
          />
        </div>
      </div>

      {/* Main Content with improved mobile layout */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 relative",
        isMobile ? "h-screen overflow-auto" : "h-full overflow-hidden"
      )}>
        
        {/* Mobile Header - Fixed positioning for better scrolling */}
        {isMobile && (
          <header className="flex items-center justify-between gap-3 p-3 border-b border-border bg-background/95 backdrop-blur-md flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2 hover:bg-muted/80 active:bg-muted"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src="/sybeezlogo.png" 
                    alt="Sybeez Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-semibold text-lg">Sybeez</span>
              </div>
            </div>
            
            {/* Mobile actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1"
                onClick={() => window.open("https://sybeez.com/pro", "_blank")}
              >
                Pro
              </Button>
            </div>
          </header>
        )}

        {/* Desktop Header - Enhanced */}
        {!isMobile && (
          <div className="flex-shrink-0 relative">
            <ChatHeader onToggleSidebar={toggleSidebar} />
            
            {/* Sidebar Toggle Button for Desktop */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity z-10",
                sidebarOpen && "hidden"
              )}
              onClick={toggleSidebar}
              title="Show sidebar (Ctrl+B)"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Chat Area - Mobile optimized */}
        <div className={cn(
          "flex-1 relative",
          isMobile ? "min-h-0" : "min-h-0 overflow-hidden"
        )}>
          <ChatArea className={isMobile ? "flex-1" : "h-full"} />
          
          {/* Resize handle for desktop */}
          {!isMobile && sidebarOpen && !isCollapsed && (
            <div className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors group">
              <div className="w-1 h-full group-hover:w-2 bg-transparent group-hover:bg-primary/10 transition-all" />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Mobile Close Button */}
      {isMobile && sidebarOpen && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed top-4 right-4 z-50 bg-background/90 backdrop-blur-md border shadow-lg hover:bg-background/95 transition-all duration-200"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </Button>
      )}

      {/* Keyboard shortcut indicator */}
      <div className="fixed bottom-4 right-4 z-20 opacity-0 pointer-events-none transition-opacity duration-200 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 border" id="shortcut-hint">
        <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">Ctrl</kbd>
        {" + "}
        <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">B</kbd>
        {" to toggle sidebar"}
      </div>
    </div>
  )
}