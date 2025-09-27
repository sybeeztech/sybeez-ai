import { Calendar, Clock, Mic, Bot, Zap, Globe, Database, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AgentCapabilities() {
  const capabilities = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Scheduling",
      description: "Automatically schedule meetings, appointments, and tasks based on voice commands",
      features: ["Calendar integration", "Conflict detection", "Smart time suggestions"]
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Control",
      description: "Complete voice-driven interaction for hands-free operation",
      features: ["Speech-to-text", "Voice commands", "Audio responses"]
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Task Automation",
      description: "Automate repetitive tasks and complex workflows",
      features: ["Email automation", "File management", "Data processing"]
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "App Integration",
      description: "Connect with external applications and services",
      features: ["API integrations", "Webhook support", "Real-time sync"]
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Memory & Context",
      description: "Remember conversations and maintain context across sessions",
      features: ["Persistent memory", "Context awareness", "Learning capabilities"]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Actions",
      description: "Execute actions immediately as you speak",
      features: ["Instant execution", "Live feedback", "Error handling"]
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {capabilities.map((capability, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {capability.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{capability.title}</CardTitle>
              </div>
            </div>
            <CardDescription>{capability.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {capability.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}