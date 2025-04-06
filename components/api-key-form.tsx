"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Key, Lock } from "lucide-react"

interface ApiKeyFormProps {
  onApiKeySubmit: (apiKey: string) => void
}

export function ApiKeyForm({ onApiKeySubmit }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setError("Please enter your OpenAI API key")
      return
    }

    if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
      setError("Please enter a valid OpenAI API key (starts with 'sk-')")
      return
    }

    setError("")
    onApiKeySubmit(apiKey)
  }

  return (
    <Card className="w-full border-0 shadow-lg">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1"></div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-purple-600" />
          OpenAI API Key Required
        </CardTitle>
        <CardDescription>
          To use AI features like summaries and Q&A, please enter your OpenAI API key. Your key is used only for your
          requests and is not stored on our servers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pl-10 pr-4 py-6 text-base"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Submit API Key
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-slate-600 dark:text-slate-400">
        <p className="mb-2">
          Don't have an OpenAI API key? You can get one from the{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline"
          >
            OpenAI platform
          </a>
          .
        </p>
        <p className="text-xs">
          Your API key is used only in your browser and is never sent to our servers. Standard OpenAI API rates apply to
          all requests.
        </p>
      </CardFooter>
    </Card>
  )
}

