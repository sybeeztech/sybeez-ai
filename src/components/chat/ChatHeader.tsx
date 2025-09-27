import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Menu, Maximize2, Bot, AlertTriangle } from "lucide-react"
import { useAI } from "@/contexts/AIContext"

interface ChatHeaderProps {
  onToggleSidebar?: () => void
}

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  const { isConfigured, config } = useAI()

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="w-4 h-4" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="/sybeezlogo.png" 
              alt="Sybeez Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-semibold">Sybeez</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => window.open('https://sybeez.com/pro', '_blank')}
        >
          <Crown className="w-3 h-3" />
          Get Pro
        </Button>
        <Button variant="ghost" size="icon">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}