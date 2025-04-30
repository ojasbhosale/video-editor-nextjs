"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Type, Clock, GripVertical } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  addSubtitle,
  removeSubtitle,
  updateSubtitle,
  reorderSubtitles,
} from "@/redux/features/subtitlesSlice";
import { useToast } from "@/components/ui/toast";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";

export default function SubtitleEditor() {
  const { subtitles } = useSelector((state: RootState) => state.subtitles);
  const { videoDuration } = useSelector((state: RootState) => state.video);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [expandedSubtitles, setExpandedSubtitles] = useState<string[]>([]);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const toggleSubtitleExpand = (subtitleId: string) => {
    setExpandedSubtitles((prev) =>
      prev.includes(subtitleId)
        ? prev.filter((id) => id !== subtitleId)
        : [...prev, subtitleId]
    );
  };

  const handleAddSubtitle = () => {
    const newSubtitleId = `subtitle-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newSubtitle = {
      id: newSubtitleId,
      text: "New subtitle text",
      startTime: 0,
      endTime: Math.min(5, videoDuration || 5),
      fontSize: 24,
      color: "#ffffff",
      bold: false,
    };

    dispatch(addSubtitle(newSubtitle));
    setExpandedSubtitles((prev) => [...prev, newSubtitleId]);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Subtitle added",
        description: "A new subtitle has been added.",
      });
    }, 100);
  };

  const handleRemoveSubtitle = (subtitleId: string) => {
    dispatch(removeSubtitle(subtitleId));

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Subtitle removed",
        description: "The subtitle has been removed.",
      });
    }, 100);
  };

  const handleTextChange = (subtitleId: string, text: string) => {
    dispatch(
      updateSubtitle({
        id: subtitleId,
        changes: { text },
      })
    );
  };

  const handleTimeChange = (
    subtitleId: string,
    field: "startTime" | "endTime",
    value: number
  ) => {
    dispatch(
      updateSubtitle({
        id: subtitleId,
        changes: { [field]: value },
      })
    );
  };

  const handleFontSizeChange = (subtitleId: string, fontSize: number[]) => {
    dispatch(
      updateSubtitle({
        id: subtitleId,
        changes: { fontSize: fontSize[0] },
      })
    );
  };

  const handleColorChange = (subtitleId: string, color: string) => {
    dispatch(
      updateSubtitle({
        id: subtitleId,
        changes: { color },
      })
    );
  };

  const handleBoldToggle = (subtitleId: string, bold: boolean) => {
    dispatch(
      updateSubtitle({
        id: subtitleId,
        changes: { bold },
      })
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    dispatch(
      reorderSubtitles({
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
      })
    );

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      toast({
        title: "Subtitle reordered",
        description: "Subtitle order has been updated.",
      });
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Subtitle Editor</h3>
        <Button onClick={handleAddSubtitle} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Subtitle
        </Button>
      </div>

      {subtitles.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No subtitles added yet. Add a subtitle to get started.
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="subtitles"
            isDropDisabled={false as boolean}
            
            isCombineEnabled={false}
            ignoreContainerClipping={true} // 👈 force boolean
          >
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {subtitles.map((subtitle, index) => (
                  <Draggable
                    key={subtitle.id}
                    draggableId={subtitle.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-800">
                          <div {...provided.dragHandleProps} className="mr-2">
                            <GripVertical className="h-4 w-4 text-gray-500" />
                          </div>

                          <div className="flex-1 truncate">
                            {subtitle.text.substring(0, 30)}
                            {subtitle.text.length > 30 && "..."}
                          </div>

                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSubtitleExpand(subtitle.id)}
                            >
                              <Type className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSubtitle(subtitle.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {expandedSubtitles.includes(subtitle.id) && (
                          <div className="p-3 border-t space-y-3">
                            <div>
                              <Label htmlFor={`text-${subtitle.id}`}>Text</Label>
                              <Input
                                id={`text-${subtitle.id}`}
                                value={subtitle.text}
                                onChange={(e) =>
                                  handleTextChange(subtitle.id, e.target.value)
                                }
                                className="mt-1"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Start Time (s)
                                </Label>
                                <Input
                                  type="number"
                                  value={subtitle.startTime}
                                  onChange={(e) =>
                                    handleTimeChange(
                                      subtitle.id,
                                      "startTime",
                                      Number.parseFloat(e.target.value)
                                    )
                                  }
                                  min={0}
                                  step={0.1}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  End Time (s)
                                </Label>
                                <Input
                                  type="number"
                                  value={subtitle.endTime}
                                  onChange={(e) =>
                                    handleTimeChange(
                                      subtitle.id,
                                      "endTime",
                                      Number.parseFloat(e.target.value)
                                    )
                                  }
                                  min={subtitle.startTime}
                                  step={0.1}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Font Size ({subtitle.fontSize}px)</Label>
                              <Slider
                                value={[subtitle.fontSize]}
                                min={12}
                                max={48}
                                step={1}
                                onValueChange={(value) =>
                                  handleFontSizeChange(subtitle.id, value)
                                }
                                className="mt-1"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`color-${subtitle.id}`}>
                                  Color
                                </Label>
                                <div className="flex mt-1">
                                  <Input
                                    id={`color-${subtitle.id}`}
                                    type="color"
                                    value={subtitle.color}
                                    onChange={(e) =>
                                      handleColorChange(
                                        subtitle.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-12 p-1 h-9"
                                  />
                                  <Input
                                    value={subtitle.color}
                                    onChange={(e) =>
                                      handleColorChange(
                                        subtitle.id,
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 ml-2"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`bold-${subtitle.id}`}
                                  checked={subtitle.bold}
                                  onCheckedChange={(checked) =>
                                    handleBoldToggle(subtitle.id, checked)
                                  }
                                />
                                <Label htmlFor={`bold-${subtitle.id}`}>
                                  Bold Text
                                </Label>
                              </div>
                            </div>

                            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                              <p
                                className="text-center"
                                style={{
                                  color: subtitle.color,
                                  fontSize: `${subtitle.fontSize / 2}px`,
                                  fontWeight: subtitle.bold ? "bold" : "normal",
                                }}
                              >
                                {subtitle.text}
                              </p>
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
  );
}
