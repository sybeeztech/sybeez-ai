import { useState, useEffect } from "react"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { WelcomeScreen } from "@/components/chat/WelcomeScreen"
import { useAI } from "@/contexts/AIContext"

const Index = () => {
  const { isConfigured } = useAI()
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false)

  useEffect(() => {
    const visited = localStorage.getItem('sybeez-visited')
    const hasVisited = !!visited
    setHasVisitedBefore(hasVisited)
    
    if (!hasVisited && !isConfigured) {
      setShowWelcome(true)
    }
    
    if (!hasVisited) {
      localStorage.setItem('sybeez-visited', 'true')
    }
  }, [isConfigured])

  const handleWelcomeComplete = () => {
    setShowWelcome(false)
  }

  if (showWelcome && !hasVisitedBefore) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />
  }

  return <ChatLayout />
};

export default Index;
