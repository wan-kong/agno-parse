"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
  Wrench,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Copy,
  Sparkles,
  Zap,
  Activity,
  Database,
  Filter,
  Bot,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AgentEvent {
  id: number
  created_at: number
  event: string
  data: any
}

export default function AIAgentParser() {
  const [inputText, setInputText] = useState("")
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEventTypes, setSelectedEventTypes] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Get unique event types
  const eventTypes = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.event)))
  }, [events])

  // Filter events based on selected types
  const filteredEvents = useMemo(() => {
    if (selectedEventTypes.size === 0) return events
    return events.filter((event) => selectedEventTypes.has(event.event))
  }, [events, selectedEventTypes])

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "TeamRunStarted":
      case "RunStarted":
        return <PlayCircle className="w-4 h-4 text-emerald-600" />
      case "TeamToolCallStarted":
      case "ToolCallStarted":
        return <Wrench className="w-4 h-4 text-blue-600" />
      case "ToolCallCompleted":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "TeamRunResponseContent":
      case "RunResponseContent":
        return <MessageSquare className="w-4 h-4 text-purple-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-amber-600" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "TeamRunStarted":
      case "RunStarted":
        return "border-l-emerald-400 bg-emerald-50/50"
      case "TeamToolCallStarted":
      case "ToolCallStarted":
        return "border-l-blue-400 bg-blue-50/50"
      case "ToolCallCompleted":
        return "border-l-green-400 bg-green-50/50"
      case "TeamRunResponseContent":
      case "RunResponseContent":
        return "border-l-purple-400 bg-purple-50/50"
      default:
        return "border-l-amber-400 bg-amber-50/50"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
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

  const handleParse = async () => {
    if (!inputText.trim()) {
      setParseError("Please enter some JSON data to parse")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      setParseError(null)
      const parsedObjects = parseJSONObjects(inputText)

      if (parsedObjects.length === 0) {
        setParseError("No valid JSON objects found in the input")
        setIsLoading(false)
        return
      }

      const newEvents = parsedObjects.map((obj, index) => ({
        id: index,
        created_at: obj.created_at || Date.now() / 1000,
        event: obj.event || "Unknown",
        data: obj,
      }))

      setEvents(newEvents)
      setSelectedEventTypes(new Set()) // Reset filters
      toast({
        title: "✨ Parse Successful!",
        description: `Successfully parsed ${newEvents.length} events`,
      })
    } catch (error) {
      setParseError(`Parse error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setInputText("")
    setEvents([])
    setParseError(null)
    setSelectedEventTypes(new Set())
  }

  const handleEventTypeToggle = (eventType: string, checked: boolean) => {
    const newSelected = new Set(selectedEventTypes)
    if (checked) {
      newSelected.add(eventType)
    } else {
      newSelected.delete(eventType)
    }
    setSelectedEventTypes(newSelected)
  }

  const clearFilters = () => {
    setSelectedEventTypes(new Set())
  }

  const loadSampleData = () => {
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
    }
  }
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
    }
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
    "result": "Weather search results for Beijing showing current temperature, conditions, and forecast data...",
    "metrics": {
      "time": 0.6865077069960535
    }
  }
}{
  "created_at": 1750052909,
  "event": "TeamRunResponseContent",
  "team_id": "financial-researcher-team",
  "run_id": "5580ae11-687f-48a7-b1ca-3232640781e9",
  "session_id": "4e79ac06-df04-4215-a3ed-60393d72e531",
  "content": "Here is the current weather information for Beijing based on the search results.",
  "content_type": "str",
  "thinking": ""
}{
  "created_at": 1750052910,
  "event": "RunResponseContent",
  "agent_id": "web-agent",
  "run_id": "0b65893a-3567-4991-a22b-65bea5072895",
  "session_id": "c80e88dd-48ab-4473-a6b9-836ee9adff5b",
  "content": "The current weather in Beijing shows partly cloudy conditions with a temperature of 24°C.",
  "content_type": "str",
  "thinking": ""
}`
    setInputText(sampleData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Compact Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Agent Event Parser
            </h1>
          </div>
          <p className="text-sm text-slate-600">Transform AI agent logs into interactive visualizations</p>
        </div>

        {/* Compact Input Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-600" />
              JSON Input
              {inputText && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {inputText.length} chars
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Paste your concatenated JSON objects here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] font-mono text-xs border-2 border-slate-200 focus:border-blue-400 transition-all duration-200 bg-slate-50/50 resize-none"
            />

            {parseError && (
              <div className="p-2 bg-red-50 border-l-4 border-red-400 rounded text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-800">{parseError}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleParse}
                disabled={isLoading}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? <Activity className="w-4 h-4 animate-spin mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
                {isLoading ? "Parsing..." : "Parse"}
              </Button>
              <Button onClick={loadSampleData} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-1" />
                Sample
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {events.length > 0 && (
          <>
            {/* Filter Bar */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium">Filter by Event Type:</span>
                  </div>
                  {selectedEventTypes.size > 0 && (
                    <Button onClick={clearFilters} variant="ghost" size="sm" className="h-6 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      Clear ({selectedEventTypes.size})
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {eventTypes.map((eventType) => (
                    <div key={eventType} className="flex items-center space-x-1">
                      <Checkbox
                        id={eventType}
                        checked={selectedEventTypes.has(eventType)}
                        onCheckedChange={(checked) => handleEventTypeToggle(eventType, checked as boolean)}
                      />
                      <label htmlFor={eventType} className="text-xs cursor-pointer flex items-center gap-1">
                        {getEventIcon(eventType)}
                        {eventType}
                        <Badge variant="outline" className="text-xs h-4">
                          {events.filter((e) => e.event === eventType).length}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Event List - More Space */}
              <div className="lg:col-span-4">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        Events
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {filteredEvents.length} / {events.length}
                        </Badge>
                        {selectedEventTypes.size > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">Filtered</Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ScrollArea className="h-[600px] w-full">
                      <div className="space-y-2">
                        {filteredEvents.map((event, index) => (
                          <EventCard key={event.id} event={event} index={index} />
                        ))}
                        {filteredEvents.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No events match the selected filters</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Compact Statistics */}
              <div className="space-y-4">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{filteredEvents.length}</div>
                      <div className="text-xs text-slate-600">Showing</div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-700">Event Types</div>
                      {Object.entries(
                        filteredEvents.reduce(
                          (acc, event) => {
                            acc[event.event] = (acc[event.event] || 0) + 1
                            return acc
                          },
                          {} as Record<string, number>,
                        ),
                      ).map(([eventType, count]) => (
                        <div key={eventType} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            {getEventIcon(eventType)}
                            <span className="truncate">{eventType.replace(/([A-Z])/g, " $1").trim()}</span>
                          </div>
                          <Badge variant="outline" className="text-xs h-4">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {filteredEvents.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-700">Timeline</div>
                          <div className="text-xs space-y-1">
                            <div className="p-2 rounded bg-green-50 border border-green-200">
                              <div className="text-slate-600">First</div>
                              <div className="font-mono text-xs">
                                {new Date(
                                  Math.min(...filteredEvents.map((e) => e.created_at)) * 1000,
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="p-2 rounded bg-blue-50 border border-blue-200">
                              <div className="text-slate-600">Last</div>
                              <div className="font-mono text-xs">
                                {new Date(
                                  Math.max(...filteredEvents.map((e) => e.created_at)) * 1000,
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, index }: { event: AgentEvent; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "TeamRunStarted":
      case "RunStarted":
        return <PlayCircle className="w-4 h-4 text-emerald-600" />
      case "TeamToolCallStarted":
      case "ToolCallStarted":
        return <Wrench className="w-4 h-4 text-blue-600" />
      case "ToolCallCompleted":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "TeamRunResponseContent":
      case "RunResponseContent":
        return <MessageSquare className="w-4 h-4 text-purple-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-amber-600" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "TeamRunStarted":
      case "RunStarted":
        return "border-l-emerald-400 bg-emerald-50/50"
      case "TeamToolCallStarted":
      case "ToolCallStarted":
        return "border-l-blue-400 bg-blue-50/50"
      case "ToolCallCompleted":
        return "border-l-green-400 bg-green-50/50"
      case "TeamRunResponseContent":
      case "RunResponseContent":
        return "border-l-purple-400 bg-purple-50/50"
      default:
        return "border-l-amber-400 bg-amber-50/50"
    }
  }

  const renderEventDetails = () => {
    const { created_at, event: eventType, ...otherData } = event.data

    return (
      <div className="space-y-3 text-xs">
        {/* Compact Basic Info */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded bg-white/60 border">
            <div className="text-xs text-slate-500 mb-1">Time</div>
            <div className="font-mono text-xs">{new Date(created_at * 1000).toLocaleTimeString()}</div>
          </div>
          {otherData.team_id && (
            <div className="p-2 rounded bg-white/60 border">
              <div className="text-xs text-slate-500 mb-1">Team</div>
              <div className="font-mono text-xs truncate">{otherData.team_id.split("-")[0]}</div>
            </div>
          )}
          {otherData.agent_id && (
            <div className="p-2 rounded bg-white/60 border">
              <div className="text-xs text-slate-500 mb-1">Agent</div>
              <div className="font-mono text-xs truncate flex items-center gap-1">
                <Bot className="w-3 h-3" />
                {otherData.agent_id}
              </div>
            </div>
          )}
          {otherData.model && (
            <div className="p-2 rounded bg-white/60 border">
              <div className="text-xs text-slate-500 mb-1">Model</div>
              <div className="font-mono text-xs">{otherData.model}</div>
            </div>
          )}
        </div>

        {/* Content */}
        {otherData.content !== undefined && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <MessageSquare className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-medium">Content</span>
            </div>
            <div className="p-2 bg-purple-50 rounded border text-xs">
              {otherData.content || <span className="text-slate-500 italic">Empty</span>}
            </div>
          </div>
        )}

        {/* Tool Details */}
        {otherData.tool && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Wrench className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium">Tool</span>
              <Badge className="bg-blue-600 text-white text-xs h-4">{otherData.tool.tool_name}</Badge>
              {otherData.tool.metrics?.time && (
                <Badge variant="outline" className="text-xs h-4">
                  {otherData.tool.metrics.time.toFixed(3)}s
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {otherData.tool.tool_args && (
                <div className="p-2 bg-blue-50 rounded border">
                  <div className="text-xs font-medium mb-1">Args</div>
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(otherData.tool.tool_args, null, 2)}</pre>
                </div>
              )}

              {otherData.tool.result && (
                <div className="p-2 bg-green-50 rounded border">
                  <div className="text-xs font-medium mb-1">Result</div>
                  <div className="text-xs max-h-20 overflow-y-auto">
                    {typeof otherData.tool.result === "string"
                      ? otherData.tool.result.length > 200
                        ? `${otherData.tool.result.substring(0, 200)}...`
                        : otherData.tool.result
                      : JSON.stringify(otherData.tool.result, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw JSON */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 p-1 rounded hover:bg-slate-100">
            <ChevronRight className="w-3 h-3" />
            <FileText className="w-3 h-3" />
            Raw JSON
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-1 p-2 bg-slate-900 rounded text-xs text-green-400 overflow-x-auto max-h-32 overflow-y-auto">
              {JSON.stringify(event.data, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${getEventColor(event.event)} border-l-4 shadow-sm`}>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-2 py-0 h-5">
              #{index + 1}
            </Badge>
            {getEventIcon(event.event)}
            <div>
              <CardTitle className="text-sm font-semibold">{event.event}</CardTitle>
              <div className="text-xs text-slate-500">{new Date(event.created_at * 1000).toLocaleTimeString()}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-6 w-6 p-0">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0 pb-3">
          <Separator className="mb-3" />
          {renderEventDetails()}
        </CardContent>
      )}
    </Card>
  )
}
