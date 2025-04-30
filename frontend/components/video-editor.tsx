"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import VideoUpload from "./video-upload"
import Timeline from "./timeline"
import AudioManager from "./audio-manager"
import SubtitleEditor from "./subtitle-editor"
import ImageOverlay from "./image-overlay"
import PreviewRender from "./preview-render"
import Header from "./header"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

export default function VideoEditor() {
  const { videoUrl } = useSelector((state: RootState) => state.video)

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mr-16">
        <div className="lg:col-span-2 flex justify-center">
          {/* Reduced size of PreviewRender and centered */}
          <div className="w-full max-w-[75%]">
            <PreviewRender />
          </div>
        </div>

        <div className="lg:col-span-1">
          {!videoUrl ? (
            <Card>
              <CardContent className="p-6">
                <VideoUpload />
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <Timeline />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audio" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <AudioManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subtitles" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <SubtitleEditor />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <ImageOverlay />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Export Video</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure your export settings and download your edited video.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
