import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AIService } from '../lib/ai-service'
import { useAI } from './AIContext'

export interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isTyping?: boolean
  attachments?: Attachment[]
  isEdited?: boolean
  originalContent?: string
}

export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  content?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isPinned?: boolean
}

interface ChatState {
  currentSessionId: string | null
  sessions: ChatSession[]
  isTyping: boolean
  settings: ChatSettings
}

interface ChatSettings {
  theme: 'dark' | 'light'
  fontSize: 'small' | 'medium' | 'large'
  sendOnEnter: boolean
  soundEnabled: boolean
  autoSaveChats: boolean
  streamingEnabled: boolean
}

type ChatAction =
  | { type: 'CREATE_SESSION'; session: ChatSession }
  | { type: 'SET_CURRENT_SESSION'; sessionId: string }
  | { type: 'ADD_MESSAGE'; sessionId: string; message: Message }
  | { type: 'UPDATE_MESSAGE'; sessionId: string; messageId: string; content: string }
  | { type: 'DELETE_MESSAGE'; sessionId: string; messageId: string }
  | { type: 'DELETE_SESSION'; sessionId: string }
  | { type: 'SET_TYPING'; isTyping: boolean }
  | { type: 'UPDATE_SESSION_TITLE'; sessionId: string; title: string }
  | { type: 'TOGGLE_PIN_SESSION'; sessionId: string }
  | { type: 'LOAD_SESSIONS'; sessions: ChatSession[] }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<ChatSettings> }
  | { type: 'CLEAR_ALL_SESSIONS' }

const initialSettings: ChatSettings = {
  theme: 'dark',
  fontSize: 'medium',
  sendOnEnter: true,
  soundEnabled: true,
  autoSaveChats: true,
  streamingEnabled: true
}

const initialState: ChatState = {
  currentSessionId: null,
  sessions: [],
  isTyping: false,
  settings: initialSettings
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'CREATE_SESSION':
      return {
        ...state,
        sessions: [action.session, ...state.sessions],
        currentSessionId: action.session.id
      }

    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSessionId: action.sessionId
      }

    case 'ADD_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.sessionId
            ? {
                ...session,
                messages: [...session.messages, action.message],
                updatedAt: new Date()
              }
            : session
        )
      }

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.sessionId
            ? {
                ...session,
                messages: session.messages.map(msg =>
                  msg.id === action.messageId
                    ? { 
                        ...msg, 
                        content: action.content,
                        isEdited: true,
                        originalContent: msg.originalContent || msg.content
                      }
                    : msg
                ),
                updatedAt: new Date()
              }
            : session
        )
      }

    case 'DELETE_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.sessionId
            ? {
                ...session,
                messages: session.messages.filter(msg => msg.id !== action.messageId),
                updatedAt: new Date()
              }
            : session
        )
      }

    case 'DELETE_SESSION':
      const remainingSessions = state.sessions.filter(s => s.id !== action.sessionId)
      return {
        ...state,
        sessions: remainingSessions,
        currentSessionId: state.currentSessionId === action.sessionId 
          ? (remainingSessions[0]?.id || null) 
          : state.currentSessionId
      }

    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.isTyping
      }

    case 'UPDATE_SESSION_TITLE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.sessionId
            ? { ...session, title: action.title, updatedAt: new Date() }
            : session
        )
      }

    case 'TOGGLE_PIN_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.sessionId
            ? { ...session, isPinned: !session.isPinned }
            : session
        )
      }

    case 'LOAD_SESSIONS':
      return {
        ...state,
        sessions: action.sessions
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings }
      }

    case 'CLEAR_ALL_SESSIONS':
      return {
        ...state,
        sessions: [],
        currentSessionId: null
      }

    default:
      return state
  }
}

interface ChatContextType {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  currentSession: ChatSession | null
  createNewSession: () => ChatSession
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>
  regenerateResponse: (messageId: string) => Promise<void>
  editMessage: (messageId: string, content: string) => void
  deleteMessage: (messageId: string) => void
  deleteSession: (sessionId: string) => void
  exportChat: (sessionId?: string) => void
  importChats: (file: File) => Promise<void>
  searchMessages: (query: string) => Message[]
}

const ChatContext = createContext<ChatContextType | null>(null)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { config, getApiKey, isConfigured } = useAI()

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('sybeez-chat-sessions')
    const savedSettings = localStorage.getItem('sybeez-settings')
    
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        dispatch({ type: 'LOAD_SESSIONS', sessions })
      } catch (error) {
        console.error('Error loading sessions:', error)
      }
    }

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        dispatch({ type: 'UPDATE_SETTINGS', settings })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  // Auto-save sessions to localStorage
  useEffect(() => {
    if (state.settings.autoSaveChats && state.sessions.length > 0) {
      localStorage.setItem('sybeez-chat-sessions', JSON.stringify(state.sessions))
    }
  }, [state.sessions, state.settings.autoSaveChats])

  // Auto-save settings
  useEffect(() => {
    localStorage.setItem('sybeez-settings', JSON.stringify(state.settings))
  }, [state.settings])

  const currentSession = state.sessions.find(s => s.id === state.currentSessionId) || null

  const createNewSession = (): ChatSession => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    dispatch({ type: 'CREATE_SESSION', session: newSession })
    return newSession
  }

  // Generate AI response using configured AI service
  const generateAIResponse = async (userMessage: string, conversation: Message[]): Promise<string> => {
    if (!isConfigured || !config) {
      return "⚠️ AI is not configured yet. Please go to settings and set up your AI provider to enable intelligent responses."
    }

    try {
      const aiService = new AIService({
        ...config,
        apiKey: getApiKey(config.provider)
      })

      // Convert conversation to AI format
      const messages = [
        {
          role: 'system' as const,
          content: 'You are Sybeez, a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions. Be friendly but professional.'
        },
        ...conversation
          .filter(m => !m.isTyping)
          .map(m => ({
            role: m.isUser ? 'user' as const : 'assistant' as const,
            content: m.content
          })),
        {
          role: 'user' as const,
          content: userMessage
        }
      ]

      const response = await aiService.sendMessage(messages)
      return response.content
    } catch (error) {
      console.error('AI response error:', error)
      
      let errorMessage = "I'm sorry, I encountered an error while processing your message."
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage += " Please check your API key in settings."
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage += " You may have reached your API usage limit."
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += " Please check your internet connection."
        }
      }
      
      return errorMessage + " Please try again or contact support if the issue persists."
    }
  }

  const sendMessage = async (content: string, attachments?: Attachment[]) => {
    let sessionId = state.currentSessionId
    
    if (!currentSession) {
      const newSession = createNewSession()
      sessionId = newSession.id
    }

    if (!sessionId) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date(),
      attachments
    }

    dispatch({ type: 'ADD_MESSAGE', sessionId, message: userMessage })
    dispatch({ type: 'SET_TYPING', isTyping: true })

    // Update session title based on first message
    const session = state.sessions.find(s => s.id === sessionId)
    if (session && session.messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
      dispatch({ type: 'UPDATE_SESSION_TITLE', sessionId, title })
    }

    try {
      const aiResponse = await generateAIResponse(content, session?.messages || [])
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      }

      dispatch({ type: 'ADD_MESSAGE', sessionId, message: aiMessage })
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "I'm sorry, I encountered an error while processing your message. Please try again.",
        isUser: false,
        timestamp: new Date()
      }
      dispatch({ type: 'ADD_MESSAGE', sessionId, message: errorMessage })
    } finally {
      dispatch({ type: 'SET_TYPING', isTyping: false })
    }
  }

  const regenerateResponse = async (messageId: string) => {
    if (!currentSession) return

    const messageIndex = currentSession.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1 || messageIndex === 0) return

    const previousMessage = currentSession.messages[messageIndex - 1]
    if (!previousMessage.isUser) return

    dispatch({ type: 'DELETE_MESSAGE', sessionId: currentSession.id, messageId })
    dispatch({ type: 'SET_TYPING', isTyping: true })

    try {
      const aiResponse = await generateAIResponse(previousMessage.content, currentSession.messages.slice(0, messageIndex - 1))
      
      const newMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      }

      dispatch({ type: 'ADD_MESSAGE', sessionId: currentSession.id, message: newMessage })
    } catch (error) {
      console.error('Error regenerating response:', error)
    } finally {
      dispatch({ type: 'SET_TYPING', isTyping: false })
    }
  }

  const editMessage = (messageId: string, content: string) => {
    if (!currentSession) return
    dispatch({ type: 'UPDATE_MESSAGE', sessionId: currentSession.id, messageId, content })
  }

  const deleteMessage = (messageId: string) => {
    if (!currentSession) return
    dispatch({ type: 'DELETE_MESSAGE', sessionId: currentSession.id, messageId })
  }

  const deleteSession = (sessionId: string) => {
    dispatch({ type: 'DELETE_SESSION', sessionId })
  }

  const exportChat = (sessionId?: string) => {
    const session = sessionId 
      ? state.sessions.find(s => s.id === sessionId)
      : currentSession

    if (!session) return

    const exportData = {
      title: session.title,
      messages: session.messages,
      createdAt: session.createdAt,
      exportedAt: new Date()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importChats = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (Array.isArray(data)) {
        // Multiple sessions
        const sessions = data.map(session => ({
          ...session,
          id: crypto.randomUUID(),
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt || session.createdAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        dispatch({ type: 'LOAD_SESSIONS', sessions: [...sessions, ...state.sessions] })
      } else {
        // Single session
        const session: ChatSession = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt || data.createdAt),
          messages: data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }
        dispatch({ type: 'CREATE_SESSION', session })
      }
    } catch (error) {
      console.error('Error importing chats:', error)
      throw new Error('Invalid file format')
    }
  }

  const searchMessages = (query: string): Message[] => {
    const results: Message[] = []
    const lowercaseQuery = query.toLowerCase()

    state.sessions.forEach(session => {
      session.messages.forEach(message => {
        if (message.content.toLowerCase().includes(lowercaseQuery)) {
          results.push(message)
        }
      })
    })

    return results
  }

  const contextValue: ChatContextType = {
    state,
    dispatch,
    currentSession,
    createNewSession,
    sendMessage,
    regenerateResponse,
    editMessage,
    deleteMessage,
    deleteSession,
    exportChat,
    importChats,
    searchMessages
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}