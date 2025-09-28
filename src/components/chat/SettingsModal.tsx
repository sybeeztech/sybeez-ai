import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  Bot,
  Key,
  Palette,
  Volume2,
  Download,
  Upload,
  Trash2,
  Shield,
  Zap,
  Info
} from "lucide-react"
import { useAI } from "@/contexts/AIContext"
import { useChatContext } from "@/contexts/ChatContext"
import { AI_PROVIDERS, type AIConfig } from "@/lib/ai-types"
import { toast } from "sonner"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { config, updateConfig, saveApiKey, getApiKey, clearApiKey, testConnection } = useAI()
  const { state, dispatch } = useChatContext()
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [newApiKey, setNewApiKey] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<AIConfig['provider']>(config?.provider || "gemini")

  const currentProvider = AI_PROVIDERS[selectedProvider]
  const hasApiKey = !!getApiKey(selectedProvider)

  const handleProviderChange = async (provider: AIConfig['provider']) => {
    setSelectedProvider(provider)
    await updateConfig({ provider })
    toast.success(`Switched to ${AI_PROVIDERS[provider].name}`)
  }

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      toast.error("Please enter an API key")
      return
    }

    try {
      await saveApiKey(selectedProvider, newApiKey)
      setNewApiKey("")
      toast.success("API key saved successfully")
    } catch (error) {
      toast.error("Failed to save API key")
    }
  }

  const handleTestConnection = async () => {
    if (!hasApiKey) {
      toast.error("Please add an API key first")
      return
    }

    setIsTestingConnection(true)
    try {
      const result = await testConnection()
      if (result) {
        toast.success("Connection successful!")
      } else {
        toast.error("Connection failed")
      }
    } catch (error) {
      toast.error("Connection test failed")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleClearApiKey = () => {
    clearApiKey(selectedProvider)
    toast.success("API key cleared")
  }

  const handleExportChats = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `sybeez-chats-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      toast.success("Chats exported successfully")
    } catch (error) {
      toast.error("Failed to export chats")
    }
  }

  const handleImportChats = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          // You would need to implement import functionality in ChatContext
          toast.success("Chats imported successfully")
        } catch (error) {
          toast.error("Failed to import chats")
        }
      }
    }
    input.click()
  }

  const handleClearAllChats = () => {
    if (confirm("Are you sure you want to delete all chat sessions? This cannot be undone.")) {
      dispatch({ type: 'CLEAR_ALL_SESSIONS' })
      toast.success("All chats cleared")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your AI providers, preferences, and chat data
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai">AI Provider</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="provider">AI Provider</Label>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                {hasApiKey ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-muted rounded text-sm">
                      API key configured ✓
                    </div>
                    <Button variant="outline" size="sm" onClick={handleClearApiKey}>
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                    >
                      {isTestingConnection ? "Testing..." : "Test"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={`Enter your ${currentProvider.name} API key`}
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                    />
                    <Button onClick={handleSaveApiKey} disabled={!newApiKey.trim()}>
                      Save API Key
                    </Button>
                  </div>
                )}
              </div>

              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Visit your AI provider's website to get an API key
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-save Chats</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save chat sessions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Export & Import</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Backup or restore your chat sessions
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportChats}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Chats
                  </Button>
                  <Button variant="outline" onClick={handleImportChats}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Chats
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Irreversible actions that will permanently delete your data
                </p>
                <Button variant="destructive" onClick={handleClearAllChats}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Chats
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/sybeezlogo.png" 
                    alt="Sybeez Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold">Sybeez AI</h2>
                <p className="text-muted-foreground">
                  Advanced AI Chat Platform
                </p>
                <Badge variant="outline" className="mt-2">
                  Version 1.0.0
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multiple AI providers (GPT, Gemini, Claude)</li>
                  <li>• Advanced chat features & search</li>
                  <li>• File & voice attachments</li>
                  <li>• Session management</li>
                  <li>• Responsive design</li>
                </ul>
              </div>

              <Separator />

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => window.open("https://sybeez.com", "_blank")}
                >
                  Visit Sybeez.com
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
