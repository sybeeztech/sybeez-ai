import { useState } from "react"
import { Play, Pause, Settings, Mic, MicOff, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useAgent } from "@/contexts/AgentContext"
import { AgentCapabilities } from "./AgentCapabilities"

export function AgentDashboard() {
  const [showCapabilities, setShowCapabilities] = useState(false)
  const {
    isListening,
    startListening,
    stopListening,
    actions,
    voiceEnabled,
    setVoiceEnabled,
    autoExecute,
    setAutoExecute,
    connectedApps
  } = useAgent()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'executing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'executing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const recentActions = actions.slice(-5).reverse()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Control</h1>
          <p className="text-muted-foreground mt-1">
            Voice-controlled automation and smart assistance
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCapabilities(!showCapabilities)}
        >
          {showCapabilities ? 'Hide' : 'Show'} Capabilities
        </Button>
      </div>

      {showCapabilities && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Agent Capabilities</h2>
          <AgentCapabilities />
          <Separator />
        </div>
      )}

      {/* Voice Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Voice Control</CardTitle>
                <CardDescription>
                  {isListening ? "Listening for commands..." : "Click to start voice control"}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isListening ? "default" : "secondary"} className="px-3 py-1">
              {isListening ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LISTENING
                </div>
              ) : (
                "INACTIVE"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "default"}
                disabled={!voiceEnabled}
                className="min-w-32"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Listening
                  </>
                )}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="voice-enabled"
                  checked={voiceEnabled}
                  onCheckedChange={setVoiceEnabled}
                />
                <label htmlFor="voice-enabled" className="text-sm">
                  Voice Control Enabled
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-execute"
                  checked={autoExecute}
                  onCheckedChange={setAutoExecute}
                />
                <label htmlFor="auto-execute" className="text-sm">
                  Auto-Execute Commands
                </label>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Try saying:</strong></p>
              <p>• "Schedule meeting with John at 3 PM tomorrow"</p>
              <p>• "Remind me to call mom in 1 hour"</p>
              <p>• "Send email to team about project update"</p>
              <p>• "Search for latest AI news"</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Apps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Connected Applications
          </CardTitle>
          <CardDescription>
            {connectedApps.length === 0 
              ? "No applications connected yet"
              : `${connectedApps.length} applications connected`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedApps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Connect applications to enable more agent capabilities</p>
              <Button variant="outline" className="mt-4">
                Add Integration
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {connectedApps.map((app) => (
                <Badge key={app} variant="outline" className="px-3 py-1">
                  {app}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
          <CardDescription>
            {actions.length === 0 
              ? "No actions performed yet"
              : `${actions.length} actions performed`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Agent actions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">
                    {getStatusIcon(action.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {action.description}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(action.status)}`}
                      >
                        {action.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {action.timestamp.toLocaleTimeString()} • {action.type}
                    </p>
                    {action.result && (
                      <p className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
                        {typeof action.result === 'string' ? action.result : JSON.stringify(action.result)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}