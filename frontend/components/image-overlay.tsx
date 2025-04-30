"use client"

import { useState, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { UploadIcon, ImageIcon, Trash2, Move, GripVertical } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/redux/store"
import { addImage, removeImage, updateImage, reorderImages } from "@/redux/features/imagesSlice"
import { useToast } from "@/components/ui/toast"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
} from "react-beautiful-dnd"

export default function ImageOverlay() {
  const { images } = useSelector((state: RootState) => state.images)
  const dispatch = useDispatch()
  const { toast } = useToast()
  const [expandedImages, setExpandedImages] = useState<string[]>([])
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up any pending toasts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const toggleImageExpand = (imageId: string) => {
    setExpandedImages((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file)
      const imageId = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const newImage = {
        id: imageId,
        url: imageUrl,
        name: file.name,
        position: { x: 50, y: 50 },
        size: 30,
        opacity: 1,
        border: false,
        borderColor: "#ffffff",
      }

      dispatch(addImage(newImage))
      setExpandedImages((prev) => [...prev, imageId])

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }

      toastTimeoutRef.current = setTimeout(() => {
        toast({
          title: "Image added",
          description: `${file.name} has been added as an overlay.`,
        })
      }, 100)
    } else {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }

      toastTimeoutRef.current = setTimeout(() => {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        })
      }, 100)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  })

  const handleRemoveImage = (imageId: string) => {
    dispatch(removeImage(imageId))

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Image removed",
        description: "The image overlay has been removed.",
      })
    }, 100)
  }

  const handlePositionChange = (imageId: string, axis: "x" | "y", value: number) => {
    const currentImage = images.find((img) => img.id === imageId)
    if (!currentImage) return

    dispatch(
      updateImage({
        id: imageId,
        changes: {
          position: {
            x: axis === "x" ? value : currentImage.position.x,
            y: axis === "y" ? value : currentImage.position.y,
          },
        },
      }),
    )
  }

  const handleSizeChange = (imageId: string, size: number[]) => {
    dispatch(
      updateImage({
        id: imageId,
        changes: { size: size[0] },
      }),
    )
  }

  const handleOpacityChange = (imageId: string, opacity: number[]) => {
    dispatch(
      updateImage({
        id: imageId,
        changes: { opacity: opacity[0] },
      }),
    )
  }

  const handleBorderToggle = (imageId: string, border: boolean) => {
    dispatch(
      updateImage({
        id: imageId,
        changes: { border },
      }),
    )
  }

  const handleBorderColorChange = (imageId: string, borderColor: string) => {
    dispatch(
      updateImage({
        id: imageId,
        changes: { borderColor },
      }),
    )
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    dispatch(
      reorderImages({
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
      }),
    )

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Image reordered",
        description: "Image overlay order has been updated.",
      })
    }, 100)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Image Overlays</h3>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <UploadIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            {isDragActive ? (
              <p className="font-medium text-primary">Drop your image here</p>
            ) : (
              <p className="font-medium">Drag your image here or click to browse</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supports PNG, JPG, and SVG formats</p>
          </div>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">No image overlays added yet.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" isDropDisabled={false}>
            {(provided: DroppableProvided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {images.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
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

                          <div className="flex-1 font-medium truncate">{image.name}</div>

                          <div className="flex items-center space-x-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => toggleImageExpand(image.id)}>
                              <ImageIcon className="h-4 w-4" />
                            </Button>

                            <Button variant="ghost" size="icon" onClick={() => handleRemoveImage(image.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {expandedImages.includes(image.id) && (
                          <div className="p-3 border-t space-y-3">
                            <div className="flex space-x-4">
                              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center relative">
                                {image.url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={image.url || "/placeholder.svg"}
                                    alt={image.name}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : (
                                  <Image
                                    src="/placeholder.svg?height=96&width=96"
                                    alt={image.name}
                                    fill
                                    sizes="96px"
                                    style={{ objectFit: "contain" }}
                                  />
                                )}
                              </div>

                              <div className="flex-1 space-y-3">
                                <div>
                                  <Label className="flex items-center">
                                    <Move className="h-4 w-4 mr-1" />
                                    Position
                                  </Label>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div>
                                      <Label className="text-xs">X: {image.position.x}%</Label>
                                      <Slider
                                        value={[image.position.x]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) => handlePositionChange(image.id, "x", value[0])}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Y: {image.position.y}%</Label>
                                      <Slider
                                        value={[image.position.y]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) => handlePositionChange(image.id, "y", value[0])}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label>Size: {image.size}%</Label>
                                  <Slider
                                    value={[image.size]}
                                    min={5}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => handleSizeChange(image.id, value)}
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <Label>Opacity: {Math.round(image.opacity * 100)}%</Label>
                                  <Slider
                                    value={[image.opacity]}
                                    min={0.1}
                                    max={1}
                                    step={0.01}
                                    onValueChange={(value) => handleOpacityChange(image.id, value)}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`border-${image.id}`}
                                checked={image.border}
                                onCheckedChange={(checked) => handleBorderToggle(image.id, checked)}
                              />
                              <Label htmlFor={`border-${image.id}`}>Add Border</Label>
                            </div>

                            {image.border && (
                              <div>
                                <Label htmlFor={`border-color-${image.id}`}>Border Color</Label>
                                <div className="flex mt-1">
                                  <Input
                                    id={`border-color-${image.id}`}
                                    type="color"
                                    value={image.borderColor}
                                    onChange={(e) => handleBorderColorChange(image.id, e.target.value)}
                                    className="w-12 p-1 h-9"
                                  />
                                  <Input
                                    value={image.borderColor}
                                    onChange={(e) => handleBorderColorChange(image.id, e.target.value)}
                                    className="flex-1 ml-2"
                                  />
                                </div>
                              </div>
                            )}
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
