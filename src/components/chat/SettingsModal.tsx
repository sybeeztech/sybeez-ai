import { useState } from "react"
import { X, Palette, Type, Keyboard, Volume2, Save, HardDrive, HelpCircle, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChatContext } from "@/contexts/ChatContext"
import { useAI } from "@/contexts/AIContext"
import { KeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { AISetup } from "./AISetup"
import { toast } from "sonner"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { state, dispatch } = useChatContext()
  const { isConfigured } = useAI()
  const [settings, setSettings] = useState(state.settings)

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', settings })
    toast.success("Settings saved")
    onOpenChange(false)
  }

  const handleReset = () => {
    const defaultSettings = {
      theme: 'dark' as const,
      fontSize: 'medium' as const,
      sendOnEnter: true,
      soundEnabled: true,
      autoSaveChats: true,
      streamingEnabled: true
    }
    setSettings(defaultSettings)
    dispatch({ type: 'UPDATE_SETTINGS', settings: defaultSettings })
    toast.success("Settings reset to default")
  }

  const handleClearAllChats = () => {
    if (window.confirm("Are you sure you want to delete all chats? This action cannot be undone.")) {
      dispatch({ type: 'CLEAR_ALL_SESSIONS' })
      localStorage.removeItem('sybeez-chat-sessions')
      toast.success("All chats cleared")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai">AI Setup</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="mt-6">
            <AISetup />
          </TabsContent>

          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Appearance */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: 'dark' | 'light') => setSettings({...settings, theme: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <p className="text-sm text-muted-foreground">Adjust text size for better readability</p>
                  </div>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(value: 'small' | 'medium' | 'large') => setSettings({...settings, fontSize: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Input & Interaction */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Input & Interaction
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sendOnEnter">Send on Enter</Label>
                    <p className="text-sm text-muted-foreground">Press Enter to send messages (Shift+Enter for new line)</p>
                  </div>
                  <Switch
                    id="sendOnEnter"
                    checked={settings.sendOnEnter}
                    onCheckedChange={(checked) => setSettings({...settings, sendOnEnter: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="streamingEnabled">Streaming Responses</Label>
                    <p className="text-sm text-muted-foreground">Show AI responses as they are generated</p>
                  </div>
                  <Switch
                    id="streamingEnabled"
                    checked={settings.streamingEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, streamingEnabled: checked})}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Sound & Notifications */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Sound & Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="soundEnabled">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for notifications and interactions</p>
                  </div>
                  <Switch
                    id="soundEnabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, soundEnabled: checked})}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shortcuts" className="mt-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Keyboard Shortcuts
              </h3>
              <div className="bg-muted p-4 rounded-lg">
                <KeyboardShortcuts />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Use these keyboard shortcuts to navigate and interact with Sybeez more efficiently.
                On Windows/Linux, use Ctrl instead of ⌘.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-6">
            {/* Data & Privacy */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Data & Privacy
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoSaveChats">Auto-save Chats</Label>
                    <p className="text-sm text-muted-foreground">Automatically save your conversations locally</p>
                  </div>
                  <Switch
                    id="autoSaveChats"
                    checked={settings.autoSaveChats}
                    onCheckedChange={(checked) => setSettings({...settings, autoSaveChats: checked})}
                  />
                </div>

                <Separator />

                <div className="pt-2">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Storage Information</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Chat history: Stored locally in your browser</p>
                      <p>• Settings: Saved to local storage</p>
                      <p>• No data is sent to external servers</p>
                      <p>• {state.sessions.length} conversations saved</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={handleClearAllChats}
                    className="w-full"
                  >
                    Clear All Chat Data
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will permanently delete all your saved conversations. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}