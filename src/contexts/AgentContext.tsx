import React, { createContext, useContext, useState, useCallback } from 'react'

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition?: any
    webkitSpeechRecognition?: any
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: any) => void
  onend: () => void
}

interface AgentAction {
  id: string
  type: 'schedule' | 'reminder' | 'email' | 'call' | 'file' | 'search' | 'calculate' | 'custom'
  description: string
  parameters: Record<string, any>
  status: 'pending' | 'executing' | 'completed' | 'failed'
  result?: any
  timestamp: Date
}

interface VoiceCommand {
  command: string
  action: Omit<AgentAction, 'id' | 'timestamp' | 'status'>
  pattern: RegExp
}

interface AgentContextType {
  // Voice Control
  isListening: boolean
  startListening: () => Promise<void>
  stopListening: () => void
  
  // Actions
  actions: AgentAction[]
  executeAction: (action: Omit<AgentAction, 'id' | 'timestamp' | 'status'>) => Promise<void>
  
  // Voice Commands
  voiceCommands: VoiceCommand[]
  addVoiceCommand: (command: VoiceCommand) => void
  processVoiceCommand: (transcript: string) => Promise<void>
  
  // Integrations
  connectedApps: string[]
  connectApp: (appName: string, config: any) => Promise<void>
  
  // Settings
  voiceEnabled: boolean
  setVoiceEnabled: (enabled: boolean) => void
  autoExecute: boolean
  setAutoExecute: (enabled: boolean) => void
}

const AgentContext = createContext<AgentContextType | null>(null)

export function useAgent() {
  const context = useContext(AgentContext)
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false)
  const [actions, setActions] = useState<AgentAction[]>([])
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([])
  const [connectedApps, setConnectedApps] = useState<string[]>([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [autoExecute, setAutoExecute] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null)

  // Initialize voice commands
  React.useEffect(() => {
    const defaultCommands: VoiceCommand[] = [
      {
        command: "Schedule meeting with {person} at {time}",
        pattern: /schedule\s+(?:a\s+)?meeting\s+with\s+(.+?)\s+(?:at|for)\s+(.+)/i,
        action: {
          type: 'schedule',
          description: 'Schedule a meeting',
          parameters: { type: 'meeting' }
        }
      },
      {
        command: "Remind me to {task} at {time}",
        pattern: /remind\s+me\s+to\s+(.+?)\s+(?:at|in)\s+(.+)/i,
        action: {
          type: 'reminder',
          description: 'Set a reminder',
          parameters: { type: 'reminder' }
        }
      },
      {
        command: "Send email to {person} about {subject}",
        pattern: /send\s+(?:an\s+)?email\s+to\s+(.+?)\s+about\s+(.+)/i,
        action: {
          type: 'email',
          description: 'Send an email',
          parameters: { type: 'email' }
        }
      },
      {
        command: "Call {person}",
        pattern: /call\s+(.+)/i,
        action: {
          type: 'call',
          description: 'Make a phone call',
          parameters: { type: 'call' }
        }
      },
      {
        command: "Search for {query}",
        pattern: /search\s+(?:for\s+)?(.+)/i,
        action: {
          type: 'search',
          description: 'Perform a search',
          parameters: { type: 'search' }
        }
      }
    ]
    
    setVoiceCommands(defaultCommands)
  }, [])

  const startListening = useCallback(async () => {
    if (!voiceEnabled) return

    try {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
          
          if (event.results[event.results.length - 1].isFinal) {
            processVoiceCommand(transcript)
          }
        }
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        recognition.start()
        setRecognition(recognition)
        setIsListening(true)
      } else {
        throw new Error('Speech recognition not supported')
      }
    } catch (error) {
      console.error('Failed to start listening:', error)
    }
  }, [voiceEnabled])

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
      setRecognition(null)
    }
    setIsListening(false)
  }, [recognition])

  const executeAction = useCallback(async (actionData: Omit<AgentAction, 'id' | 'timestamp' | 'status'>) => {
    const action: AgentAction = {
      ...actionData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      status: 'pending'
    }
    
    setActions(prev => [...prev, action])
    
    try {
      // Update status to executing
      setActions(prev => prev.map(a => 
        a.id === action.id ? { ...a, status: 'executing' } : a
      ))
      
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let result = null
      
      switch (action.type) {
        case 'schedule':
          result = await scheduleEvent(action.parameters)
          break
        case 'reminder':
          result = await setReminder(action.parameters)
          break
        case 'email':
          result = await sendEmail(action.parameters)
          break
        case 'call':
          result = await makeCall(action.parameters)
          break
        case 'search':
          result = await performSearch(action.parameters)
          break
        case 'file':
          result = await handleFile(action.parameters)
          break
        case 'calculate':
          result = await calculate(action.parameters)
          break
        default:
          result = `Executed ${action.type} action`
      }
      
      // Update status to completed
      setActions(prev => prev.map(a => 
        a.id === action.id ? { ...a, status: 'completed', result } : a
      ))
      
    } catch (error) {
      // Update status to failed
      setActions(prev => prev.map(a => 
        a.id === action.id ? { ...a, status: 'failed', result: error } : a
      ))
    }
  }, [])

  const processVoiceCommand = useCallback(async (transcript: string) => {
    for (const voiceCommand of voiceCommands) {
      const match = transcript.match(voiceCommand.pattern)
      if (match) {
        const parameters = { ...voiceCommand.action.parameters, matches: match }
        const action = { ...voiceCommand.action, parameters }
        
        if (autoExecute) {
          await executeAction(action)
        } else {
          // Add to pending actions for user confirmation
          await executeAction({ ...action, description: `${action.description} (Voice: "${transcript}")` })
        }
        break
      }
    }
  }, [voiceCommands, autoExecute, executeAction])

  const addVoiceCommand = useCallback((command: VoiceCommand) => {
    setVoiceCommands(prev => [...prev, command])
  }, [])

  const connectApp = useCallback(async (appName: string, config: any) => {
    // Simulate app connection
    await new Promise(resolve => setTimeout(resolve, 1000))
    setConnectedApps(prev => [...prev, appName])
  }, [])

  // Action implementations
  const scheduleEvent = async (params: any) => {
    // Integration with calendar APIs (Google Calendar, Outlook, etc.)
    return `Scheduled event: ${JSON.stringify(params)}`
  }

  const setReminder = async (params: any) => {
    // Integration with notification system
    return `Reminder set: ${JSON.stringify(params)}`
  }

  const sendEmail = async (params: any) => {
    // Integration with email APIs (Gmail, Outlook, etc.)
    return `Email sent: ${JSON.stringify(params)}`
  }

  const makeCall = async (params: any) => {
    // Integration with VoIP services (Twilio, etc.)
    return `Call initiated: ${JSON.stringify(params)}`
  }

  const performSearch = async (params: any) => {
    // Integration with search APIs
    return `Search results: ${JSON.stringify(params)}`
  }

  const handleFile = async (params: any) => {
    // File system operations
    return `File operation completed: ${JSON.stringify(params)}`
  }

  const calculate = async (params: any) => {
    // Mathematical calculations
    return `Calculation result: ${JSON.stringify(params)}`
  }

  const value: AgentContextType = {
    isListening,
    startListening,
    stopListening,
    actions,
    executeAction,
    voiceCommands,
    addVoiceCommand,
    processVoiceCommand,
    connectedApps,
    connectApp,
    voiceEnabled,
    setVoiceEnabled,
    autoExecute,
    setAutoExecute
  }

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  )
}