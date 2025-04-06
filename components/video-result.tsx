"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { downloadVideo, downloadAudio, extractSubtitles } from "@/lib/youtube-api"
import { generateVideoSummary, askQuestionAboutVideo } from "@/lib/ai-service"
import { ApiKeyForm } from "@/components/api-key-form"
import {
  Download,
  FileAudio,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  Clock,
  Eye,
  Calendar,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BarChart2,
  Users,
  CheckCircle,
  PieChart,
  ExternalLink,
  Settings,
  Tag,
  Globe,
  FileTextIcon,
  DollarSign,
  Award,
  Key,
} from "lucide-react"

interface VideoResultProps {
  videoInfo: any
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export function VideoResult({ videoInfo }: VideoResultProps) {
  // Download options state
  const [selectedFormat, setSelectedFormat] = useState("mp4")
  const [selectedQuality, setSelectedQuality] = useState("highest")
  const [downloading, setDownloading] = useState(false)
  const [downloadType, setDownloadType] = useState<string | null>(null)

  // API key state
  const [apiKey, setApiKey] = useState<string>("")
  const [showApiKeyForm, setShowApiKeyForm] = useState(true)

  // Summary state
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // Q&A state
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ask me anything about this video! I'll use the video content to answer your questions.",
    },
  ])
  const [questionLoading, setQuestionLoading] = useState(false)

  // Stats tab state
  const [activeStatsTab, setActiveStatsTab] = useState("engagement")

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key)
    setShowApiKeyForm(false)
    // Fetch summary with the new API key
    fetchSummary(key)
  }

  const handleDownload = async (type: string) => {
    setDownloading(true)
    setDownloadType(type)

    try {
      if (type === "video") {
        await downloadVideo(videoInfo.id, selectedFormat, selectedQuality)
      } else if (type === "audio") {
        await downloadAudio(videoInfo.id)
      } else if (type === "subtitles") {
        await extractSubtitles(videoInfo.id)
      }
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setDownloading(false)
      setDownloadType(null)
    }
  }

  const fetchSummary = async (key = apiKey) => {
    if (!key) {
      setShowApiKeyForm(true)
      return
    }

    setSummaryLoading(true)
    setSummaryError(null)

    try {
      const result = await generateVideoSummary(videoInfo.id, videoInfo.transcript, key)
      setSummary(result)
    } catch (err) {
      console.error("Error generating summary:", err)
      setSummaryError("Failed to generate summary. Please check your API key and try again.")
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || questionLoading) return

    if (!apiKey) {
      setShowApiKeyForm(true)
      return
    }

    const userMessage: Message = {
      role: "user",
      content: question,
    }

    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    setQuestionLoading(true)

    try {
      const answer = await askQuestionAboutVideo(videoInfo.id, question, videoInfo.transcript, apiKey)

      const assistantMessage: Message = {
        role: "assistant",
        content: answer,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error asking question:", error)

      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, there was an error processing your question. Please check your API key and try again.",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setQuestionLoading(false)
    }
  }

  useEffect(() => {
    // Don't automatically fetch summary, wait for API key
    if (apiKey) {
      fetchSummary()
    }
  }, [videoInfo.id, apiKey])

  return (
    <div className="space-y-8">
      {/* Video Details Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1"></div>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/5">
              <div className="relative rounded-lg overflow-hidden shadow-md">
                <img
                  src={videoInfo.thumbnail || "/placeholder.svg?height=720&width=1280"}
                  alt={videoInfo.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${videoInfo.id}`, "_blank")}
                  >
                    Watch on YouTube
                  </Button>
                </div>
              </div>

              {/* Channel Info */}
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                    {videoInfo.channel?.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold">{videoInfo.channel?.name || "Channel Name"}</h3>
                      {videoInfo.channel?.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {videoInfo.channel?.subscribers || "1.2M"} subscribers
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => window.open(`https://www.youtube.com/channel/${videoInfo.channel?.id}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Channel
                </Button>
              </div>
            </div>

            <div className="lg:w-3/5">
              <h2 className="text-2xl font-bold mb-3">{videoInfo.title}</h2>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {videoInfo.duration}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {videoInfo.views} views
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {videoInfo.publishDate}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {videoInfo.language || "English"}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> {videoInfo.category || "Education"}
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                  <ThumbsUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <div className="text-sm font-semibold">{videoInfo.likes || "24K"}</div>
                  <div className="text-xs text-slate-500">Likes</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                  <ThumbsDown className="h-5 w-5 mx-auto mb-1 text-red-500" />
                  <div className="text-sm font-semibold">{videoInfo.dislikes || "1.2K"}</div>
                  <div className="text-xs text-slate-500">Dislikes</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                  <MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-sm font-semibold">{videoInfo.comments || "3.4K"}</div>
                  <div className="text-xs text-slate-500">Comments</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center">
                  <Share2 className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <div className="text-sm font-semibold">{videoInfo.shares || "5.7K"}</div>
                  <div className="text-xs text-slate-500">Shares</div>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{videoInfo.description}</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Download Options</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Format</label>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                          <SelectItem value="flv">FLV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Quality</label>
                      <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="highest">Highest</SelectItem>
                          <SelectItem value="1080p">1080p</SelectItem>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="480p">480p</SelectItem>
                          <SelectItem value="360p">360p</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleDownload("video")}
                      disabled={downloading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {downloading && downloadType === "video" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download Video
                    </Button>

                    <Button variant="outline" onClick={() => handleDownload("audio")} disabled={downloading}>
                      {downloading && downloadType === "audio" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileAudio className="mr-2 h-4 w-4" />
                      )}
                      Download MP3
                    </Button>

                    <Button variant="outline" onClick={() => handleDownload("subtitles")} disabled={downloading}>
                      {downloading && downloadType === "subtitles" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="mr-2 h-4 w-4" />
                      )}
                      Extract Subtitles
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Statistics Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Comprehensive Video Statistics</h2>
          </div>

          <Tabs value={activeStatsTab} onValueChange={setActiveStatsTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="monetization">Monetization</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                    Likes & Engagement
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Likes</span>
                        <span className="text-sm font-medium">{videoInfo.likes || "24K"}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Dislikes</span>
                        <span className="text-sm font-medium">{videoInfo.dislikes || "1.2K"}</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Comments</span>
                        <span className="text-sm font-medium">{videoInfo.comments || "3.4K"}</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Shares</span>
                        <span className="text-sm font-medium">{videoInfo.shares || "5.7K"}</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Favorites</span>
                        <span className="text-sm font-medium">{videoInfo.favorites || "8.9K"}</span>
                      </div>
                      <Progress value={55} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Engagement Metrics
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Like-to-View Ratio</span>
                      <Badge variant="outline">{videoInfo.likeViewRatio || "9.8%"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Comment-to-View Ratio</span>
                      <Badge variant="outline">{videoInfo.commentViewRatio || "1.4%"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Like-to-Dislike Ratio</span>
                      <Badge variant="outline">{videoInfo.likeDislikeRatio || "20:1"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Engagement Score</span>
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                        {videoInfo.engagementScore || "8.7/10"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trending Potential</span>
                      <Badge variant="outline" className="bg-yellow-500 text-white">
                        {videoInfo.trendingPotential || "High"}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Engagement Over Time</h4>
                    <div className="h-32 flex items-end gap-1">
                      {[35, 45, 60, 75, 65, 80, 95, 85, 90, 70, 75, 80].map((value, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-sm"
                          style={{ height: `${value}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>First 24h</span>
                      <span>Current</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    Viewership Statistics
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Views</span>
                      <Badge variant="outline">{videoInfo.views || "245,678"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unique Viewers</span>
                      <Badge variant="outline">{videoInfo.uniqueViewers || "198,432"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average View Duration</span>
                      <Badge variant="outline">{videoInfo.avgViewDuration || "8:24"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Audience Retention</span>
                      <Badge variant="outline">{videoInfo.audienceRetention || "64%"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Concurrent Viewers</span>
                      <Badge variant="outline">{videoInfo.peakViewers || "12,345"}</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Audience Retention</h4>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                        style={{ width: `${videoInfo.audienceRetentionPercent || 64}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                      <span>0:00</span>
                      <span>{videoInfo.duration || "15:42"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-green-500" />
                    Traffic Sources
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">YouTube Search</span>
                        <span className="text-sm font-medium">{videoInfo.trafficSources?.search || "35%"}</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Suggested Videos</span>
                        <span className="text-sm font-medium">{videoInfo.trafficSources?.suggested || "28%"}</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">External</span>
                        <span className="text-sm font-medium">{videoInfo.trafficSources?.external || "15%"}</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Channel Pages</span>
                        <span className="text-sm font-medium">{videoInfo.trafficSources?.channel || "12%"}</span>
                      </div>
                      <Progress value={12} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Browse Features</span>
                        <span className="text-sm font-medium">{videoInfo.trafficSources?.browse || "10%"}</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium mb-2">Geographic Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1">
                          <span className="w-3 h-3 bg-purple-600 rounded-full inline-block"></span>
                          United States
                        </span>
                        <span className="text-sm">{videoInfo.geoDistribution?.us || "42%"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1">
                          <span className="w-3 h-3 bg-pink-600 rounded-full inline-block"></span>
                          United Kingdom
                        </span>
                        <span className="text-sm">{videoInfo.geoDistribution?.uk || "15%"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-600 rounded-full inline-block"></span>
                          India
                        </span>
                        <span className="text-sm">{videoInfo.geoDistribution?.india || "12%"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1">
                          <span className="w-3 h-3 bg-green-600 rounded-full inline-block"></span>
                          Canada
                        </span>
                        <span className="text-sm">{videoInfo.geoDistribution?.canada || "8%"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-1">
                          <span className="w-3 h-3 bg-yellow-600 rounded-full inline-block"></span>
                          Other
                        </span>
                        <span className="text-sm">{videoInfo.geoDistribution?.other || "23%"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Settings className="h-5 w-5 text-slate-700" />
                    Video Specifications
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Original Resolution</span>
                      <Badge variant="outline">{videoInfo.originalResolution || "1920x1080"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Frame Rate</span>
                      <Badge variant="outline">{videoInfo.frameRate || "30 fps"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bitrate</span>
                      <Badge variant="outline">{videoInfo.bitrate || "8.5 Mbps"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Audio Quality</span>
                      <Badge variant="outline">{videoInfo.audioQuality || "128 kbps AAC"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">HDR Support</span>
                      <Badge
                        variant={videoInfo.hdrSupport ? "default" : "outline"}
                        className={videoInfo.hdrSupport ? "bg-yellow-500" : ""}
                      >
                        {videoInfo.hdrSupport ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Video Codec</span>
                      <Badge variant="outline">{videoInfo.videoCodec || "H.264"}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Audio Codec</span>
                      <Badge variant="outline">{videoInfo.audioCodec || "AAC"}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5 text-orange-500" />
                    Available Formats & Captions
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium mb-2">Available Resolutions</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        videoInfo.availableResolutions || [
                          "2160p",
                          "1440p",
                          "1080p",
                          "720p",
                          "480p",
                          "360p",
                          "240p",
                          "144p",
                        ]
                      ).map((res, idx) => (
                        <Badge key={idx} variant="outline" className="justify-center">
                          {res}
                        </Badge>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    <h4 className="text-sm font-medium mb-2">Available Formats</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(videoInfo.availableFormats || ["MP4", "WebM", "FLV", "3GP"]).map((format, idx) => (
                        <Badge key={idx} variant="outline" className="justify-center">
                          {format}
                        </Badge>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    <h4 className="text-sm font-medium mb-2">Caption Availability</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Auto-generated</span>
                        <Badge
                          variant={videoInfo.autoGeneratedCaptions ? "default" : "outline"}
                          className={videoInfo.autoGeneratedCaptions ? "bg-green-500" : ""}
                        >
                          {videoInfo.autoGeneratedCaptions ? "Available" : "Not Available"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Creator-provided</span>
                        <Badge
                          variant={videoInfo.creatorCaptions ? "default" : "outline"}
                          className={videoInfo.creatorCaptions ? "bg-green-500" : ""}
                        >
                          {videoInfo.creatorCaptions ? "Available" : "Not Available"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Community-contributed</span>
                        <Badge
                          variant={videoInfo.communityCaptions ? "default" : "outline"}
                          className={videoInfo.communityCaptions ? "bg-green-500" : ""}
                        >
                          {videoInfo.communityCaptions ? "Available" : "Not Available"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Available Languages</span>
                        <Badge variant="outline">{videoInfo.captionLanguages || "12 languages"}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Monetization Tab */}
            <TabsContent value="monetization" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Monetization Status
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monetization Enabled</span>
                      <Badge
                        variant={videoInfo.monetizationEnabled ? "default" : "outline"}
                        className={videoInfo.monetizationEnabled ? "bg-green-500" : ""}
                      >
                        {videoInfo.monetizationEnabled ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Content ID Claims</span>
                      <Badge variant={videoInfo.contentIdClaims ? "destructive" : "outline"}>
                        {videoInfo.contentIdClaims ? "Present" : "None"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Copyright Strikes</span>
                      <Badge variant={videoInfo.copyrightStrikes ? "destructive" : "outline"}>
                        {videoInfo.copyrightStrikes ? "Present" : "None"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Age Restriction</span>
                      <Badge variant={videoInfo.ageRestricted ? "destructive" : "outline"}>
                        {videoInfo.ageRestricted ? "Restricted" : "None"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Advertiser-Friendly</span>
                      <Badge
                        variant={videoInfo.advertiserFriendly ? "default" : "outline"}
                        className={videoInfo.advertiserFriendly ? "bg-green-500" : ""}
                      >
                        {videoInfo.advertiserFriendly ? "Yes" : "Limited"}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium mb-2">Estimated Revenue</h4>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{videoInfo.estimatedRevenue || "$342.78"}</div>
                      <div className="text-sm text-slate-500">Based on views and engagement</div>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CPM</span>
                        <Badge variant="outline">{videoInfo.cpm || "$4.32"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Playback-Based CPM</span>
                        <Badge variant="outline">{videoInfo.playbackCpm || "$3.87"}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Ad Performance
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium mb-2">Ad Types</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Display Ads</span>
                        <Badge
                          variant={videoInfo.adTypes?.display ? "default" : "outline"}
                          className={videoInfo.adTypes?.display ? "bg-green-500" : ""}
                        >
                          {videoInfo.adTypes?.display ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overlay Ads</span>
                        <Badge
                          variant={videoInfo.adTypes?.overlay ? "default" : "outline"}
                          className={videoInfo.adTypes?.overlay ? "bg-green-500" : ""}
                        >
                          {videoInfo.adTypes?.overlay ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Skippable Video Ads</span>
                        <Badge
                          variant={videoInfo.adTypes?.skippableVideo ? "default" : "outline"}
                          className={videoInfo.adTypes?.skippableVideo ? "bg-green-500" : ""}
                        >
                          {videoInfo.adTypes?.skippableVideo ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Non-Skippable Video Ads</span>
                        <Badge
                          variant={videoInfo.adTypes?.nonSkippableVideo ? "default" : "outline"}
                          className={videoInfo.adTypes?.nonSkippableVideo ? "bg-green-500" : ""}
                        >
                          {videoInfo.adTypes?.nonSkippableVideo ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bumper Ads</span>
                        <Badge
                          variant={videoInfo.adTypes?.bumper ? "default" : "outline"}
                          className={videoInfo.adTypes?.bumper ? "bg-green-500" : ""}
                        >
                          {videoInfo.adTypes?.bumper ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sponsored Cards</span>
                        <Badge
                          variant={videoInfo.adTypes?.sponsoredCards ? "default" : "outline"}
                          className={videoInfo.adTypes?.sponsoredCards ? "bg-green-500" : ""}
                        >
                          {videoInfo.adTypes?.sponsoredCards ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium mb-2">Ad Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ad Impressions</span>
                        <Badge variant="outline">{videoInfo.adImpressions || "198,432"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ad CTR</span>
                        <Badge variant="outline">{videoInfo.adCtr || "1.2%"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Ad View Duration</span>
                        <Badge variant="outline">{videoInfo.avgAdViewDuration || "15.4s"}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-500" />
                    Video Tags & Categories
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium mb-2">Video Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {(
                        videoInfo.tags || [
                          "JavaScript",
                          "Programming",
                          "Web Development",
                          "ES6",
                          "Tutorial",
                          "Coding",
                          "Software Development",
                        ]
                      ).map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Primary Category</span>
                        <Badge variant="outline">{videoInfo.primaryCategory || "Education"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Secondary Category</span>
                        <Badge variant="outline">{videoInfo.secondaryCategory || "Science & Technology"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Content Rating</span>
                        <Badge variant="outline">{videoInfo.contentRating || "General Audiences"}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium mb-2">License Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">License Type</span>
                        <Badge variant="outline">{videoInfo.licenseType || "Standard YouTube License"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Creative Commons</span>
                        <Badge
                          variant={videoInfo.creativeCommons ? "default" : "outline"}
                          className={videoInfo.creativeCommons ? "bg-green-500" : ""}
                        >
                          {videoInfo.creativeCommons ? "Yes" : "No"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Reuse Allowed</span>
                        <Badge
                          variant={videoInfo.reuseAllowed ? "default" : "outline"}
                          className={videoInfo.reuseAllowed ? "bg-green-500" : ""}
                        >
                          {videoInfo.reuseAllowed ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    Language & Location
                  </h3>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Video Language</span>
                        <Badge variant="outline">{videoInfo.language || "English"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Audio Languages</span>
                        <Badge variant="outline">{videoInfo.audioLanguages || "English"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Default Caption Language</span>
                        <Badge variant="outline">{videoInfo.defaultCaptionLanguage || "English"}</Badge>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Recording Location</span>
                        <Badge variant="outline">{videoInfo.recordingLocation || "Not specified"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Production Country</span>
                        <Badge variant="outline">{videoInfo.productionCountry || "United States"}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium mb-2">Additional Metadata</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Upload Date</span>
                        <Badge variant="outline">{videoInfo.uploadDate || "2023-05-15"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Modified</span>
                        <Badge variant="outline">{videoInfo.lastModified || "2023-05-16"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Video ID</span>
                        <Badge variant="outline">{videoInfo.id || "dQw4w9WgXcQ"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Privacy Status</span>
                        <Badge variant="outline">{videoInfo.privacyStatus || "Public"}</Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Made for Kids</span>
                        <Badge
                          variant={videoInfo.madeForKids ? "default" : "outline"}
                          className={videoInfo.madeForKids ? "bg-green-500" : ""}
                        >
                          {videoInfo.madeForKids ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Key Form */}
        {showApiKeyForm && (
          <div className="lg:col-span-2">
            <ApiKeyForm onApiKeySubmit={handleApiKeySubmit} />
          </div>
        )}

        {/* AI Summary Card */}
        {!showApiKeyForm && (
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold">AI-Generated Summary</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowApiKeyForm(true)}>
                    <Key className="h-4 w-4 mr-1" />
                    Change API Key
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fetchSummary()} disabled={summaryLoading}>
                    {summaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Regenerate</span>
                  </Button>
                </div>
              </div>

              {summaryLoading && (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mb-2 text-purple-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Analyzing video content and generating summary...
                  </p>
                </div>
              )}

              {summaryError && !summaryLoading && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300">
                  {summaryError}
                </div>
              )}

              {summary && !summaryLoading && (
                <div className="space-y-4">
                  <div className="prose max-w-none text-slate-700 dark:text-slate-300">
                    {summary.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Key Points
                    </h3>
                    <ul className="space-y-2">
                      {videoInfo.keyPoints?.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Q&A Card */}
        {!showApiKeyForm && (
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold">Ask Questions About This Video</h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowApiKeyForm(true)}>
                  <Key className="h-4 w-4 mr-1" />
                  Change API Key
                </Button>
              </div>

              <div className="h-[350px] overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {questionLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg p-3 bg-slate-100 dark:bg-slate-800 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2 text-purple-600" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitQuestion} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about the video..."
                    disabled={questionLoading}
                    className="pr-10"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={questionLoading || !question.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {questionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Features Explanation */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1"></div>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Features Explained</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">Video Download Options</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Download YouTube videos in various formats and quality options:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Choose from MP4, WebM, or FLV formats</li>
                  <li>Select quality from 360p up to 1080p or highest available</li>
                  <li>Download just the audio track in MP3 format</li>
                  <li>Extract subtitles/captions when available</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg">Comprehensive Statistics</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Access detailed statistics about any YouTube video:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Engagement metrics (likes, dislikes, comments, shares)</li>
                  <li>Performance data (views, audience retention, traffic sources)</li>
                  <li>Technical specifications (resolution, frame rate, audio quality)</li>
                  <li>Monetization information (ad types, estimated revenue)</li>
                  <li>Detailed metadata (tags, categories, languages, locations)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">AI-Powered Summary</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Our advanced AI analyzes the video content to provide:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Comprehensive summary of the video content</li>
                  <li>Key points and main takeaways</li>
                  <li>Important concepts covered in the video</li>
                  <li>Option to regenerate the summary if needed</li>
                  <li>Requires your OpenAI API key for processing</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg">Interactive Q&A</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Ask questions about the video content and get AI-powered answers:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Ask specific questions about topics covered in the video</li>
                  <li>Get detailed explanations of concepts mentioned</li>
                  <li>Clarify points you didn't understand</li>
                  <li>The AI uses the video transcript to provide accurate answers</li>
                  <li>Requires your OpenAI API key for processing</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg">API Key Requirements</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Information about the OpenAI API key requirement:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>AI features require your own OpenAI API key</li>
                  <li>Your key is used only in your browser and never stored on our servers</li>
                  <li>Standard OpenAI API rates apply to all requests</li>
                  <li>
                    You can get an API key from the{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      OpenAI platform
                    </a>
                  </li>
                  <li>You can change your API key at any time</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

