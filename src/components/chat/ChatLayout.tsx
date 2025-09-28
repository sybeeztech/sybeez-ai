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

  // Handle body scroll lock on mobile when sidebar is open
  useEffect(() => {
    if (isMobile) {
      if (sidebarOpen) {
        // Lock body scroll when sidebar is open on mobile
        document.body.style.overflow = 'hidden'
      } else {
        // Restore body scroll when sidebar is closed
        document.body.style.overflow = 'auto'
      }
    } else {
      // Always allow body scroll on desktop
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMobile, sidebarOpen])

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      console.log('Resize detected, mobile:', mobile, 'window width:', window.innerWidth)
      setIsMobile(mobile)
      
      // Only auto-close sidebar on mobile when transitioning from desktop to mobile
      // But allow manual control on mobile
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    console.log('toggleSidebar called, current state:', sidebarOpen, 'isMobile:', isMobile)
    setSidebarOpen(prev => !prev)
  }, [sidebarOpen, isMobile])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  return (
    <div className="flex h-screen bg-background lg:overflow-hidden">
      {/* Mobile backdrop with better performance - doesn't interfere with sidebar scrolling */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={closeSidebar}
          aria-label="Close sidebar"
          style={{ touchAction: 'none' }}
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
          style={isMobile ? { 
            touchAction: 'pan-y',
            overscrollBehavior: 'contain'
          } : {}}
        >
          <ChatSidebar 
            className="h-full"
          />
        </div>
      </div>

      {/* Main Content with improved mobile layout */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 relative",
        // Mobile: always use full height, scrolling happens inside chat area
        // Desktop: standard overflow handling
        isMobile ? "h-screen" : "h-full overflow-hidden"
      )}>
        
        {/* Unified Header for both Mobile and Desktop */}
        <div className="flex-shrink-0">
          <ChatHeader onToggleSidebar={toggleSidebar} />
        </div>

        {/* Chat Area - Mobile optimized */}
        <div className={cn(
          "flex-1 relative overflow-hidden",
          // Ensure proper height calculation
          "min-h-0"
        )}>
          <ChatArea className="h-full" />
          
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