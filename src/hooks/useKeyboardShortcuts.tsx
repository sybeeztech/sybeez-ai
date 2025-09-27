import { useEffect } from 'react'
import { useChatContext } from '@/contexts/ChatContext'

export function useKeyboardShortcuts() {
  const { createNewSession, exportChat, currentSession, state } = useChatContext()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for modifier keys
      const isCmd = e.metaKey // Mac
      const isCtrl = e.ctrlKey // Windows/Linux
      const modifier = isCmd || isCtrl

      if (!modifier) return

      switch (e.key.toLowerCase()) {
        case 'n':
          // Ctrl/Cmd + N: New Chat
          e.preventDefault()
          createNewSession()
          break
        
        case 's':
          // Ctrl/Cmd + S: Export current chat
          if (currentSession) {
            e.preventDefault()
            exportChat(currentSession.id)
          }
          break
        
        case '/':
          // Ctrl/Cmd + /: Focus search
          e.preventDefault()
          const searchInput = document.querySelector('input[placeholder="Search chats..."]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
          break
        
        case 'k':
          // Ctrl/Cmd + K: Focus message input
          e.preventDefault()
          const messageInput = document.querySelector('textarea[placeholder="Ask anything..."]') as HTMLTextAreaElement
          if (messageInput) {
            messageInput.focus()
          }
          break

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          // Ctrl/Cmd + 1-9: Switch to chat by index
          e.preventDefault()
          const index = parseInt(e.key) - 1
          if (state.sessions[index]) {
            // This would need to be handled by the parent component
            // For now, we'll just prevent the default behavior
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [createNewSession, exportChat, currentSession, state.sessions])

  return null
}

// Keyboard shortcuts help component
export function KeyboardShortcuts() {
  const shortcuts = [
    { key: '⌘ + N', action: 'New Chat' },
    { key: '⌘ + S', action: 'Export Chat' },
    { key: '⌘ + /', action: 'Search Chats' },
    { key: '⌘ + K', action: 'Focus Input' },
    { key: '⌘ + 1-9', action: 'Switch Chat' },
    { key: 'Enter', action: 'Send Message' },
    { key: 'Shift + Enter', action: 'New Line' },
    { key: 'Esc', action: 'Cancel Edit' },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground mb-3">Keyboard Shortcuts</h3>
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{shortcut.action}</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
            {shortcut.key}
          </kbd>
        </div>
      ))}
    </div>
  )
}