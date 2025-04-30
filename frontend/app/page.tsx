
// app/page.tsx
import VideoEditor from "@/components/video-editor"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <VideoEditor />
    </main>
  )
}