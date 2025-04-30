"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Volume2, Music, Mic, Trash2, GripVertical } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/redux/store"
import { addAudioTrack, removeAudioTrack, updateAudioTrack, reorderAudioTracks } from "@/redux/features/audioSlice"
import { useToast } from "@/components/ui/toast"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
} from "react-beautiful-dnd"

export default function AudioManager() {
  const { audioTracks } = useSelector((state: RootState) => state.audio)
  const dispatch = useDispatch()
  const { toast } = useToast()
  const [uploadingTrack, setUploadingTrack] = useState(false)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up any pending toasts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const handleAddAudioTrack = (type: "music" | "voice") => {
    setUploadingTrack(true)

    // Simulate upload delay
    setTimeout(() => {
      const trackId = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      dispatch(
        addAudioTrack({
          id: trackId,
          name: type === "music" ? "Background Music" : "Voice Over",
          type,
          volume: 0.8,
          muted: false,
          startTime: 0,
          endTime: 30,
          waveform: `/placeholder.svg?height=40&width=300`,
        }),
      )

      setUploadingTrack(false)

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }

      toastTimeoutRef.current = setTimeout(() => {
        toast({
          title: "Audio track added",
          description: `A new ${type === "music" ? "background music" : "voice over"} track has been added.`,
        })
      }, 100)
    }, 1000)
  }

  const handleRemoveAudioTrack = (trackId: string) => {
    dispatch(removeAudioTrack(trackId))

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Audio track removed",
        description: "The audio track has been removed.",
      })
    }, 100)
  }

  const handleVolumeChange = (trackId: string, volume: number[]) => {
    dispatch(
      updateAudioTrack({
        id: trackId,
        changes: { volume: volume[0] },
      }),
    )
  }

  const handleToggleMute = (trackId: string, muted: boolean) => {
    dispatch(
      updateAudioTrack({
        id: trackId,
        changes: { muted },
      }),
    )
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    dispatch(
      reorderAudioTracks({
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
      }),
    )

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Track reordered",
        description: "Audio track order has been updated.",
      })
    }, 100)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Audio Manager</h3>
        <div className="flex space-x-2">
          <Button onClick={() => handleAddAudioTrack("music")} size="sm" disabled={uploadingTrack}>
            <Music className="h-4 w-4 mr-2" />
            Add Music
          </Button>
          <Button onClick={() => handleAddAudioTrack("voice")} size="sm" variant="outline" disabled={uploadingTrack}>
            <Mic className="h-4 w-4 mr-2" />
            Add Voice
          </Button>
        </div>
      </div>

      {audioTracks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No audio tracks added yet. Add music or voice over to get started.
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="audioTracks" isDropDisabled={false}>
            {(provided: DroppableProvided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {audioTracks.map((track, index) => (
                  <Draggable key={track.id} draggableId={track.id} index={index}>
                    {(provided: DraggableProvided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} className="border rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="h-4 w-4 text-gray-500" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                {track.type === "music" ? (
                                  <Music className="h-4 w-4 mr-2 text-blue-500" />
                                ) : (
                                  <Mic className="h-4 w-4 mr-2 text-green-500" />
                                )}
                                <span className="font-medium">{track.name}</span>
                              </div>

                              <Button variant="ghost" size="icon" onClick={() => handleRemoveAudioTrack(track.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>

                            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-2 relative">
                              <Image
                                src={track.waveform || "/placeholder.svg?height=40&width=300"}
                                alt="Audio waveform"
                                fill
                                sizes="(max-width: 768px) 100vw, 300px"
                                style={{ objectFit: "cover" }}
                              />
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Volume2 className="h-4 w-4 text-gray-500" />
                                <Slider
                                  value={[track.muted ? 0 : track.volume]}
                                  min={0}
                                  max={1}
                                  step={0.01}
                                  onValueChange={(value) => handleVolumeChange(track.id, value)}
                                  className="w-24"
                                />
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`mute-${track.id}`}
                                  checked={!track.muted}
                                  onCheckedChange={(checked) => handleToggleMute(track.id, !checked)}
                                />
                                <Label htmlFor={`mute-${track.id}`}>{track.muted ? "Muted" : "Unmuted"}</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}
