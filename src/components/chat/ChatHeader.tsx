import { Button } from "@/components/ui/button"
import { Crown, Menu, Maximize2 } from "lucide-react"
import { useAI } from "@/contexts/AIContext"

interface ChatHeaderProps {
  onToggleSidebar?: () => void
}

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  const { isConfigured } = useAI()

  const handleSidebarToggle = () => {
    console.log('Sidebar toggle clicked!', onToggleSidebar)
    if (onToggleSidebar) {
      onToggleSidebar()
    }
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Left Section - Logo and Menu */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSidebarToggle} 
          className="h-9 w-9 sm:h-9 sm:w-9 flex-shrink-0 touch-manipulation"
          aria-label="Toggle sidebar"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Menu className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            <img 
              src="/sybeezlogo.png" 
              alt="Sybeez Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-sm sm:text-lg font-semibold truncate">Sybeez</span>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
          onClick={() => window.open("https://sybeez.com/pro", "_blank")}
        >
          <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline xs:ml-1">Pro</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
          <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </header>
  )
}