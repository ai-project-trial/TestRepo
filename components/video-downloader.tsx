"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { fetchVideoInfo } from "@/lib/youtube-api"
import { Loader2, Youtube, Search, Info, AlertCircle } from "lucide-react"
import { VideoResult } from "@/components/video-result"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function VideoDownloader() {
  const [url, setUrl] = useState("")
  const [videoInfo, setVideoInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    try {
      setLoading(true)
      setError("")
      const info = await fetchVideoInfo(url)
      setVideoInfo(info)
    } catch (err) {
      setError("Failed to fetch video information. Please check the URL and try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Youtube className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold">Enter YouTube URL</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 pr-4 py-6 text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing
                </>
              ) : (
                "Analyze Video"
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Paste any YouTube URL to download the video, extract audio, get AI-powered summaries, and ask questions
              about the content.
            </p>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400">Analyzing video and preparing features...</p>
        </div>
      )}

      {videoInfo && !loading && <VideoResult videoInfo={videoInfo} />}
    </div>
  )
}

