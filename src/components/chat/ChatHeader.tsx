import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"  
import { Input } from "@/components/ui/input"
import { Crown, Menu, Maximize2, Search, X, ChevronUp, ChevronDown } from "lucide-react"
import { useAI } from "@/contexts/AIContext"
import { useChatContext } from "@/contexts/ChatContext"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  onToggleSidebar?: () => void
}

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  const { isConfigured, config } = useAI()
  const { currentSession } = useChatContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<Array<{ messageId: string, messageIndex: number }>>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Force focus when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isSearchOpen])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!currentSession || !query.trim()) {
      setSearchResults([])
      setCurrentResultIndex(0)
      return
    }

    const results = currentSession.messages
      .map((message, index) => ({
        messageId: message.id,
        messageIndex: index
      }))
      .filter((_, index) => 
        currentSession.messages[index].content.toLowerCase().includes(query.toLowerCase())
      )

    setSearchResults(results)
    setCurrentResultIndex(0)

    if (results.length > 0) {
      scrollToMessage(results[0].messageId)
    }
  }

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Add highlight effect
      messageElement.classList.add('ring-2', 'ring-yellow-400', 'bg-yellow-50', 'dark:bg-yellow-900/20')
      setTimeout(() => {
        messageElement.classList.remove('ring-2', 'ring-yellow-400', 'bg-yellow-50', 'dark:bg-yellow-900/20')
      }, 2000)
    }
  }

  const navigateResults = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return

    let newIndex
    if (direction === 'next') {
      newIndex = currentResultIndex < searchResults.length - 1 ? currentResultIndex + 1 : 0
    } else {
      newIndex = currentResultIndex > 0 ? currentResultIndex - 1 : searchResults.length - 1
    }

    setCurrentResultIndex(newIndex)
    scrollToMessage(searchResults[newIndex].messageId)
    
    // Ensure search stays open when navigating
    if (!isSearchOpen) {
      setIsSearchOpen(true)
    }
  }

  const openSearch = () => {
    setIsSearchOpen(true)
  }

  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
    setCurrentResultIndex(0)
    
    // Remove any remaining highlights
    document.querySelectorAll('[data-message-id]').forEach(el => {
      el.classList.remove('ring-2', 'ring-yellow-400', 'bg-yellow-50', 'dark:bg-yellow-900/20')
    })
  }

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isSearchOpen) {
        e.preventDefault()
        openSearch()
      }
    }

    // Listen for custom focus search event from ChatArea
    const handleFocusSearch = () => {
      if (!isSearchOpen) {
        openSearch()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    window.addEventListener('focusSearch', handleFocusSearch)
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
      window.removeEventListener('focusSearch', handleFocusSearch)
    }
  }, [isSearchOpen])

  // Handle keyboard shortcuts within search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSearch()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        navigateResults('prev')
      } else {
        navigateResults('next')
      }
    }
  }

  return (
    <header className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Left Section - Logo and Menu */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {onToggleSidebar && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-8 w-8 sm:h-9 sm:w-9">
            <Menu className="w-4 h-4" />
          </Button>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="/sybeezlogo.png" 
              alt="Sybeez Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-base sm:text-lg font-semibold hidden xs:block">Sybeez</span>
        </div>
      </div>

      {/* Center Section - Search Bar (Expandable) */}
      <div className="flex-1 flex justify-center px-2 sm:px-4">
        <div className={cn(
          "flex items-center transition-all duration-300 ease-out",
          isSearchOpen 
            ? "w-full max-w-xs sm:max-w-lg" 
            : "w-auto"
        )}>
          {isSearchOpen ? (
            <div className="flex items-center gap-1 w-full bg-muted rounded-lg border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="w-4 h-4 text-muted-foreground ml-3 flex-shrink-0" />
              <Input
                ref={searchInputRef}
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm flex-1 min-w-0"
              />
              
              {/* Search Results Navigation */}
              {searchResults.length > 0 && (
                <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground border-l border-border flex-shrink-0">
                  <span className="font-mono whitespace-nowrap">
                    {currentResultIndex + 1}/{searchResults.length}
                  </span>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted-foreground/10"
                      onClick={() => navigateResults('prev')}
                      disabled={searchResults.length === 0}
                      title="Previous result (Shift+Enter)"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-muted-foreground/10"
                      onClick={() => navigateResults('next')}
                      disabled={searchResults.length === 0}
                      title="Next result (Enter)"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2 hover:bg-muted-foreground/10 flex-shrink-0"
                onClick={closeSearch}
                title="Close search (Esc)"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={openSearch}
              title="Search in conversation (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs px-2 sm:px-3"
          onClick={() => window.open("https://sybeez.com/pro", "_blank")}
        >
          <Crown className="w-3 h-3" />
          <span className="hidden xs:ml-1 xs:inline">Get Pro</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}