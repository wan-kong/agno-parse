"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Play,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Wrench,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
} from "lucide-react"

interface AgentEvent {
  id: number
  created_at: number
  event: string
  data: any
  timestamp: Date
}

const sampleData = `{
  "created_at": 1750052905,
  "event": "TeamRunStarted",
  "team_id": "financial-researcher-team",
  "run_id": "5580ae11-687f-48a7-b1ca-3232640781e9",
  "session_id": "4e79ac06-df04-4215-a3ed-60393d72e531",
  "model": "gpt-4o",
  "model_provider": "OpenAI"
}{
  "created_at": 1750052906,
  "event": "TeamToolCallStarted",
  "team_id": "financial-researcher-team",
  "run_id": "5580ae11-687f-48a7-b1ca-3232640781e9",
  "session_id": "4e79ac06-df04-4215-a3ed-60393d72e531",
  "tool": {
    "tool_call_id": "call_VEM2hrP3EKqLsqhehMINtTnM",
    "tool_name": "forward_task_to_member",
    "tool_args": {
      "member_id": "web-agent",
      "expected_output": "Current weather information for Beijing."
    },
    "tool_call_error": null,
    "result": null,
    "metrics": null,
    "stop_after_tool_call": false,
    "created_at": 1749696235,
    "requires_confirmation": null,
    "confirmed": null,
    "confirmation_note": null,
    "requires_user_input": null,
    "user_input_schema": null,
    "external_execution_required": null
  }
}{
  "created_at": 1750052906,
  "event": "RunStarted",
  "agent_id": "web-agent",
  "run_id": "0b65893a-3567-4991-a22b-65bea5072895",
  "session_id": "c80e88dd-48ab-4473-a6b9-836ee9adff5b",
  "model": "gpt-4o",
  "model_provider": "OpenAI"
}{
  "created_at": 1750052907,
  "event": "ToolCallStarted",
  "agent_id": "web-agent",
  "run_id": "0b65893a-3567-4991-a22b-65bea5072895",
  "session_id": "c80e88dd-48ab-4473-a6b9-836ee9adff5b",
  "tool": {
    "tool_call_id": "call_6Rfb5KrkSf2Wr1UBxHAsmOgD",
    "tool_name": "duckduckgo_search",
    "tool_args": {
      "query": "current weather in Beijing"
    },
    "tool_call_error": null,
    "result": null,
    "metrics": null,
    "stop_after_tool_call": false,
    "created_at": 1749696235,
    "requires_confirmation": null,
    "confirmed": null,
    "confirmation_note": null,
    "requires_user_input": null,
    "user_input_schema": null,
    "external_execution_required": null
  }
}{
  "created_at": 1750052908,
  "event": "ToolCallCompleted",
  "agent_id": "web-agent",
  "run_id": "0b65893a-3567-4991-a22b-65bea5072895",
  "session_id": "c80e88dd-48ab-4473-a6b9-836ee9adff5b",
  "content": "duckduckgo_search(query=current weather in Beijing) completed in 0.6865s.",
  "tool": {
    "tool_call_id": "call_6Rfb5KrkSf2Wr1UBxHAsmOgD",
    "tool_name": "duckduckgo_search",
    "tool_args": {
      "query": "current weather in Beijing"
    },
    "tool_call_error": false,
    "result": "[\\n  {\\n    \\"title\\": \\"Beijing, Beijing, China Weather Forecast | AccuWeather\\",\\n    \\"href\\": \\"https://www.accuweather.com/en/cn/beijing/101924/weather-forecast/101924\\",\\n    \\"body\\": \\"Beijing, Beijing, China Weather Forecast, with current conditions, wind, air quality, and what to expect for the next 3 days.\\"\\n  },\\n  {\\n    \\"title\\": \\"Beijing Weather Forecast Today\\",\\n    \\"href\\": \\"https://chinaweather.org/beijing\\",\\n    \\"body\\": \\"Beijing, China Weather. Current: 30.73°C/87.31°F, Wind SW at 26.24 km/h, 36% Humidity, 94% Chance of rain. Beijing, China Weather; Current conditions; Weather forecast; Averages and extremes; Yesterday's Data; Temperature and possibility of rain in Beijing over the next 12 hours;\\"\\n  }\\n]",
    "metrics": {
      "time": 0.6865077069960535
    },
    "stop_after_tool_call": false,
    "created_at": 1749696235,
    "requires_confirmation": null,
    "confirmed": null,
    "confirmation_note": null,
    "requires_user_input": null,
    "user_input_schema": null,
    "external_execution_required": null
  }
}{
  "created_at": 1750052908,
  "event": "TeamRunResponseContent",
  "team_id": "financial-researcher-team",
  "run_id": "5580ae11-687f-48a7-b1ca-3232640781e9",
  "session_id": "4e79ac06-df04-4215-a3ed-60393d72e531",
  "content": "",
  "content_type": "str",
  "thinking": ""
}{
  "created_at": 1750052909,
  "event": "TeamRunResponseContent",
  "team_id": "financial-researcher-team",
  "run_id": "5580ae11-687f-48a7-b1ca-3232640781e9",
  "session_id": "4e79ac06-df04-4215-a3ed-60393d72e531",
  "content": "Here is the current weather information for Beijing.",
  "content_type": "str",
  "thinking": ""
}`

export default function AIAgentStreamParser() {
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentBuffer, setCurrentBuffer] = useState("")
  const streamRef = useRef<NodeJS.Timeout | null>(null)
  const eventIdRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "TeamRunStarted":
      case "RunStarted":
        return <PlayCircle className="w-4 h-4 text-green-600" />
      case "TeamToolCallStarted":
      case "ToolCallStarted":
        return <Wrench className="w-4 h-4 text-blue-600" />
      case "ToolCallCompleted":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "TeamRunResponseContent":
      case "RunResponseContent":
        return <MessageSquare className="w-4 h-4 text-purple-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "TeamRunStarted":
      case "RunStarted":
        return "bg-green-100 border-green-200 text-green-800"
      case "TeamToolCallStarted":
      case "ToolCallStarted":
        return "bg-blue-100 border-blue-200 text-blue-800"
      case "ToolCallCompleted":
        return "bg-emerald-100 border-emerald-200 text-emerald-800"
      case "TeamRunResponseContent":
      case "RunResponseContent":
        return "bg-purple-100 border-purple-200 text-purple-800"
      default:
        return "bg-gray-100 border-gray-200 text-gray-800"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  const parseJSONObjects = (text: string) => {
    const objects = []
    let currentObject = ""
    let braceCount = 0
    let inString = false
    let escapeNext = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      if (escapeNext) {
        escapeNext = false
        currentObject += char
        continue
      }

      if (char === "\\") {
        escapeNext = true
        currentObject += char
        continue
      }

      if (char === '"' && !escapeNext) {
        inString = !inString
      }

      if (!inString) {
        if (char === "{") {
          braceCount++
        } else if (char === "}") {
          braceCount--
        }
      }

      currentObject += char

      if (braceCount === 0 && currentObject.trim()) {
        try {
          const parsed = JSON.parse(currentObject.trim())
          objects.push(parsed)
          currentObject = ""
        } catch (e) {
          // Continue building the object
        }
      }
    }

    return objects
  }

  const simulateStreaming = () => {
    if (isStreaming) return

    setIsStreaming(true)
    setEvents([])
    setCurrentBuffer("")
    eventIdRef.current = 0

    let charIndex = 0
    const streamInterval = setInterval(() => {
      if (charIndex >= sampleData.length) {
        setIsStreaming(false)
        setCurrentBuffer("")
        clearInterval(streamInterval)
        return
      }

      const newBuffer = sampleData.substring(0, charIndex + 1)
      setCurrentBuffer(newBuffer)

      // Try to parse complete JSON objects
      const parsedObjects = parseJSONObjects(newBuffer)

      if (parsedObjects.length > events.length) {
        const newEvents = parsedObjects.slice(events.length).map((obj) => ({
          id: eventIdRef.current++,
          created_at: obj.created_at,
          event: obj.event,
          data: obj,
          timestamp: new Date(),
        }))

        setEvents((prev) => [...prev, ...newEvents])
      }

      charIndex += Math.floor(Math.random() * 5) + 1 // Variable speed
    }, 50)

    streamRef.current = streamInterval
  }

  const stopStreaming = () => {
    if (streamRef.current) {
      clearInterval(streamRef.current)
      streamRef.current = null
    }
    setIsStreaming(false)
    setCurrentBuffer("")
  }

  const resetParser = () => {
    stopStreaming()
    setEvents([])
    setCurrentBuffer("")
    eventIdRef.current = 0
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Agent Stream Parser</h1>
        <p className="text-muted-foreground">Real-time parsing of AI agent events with beautiful formatting</p>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={simulateStreaming} disabled={isStreaming} className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          Start Stream
        </Button>
        <Button onClick={stopStreaming} disabled={!isStreaming} variant="outline" className="flex items-center gap-2">
          <Square className="w-4 h-4" />
          Stop Stream
        </Button>
        <Button onClick={resetParser} variant="outline" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Stream */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Event Stream
                {isStreaming && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Streaming</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full" ref={scrollRef}>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                  {isStreaming && (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-muted-foreground">Parsing...</span>
                      </div>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {currentBuffer.slice(-200)}
                        <span className="animate-pulse">|</span>
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Events Parsed</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={isStreaming ? "default" : "secondary"}>{isStreaming ? "Streaming" : "Idle"}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Event Types</p>
                <div className="space-y-1">
                  {Object.entries(
                    events.reduce(
                      (acc, event) => {
                        acc[event.event] = (acc[event.event] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([eventType, count]) => (
                    <div key={eventType} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getEventIcon(eventType)}
                        <span className="truncate">{eventType}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buffer Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Buffer Size</span>
                  <span className="text-sm font-mono">{currentBuffer.length} chars</span>
                </div>
                <div className="text-xs p-2 bg-muted rounded font-mono max-h-20 overflow-y-auto">
                  {currentBuffer.slice(-100) || "Empty"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, index }: { event: AgentEvent; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const renderEventDetails = () => {
    const { created_at, event: eventType, ...otherData } = event.data

    return (
      <div className="space-y-3">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Timestamp:</span>
            <div className="font-mono">{formatTimestamp(created_at)}</div>
          </div>
          {otherData.team_id && (
            <div>
              <span className="text-muted-foreground">Team:</span>
              <div className="font-mono truncate">{otherData.team_id}</div>
            </div>
          )}
          {otherData.agent_id && (
            <div>
              <span className="text-muted-foreground">Agent:</span>
              <div className="font-mono truncate">{otherData.agent_id}</div>
            </div>
          )}
          {otherData.model && (
            <div>
              <span className="text-muted-foreground">Model:</span>
              <div className="font-mono">{otherData.model}</div>
            </div>
          )}
        </div>

        {/* Content */}
        {otherData.content && (
          <div>
            <span className="text-muted-foreground text-xs">Content:</span>
            <div className="mt-1 p-2 bg-muted rounded text-sm">
              {otherData.content || <span className="text-muted-foreground italic">Empty</span>}
            </div>
          </div>
        )}

        {/* Tool Details */}
        {otherData.tool && (
          <div>
            <span className="text-muted-foreground text-xs">Tool Details:</span>
            <div className="mt-1 p-2 bg-muted rounded text-xs space-y-2">
              <div>
                <strong>Name:</strong> {otherData.tool.tool_name}
              </div>
              {otherData.tool.tool_args && (
                <div>
                  <strong>Args:</strong>
                  <pre className="mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(otherData.tool.tool_args, null, 2)}
                  </pre>
                </div>
              )}
              {otherData.tool.metrics && (
                <div>
                  <strong>Duration:</strong> {otherData.tool.metrics.time?.toFixed(3)}s
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw JSON */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronRight className="w-3 h-3" />
            View Raw JSON
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
              {JSON.stringify(event.data, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  return (
    <Card className={`transition-all duration-200 ${getEventColor(event.event)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
            {getEventIcon(event.event)}
            <CardTitle className="text-sm">{event.event}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimestamp(event.created_at)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-6 w-6 p-0">
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && <CardContent className="pt-0">{renderEventDetails()}</CardContent>}
    </Card>
  )
}
