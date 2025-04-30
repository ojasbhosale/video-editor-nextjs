"use client"

import { useCallback, useState, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { UploadIcon, FileVideoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/toast"
import { useDispatch } from "react-redux"
import { setVideo } from "@/redux/features/videoSlice"

export default function VideoUpload() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const dispatch = useDispatch()
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const processVideoFile = useCallback(
    (file: File) => {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }

      setIsUploading(true)
      setUploadProgress(0)

      // Create a URL for the video file
      const videoUrl = URL.createObjectURL(file)

      // Create video element to get metadata
      if (!videoRef.current) {
        videoRef.current = document.createElement("video")
      }

      const video = videoRef.current
      video.preload = "metadata"

      // Set up progress simulation
      progressIntervalRef.current = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            return prev // Hold at 90% until video metadata is loaded
          }
          return prev + 10
        })
      }, 300)

      // Handle successful metadata loading
      video.onloadedmetadata = () => {
        // Complete the progress
        setUploadProgress(100)

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        // Add video to Redux store with actual duration
        dispatch(
          setVideo({
            url: videoUrl,
            name: file.name,
            duration: video.duration,
            size: file.size,
          }),
        )

        setIsUploading(false)

        toast({
          title: "Upload complete",
          description: `${file.name} has been uploaded successfully.`,
        })
      }

      // Handle errors
      video.onerror = () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        setIsUploading(false)
        setUploadProgress(0)

        toast({
          title: "Upload failed",
          description: "There was a problem loading the video.",
          variant: "destructive",
        })

        // Clean up the object URL
        URL.revokeObjectURL(videoUrl)
      }

      // Set the source to trigger loading
      video.src = videoUrl
    },
    [dispatch, toast],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]

      if (file && file.type.startsWith("video/")) {
        processVideoFile(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file.",
          variant: "destructive",
        })
      }
    },
    [toast, processVideoFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Upload Video</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop your video file or click to browse</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            {isUploading ? (
              <FileVideoIcon className="h-10 w-10 text-primary" />
            ) : (
              <UploadIcon className="h-10 w-10 text-primary" />
            )}
          </div>
          <div>
            {isDragActive ? (
              <p className="font-medium text-primary">Drop your video here</p>
            ) : (
              <p className="font-medium">Drag your video here or click to browse</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supports MP4, WebM, and MOV formats</p>
          </div>
          {!isUploading && (
            <Button variant="outline" size="sm">
              Select Video
            </Button>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  )
}
