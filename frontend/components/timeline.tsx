"use client"

import { useState, useEffect, useRef } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  DroppableProvided,
  DraggableProvided,
} from "react-beautiful-dnd"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Scissors, Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/redux/store"
import { addScene, removeScene, reorderScenes, updateScene } from "@/redux/features/timelineSlice"
import { useToast } from "@/components/ui/toast"

export default function Timeline() {
  const { scenes } = useSelector((state: RootState) => state.timeline)
  const { videoUrl, videoDuration } = useSelector((state: RootState) => state.video)
  const dispatch = useDispatch()
  const { toast } = useToast()
  const [expandedScenes, setExpandedScenes] = useState<string[]>([])
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialSceneAddedRef = useRef(false)

  useEffect(() => {
    if (!videoUrl || scenes.length > 0 || initialSceneAddedRef.current) return
    initialSceneAddedRef.current = true

    if (videoDuration > 0) {
      const newScene = {
        id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `Scene 1`,
        startTime: 0,
        endTime: videoDuration,
        thumbnail: `/placeholder.svg?height=80&width=120`,
      }

      dispatch(addScene(newScene))

      toastTimeoutRef.current = setTimeout(() => {
        toast({
          title: "Scene added",
          description: "Initial scene has been added to your timeline.",
        })
      }, 500)
    }

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [videoUrl, videoDuration, scenes.length, dispatch, toast])

  const toggleSceneExpand = (sceneId: string) => {
    setExpandedScenes((prev) =>
      prev.includes(sceneId) ? prev.filter((id) => id !== sceneId) : [...prev, sceneId]
    )
  }

  const handleAddScene = (startTime = 0, endTime = 5) => {
    const newSceneId = `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newScene = {
      id: newSceneId,
      name: `Scene ${scenes.length + 1}`,
      startTime,
      endTime,
      thumbnail: `/placeholder.svg?height=80&width=120`,
    }

    dispatch(addScene(newScene))

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Scene added",
        description: "A new scene has been added to your timeline.",
      })
    }, 100)

    return newSceneId
  }

  const handleRemoveScene = (sceneId: string) => {
    dispatch(removeScene(sceneId))

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Scene removed",
        description: "The scene has been removed from your timeline.",
      })
    }, 100)
  }

  const handleSplitScene = (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId)
    if (!scene) return

    const midpoint = (scene.startTime + scene.endTime) / 2

    dispatch(
      updateScene({
        id: sceneId,
        changes: { endTime: midpoint },
      }),
    )

    const newSceneId = handleAddScene(midpoint, scene.endTime)

    setExpandedScenes((prev) => [...prev, newSceneId])
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    dispatch(
      reorderScenes({
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
      }),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Timeline</h3>
        <Button
          onClick={() =>
            handleAddScene(
              scenes.length > 0 ? scenes[scenes.length - 1].endTime : 0,
              scenes.length > 0 ? scenes[scenes.length - 1].endTime + 5 : 5,
            )
          }
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Scene
        </Button>
      </div>

      {scenes.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No scenes added yet. Add a scene to get started.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="scenes"
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
          >
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {scenes.map((scene, index) => (
                  <Draggable key={scene.id} draggableId={scene.id} index={index} isDragDisabled={false}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-800">
                          <div {...provided.dragHandleProps} className="mr-2">
                            <GripVertical className="h-4 w-4 text-gray-500" />
                          </div>

                          <div className="flex-1 font-medium">{scene.name}</div>

                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => toggleSceneExpand(scene.id)}>
                              {expandedScenes.includes(scene.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>

                            <Button variant="ghost" size="icon" onClick={() => handleRemoveScene(scene.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {expandedScenes.includes(scene.id) && (
                          <div className="p-3 border-t">
                            <div className="flex space-x-4">
                              <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                                <Image
                                  src={scene.thumbnail || "/placeholder.svg?height=80&width=120"}
                                  alt={scene.name}
                                  fill
                                  sizes="96px"
                                  style={{ objectFit: "cover" }}
                                />
                              </div>

                              <div className="flex-1 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Start: {scene.startTime.toFixed(1)}s</span>
                                  <span>End: {scene.endTime.toFixed(1)}s</span>
                                </div>

                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSplitScene(scene.id)}
                                    disabled={scene.endTime - scene.startTime < 1}
                                  >
                                    <Scissors className="h-3 w-3 mr-1" />
                                    Split
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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
