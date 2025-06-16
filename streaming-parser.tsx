"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Play, Square, RotateCcw } from "lucide-react"

interface StreamLine {
  id: number
  content: string
  timestamp: Date
}

export default function StreamingParser() {
  const [lines, setLines] = useState<StreamLine[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [buffer, setBuffer] = useState("")
  const streamRef = useRef<NodeJS.Timeout | null>(null)
  const lineIdRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sample streaming data
  const sampleData = `Starting data processing...
Connecting to data source...
Authentication successful
Fetching user records...
Processing batch 1 of 5...
Found 1,247 user records
Validating data integrity...
Applying transformations...
Processing batch 2 of 5...
Found 892 transaction records
Calculating aggregations...
Processing batch 3 of 5...
Generating analytics...
Processing batch 4 of 5...
Creating summary reports...
Processing batch 5 of 5...
Finalizing output...
Data processing completed successfully!
Total records processed: 3,456
Processing time: 2.3 seconds
Status: SUCCESS`

  const simulateStreaming = () => {
    if (isStreaming) return

    setIsStreaming(true)
    setLines([])
    setBuffer("")
    lineIdRef.current = 0

    const dataLines = sampleData.split("\n")
    let currentIndex = 0

    const streamInterval = setInterval(() => {
      if (currentIndex >= dataLines.length) {
        setIsStreaming(false)
        clearInterval(streamInterval)
        return
      }

      const line = dataLines[currentIndex]

      // Simulate character-by-character streaming
      let charIndex = 0
      const charInterval = setInterval(() => {
        if (charIndex >= line.length) {
          // Line complete, add to lines array
          setLines((prev) => [
            ...prev,
            {
              id: lineIdRef.current++,
              content: line,
              timestamp: new Date(),
            },
          ])
          setBuffer("")
          clearInterval(charInterval)
          currentIndex++
          return
        }

        setBuffer(line.substring(0, charIndex + 1))
        charIndex++
      }, 20) // Character streaming speed

      streamRef.current = charInterval
    }, 300) // Line interval

    streamRef.current = streamInterval
  }

  const stopStreaming = () => {
    if (streamRef.current) {
      clearInterval(streamRef.current)
      streamRef.current = null
    }
    setIsStreaming(false)
    setBuffer("")
  }

  const resetParser = () => {
    stopStreaming()
    setLines([])
    setBuffer("")
    lineIdRef.current = 0
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, buffer])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Streaming Output Parser</h1>
        <p className="text-muted-foreground">Real-time data parsing with line-by-line display</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stream Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Stream Output
              <div className="flex items-center gap-2">
                {isStreaming && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Streaming</span>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full rounded-md border p-4" ref={scrollRef}>
              <div className="space-y-1 font-mono text-sm">
                {lines.map((line, index) => (
                  <div key={line.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground text-xs w-8 flex-shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="break-all">{line.content}</span>
                  </div>
                ))}
                {buffer && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground text-xs w-8 flex-shrink-0">
                      {String(lines.length + 1).padStart(2, "0")}
                    </span>
                    <span className="break-all">
                      {buffer}
                      <span className="animate-pulse">|</span>
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Parser Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Lines Processed</p>
                <p className="text-2xl font-bold">{lines.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">
                  {isStreaming ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-600">Idle</span>
                  )}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Lines</p>
              <div className="space-y-1">
                {lines.slice(-3).map((line) => (
                  <div key={line.id} className="text-xs p-2 bg-muted rounded">
                    <div className="font-mono truncate">{line.content}</div>
                    <div className="text-muted-foreground mt-1">{line.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
                {lines.length === 0 && <p className="text-xs text-muted-foreground">No lines processed yet</p>}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Current Buffer</p>
              <div className="text-xs p-2 bg-muted rounded font-mono min-h-[2rem] flex items-center">
                {buffer || <span className="text-muted-foreground">Empty</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Data Source</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32 w-full rounded-md border p-4">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{sampleData}</pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
