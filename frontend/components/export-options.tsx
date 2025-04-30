"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Settings, FileVideo, Loader2 } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { useToast } from "@/components/ui/toast"
import { processVideo, formatFileSize, type ProcessingOptions } from "@/lib/video-processor"

export default function ExportOptions() {
  const state = useSelector((state: RootState) => state)
  const { toast } = useToast()

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processedVideo, setProcessedVideo] = useState<{
    url: string
    name: string
    size: number
  } | null>(null)

  const [options, setOptions] = useState<ProcessingOptions>({
    quality: "high",
    format: "mp4",
    includeSubtitles: true,
    includeAudio: true,
    includeImages: true,
  })

  const handleOptionChange = <K extends keyof ProcessingOptions>(key: K, value: ProcessingOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handleRender = async () => {
    if (!state.video.videoUrl) {
      toast({
        title: "No video to process",
        description: "Please upload a video first.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        const newProgress = prev + 5
        return newProgress >= 95 ? 95 : newProgress
      })
    }, 300)

    try {
      const result = await processVideo(state, options)

      clearInterval(progressInterval)
      setProcessingProgress(100)

      setProcessedVideo({
        url: result.url,
        name: result.name,
        size: result.size,
      })

      toast({
        title: "Processing complete",
        description: `Your video has been processed successfully as ${result.name}.`,
      })
    } catch (error) {
      clearInterval(progressInterval)

      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedVideo) return

    toast({
      title: "Download started",
      description: "Your video will be downloaded shortly.",
    })

    // Create a download link
    const a = document.createElement("a")
    a.href = processedVideo.url
    a.download = processedVideo.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Export Video</h3>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="output">
            <FileVideo className="h-4 w-4 mr-2" />
            Output
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="mb-2 block">Quality</Label>
                <RadioGroup
                  value={options.quality}
                  onValueChange={(value) => handleOptionChange("quality", value as "low" | "medium" | "high")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="quality-low" />
                    <Label htmlFor="quality-low">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="quality-medium" />
                    <Label htmlFor="quality-medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="quality-high" />
                    <Label htmlFor="quality-high">High</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Format</Label>
                <RadioGroup
                  value={options.format}
                  onValueChange={(value) => handleOptionChange("format", value as "mp4" | "webm" | "mov")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mp4" id="format-mp4" />
                    <Label htmlFor="format-mp4">MP4</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="webm" id="format-webm" />
                    <Label htmlFor="format-webm">WebM</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mov" id="format-mov" />
                    <Label htmlFor="format-mov">MOV</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="mb-2 block">Include Elements</Label>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-subtitles">Subtitles</Label>
                  <Switch
                    id="include-subtitles"
                    checked={options.includeSubtitles}
                    onCheckedChange={(checked) => handleOptionChange("includeSubtitles", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-audio">Audio Tracks</Label>
                  <Switch
                    id="include-audio"
                    checked={options.includeAudio}
                    onCheckedChange={(checked) => handleOptionChange("includeAudio", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-images">Image Overlays</Label>
                  <Switch
                    id="include-images"
                    checked={options.includeImages}
                    onCheckedChange={(checked) => handleOptionChange("includeImages", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleRender} disabled={isProcessing || !state.video.videoUrl} className="w-full">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing ({processingProgress}%)
              </>
            ) : (
              "Process Video"
            )}
          </Button>
        </TabsContent>

        <TabsContent value="output" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-4">
              {processedVideo ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">File name:</span>
                      <span>{processedVideo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Size:</span>
                      <span>{formatFileSize(processedVideo.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Format:</span>
                      <span>{options.format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Quality:</span>
                      <span className="capitalize">{options.quality}</span>
                    </div>
                  </div>

                  <Button onClick={handleDownload} className="w-full" variant="default">
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    {isProcessing ? "Processing your video..." : "Process your video to see output details"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
