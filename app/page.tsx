import { VideoDownloader } from "@/components/video-downloader"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-10 px-4">
        <header className="text-center mb-10 relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            YouTube Downloader & AI Assistant
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Download videos in multiple formats, extract audio, get AI-powered summaries, and ask questions about any
            YouTube content.
          </p>
        </header>
        <VideoDownloader />
      </div>
    </main>
  )
}

