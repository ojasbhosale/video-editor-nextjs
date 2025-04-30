"use client"

import { useState, useRef, useEffect } from "react"
import ReactPlayer from "react-player"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/components/ui/toast"

export default function PreviewRender() {
  const { videoUrl } = useSelector((state: RootState) => state.video)
  const { subtitles } = useSelector((state: RootState) => state.subtitles)
  const { images } = useSelector((state: RootState) => state.images)

  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string } | null>(null)
  const [playerReady, setPlayerReady] = useState(false)

  const playerRef = useRef<ReactPlayer>(null)
  const { toast } = useToast()

  // Handle toast notifications outside of render
  useEffect(() => {
    if (toastMessage) {
      toast({
        title: toastMessage.title,
        description: toastMessage.description,
      })
      setToastMessage(null)
    }
  }, [toastMessage, toast])

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handlePlayPause = () => {
    setPlaying(!playing)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setMuted(value[0] === 0)
  }

  const handleToggleMute = () => {
    setMuted(!muted)
  }

  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0])
    setSeeking(true)
  }

  const handleSeekMouseUp = () => {
    setSeeking(false)
    if (playerRef.current) {
      playerRef.current.seekTo(played)
    }
  }

  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played)
    }
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  const handleReady = () => {
    setPlayerReady(true)
  }

  const handleError = (error: Error | string) => {
    console.error("Video player error:", error)
    setToastMessage({
      title: "Video playback error",
      description: "There was a problem playing the video.",
    })
  }

  // Find current subtitle based on playback time
  const currentSubtitle = subtitles.find(
    (sub) => played * duration >= sub.startTime && played * duration <= sub.endTime,
  )

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          {videoUrl ? (
            <>
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onReady={handleReady}
                onError={handleError}
                progressInterval={100}
                config={{
                  file: {
                    attributes: {
                      crossOrigin: "anonymous",
                    },
                  },
                }}
              />

              {/* Subtitles overlay */}
              {currentSubtitle && (
                <div
                  className="absolute bottom-8 left-0 right-0 text-center px-4"
                  style={{
                    color: currentSubtitle.color || "white",
                    fontSize: `${currentSubtitle.fontSize || 24}px`,
                    fontWeight: currentSubtitle.bold ? "bold" : "normal",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  {currentSubtitle.text}
                </div>
              )}

              {/* Image overlays */}
              {images.map((image, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    top: `${image.position.y}%`,
                    left: `${image.position.x}%`,
                    width: `${image.size}%`,
                    opacity: image.opacity,
                    transform: `translate(-50%, -50%)`,
                    pointerEvents: "none",
                  }}
                >
                  {image.url ? (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "auto",
                        border: image.border ? `2px solid ${image.borderColor || "white"}` : "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url || "/placeholder.svg"} alt={`Overlay ${index}`} className="w-full h-auto" />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/9",
                        border: image.border ? `2px solid ${image.borderColor || "white"}` : "none",
                      }}
                    >
                      <Image
                        src={`/placeholder.svg?height=80&width=120`}
                        alt={`Overlay ${index}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white text-lg">Upload a video to preview</p>
            </div>
          )}
        </div>

        {videoUrl && playerReady && (
          <CardContent className="px-4 py-0">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 w-12">{formatTime(played * duration)}</span>
                <Slider
                  value={[played]}
                  min={0}
                  max={1}
                  step={0.001}
                  onValueChange={handleSeekChange}
                  onValueCommit={handleSeekMouseUp}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-12 text-right">{formatTime(duration)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => playerRef.current?.seekTo(0)}>
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="icon" onClick={handlePlayPause}>
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button variant="outline" size="icon" onClick={() => playerRef.current?.seekTo(1)}>
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="icon" onClick={handleToggleMute}>
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <Slider
                    value={[muted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
