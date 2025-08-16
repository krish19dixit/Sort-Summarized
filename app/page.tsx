"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Wand2, ImageIcon, Download, Mail } from "lucide-react"

export default function MeetingNotesSummarizer() {
  const [transcript, setTranscript] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [showSummary, setShowSummary] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setTranscript(content)
        setUploadedImage(null)
      }
      reader.readAsText(file)
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        setUploadedImage(imageDataUrl)
        setTranscript("") // Clear text transcript when image is uploaded
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateSummary = async () => {
    if (!transcript.trim() && !uploadedImage) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          image: uploadedImage,
          customPrompt: customPrompt || "Summarize the following meeting transcript in a clear and organized manner.",
        }),
      })

      const data = await response.json()
      setSummary(data.summary)
      setShowSummary(true)
    } catch (error) {
      console.error("Error generating summary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 dark">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">AI Meeting Notes Summarizer</h1>
          <p className="text-muted-foreground">
            Upload transcripts, screenshots, add custom instructions, and generate AI-powered summaries
          </p>
        </div>

        {!showSummary ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Content
                </CardTitle>
                <CardDescription>Upload a text file, screenshot, or paste your meeting transcript</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,image/*"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>

                {uploadedImage && (
                  <div className="space-y-2">
                    <Label>Uploaded Screenshot:</Label>
                    <div className="border rounded-lg p-2 bg-muted">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded screenshot"
                        className="max-w-full h-auto max-h-48 rounded"
                      />
                    </div>
                  </div>
                )}

                <div className="text-center text-muted-foreground">or</div>
                <div>
                  <Label htmlFor="transcript">Paste Transcript</Label>
                  <Textarea
                    id="transcript"
                    placeholder="Paste your meeting transcript here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="min-h-[200px] mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Instructions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Custom Instructions
                </CardTitle>
                <CardDescription>Specify how you want the AI to summarize your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-prompt">Instructions (Optional)</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="e.g., 'Summarize in bullet points for executives' or 'Extract and list all action items with responsible parties'"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[100px] mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick Templates:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomPrompt("Summarize in bullet points for executives")}
                    >
                      Executive Summary
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomPrompt("Extract and list all action items with responsible parties")}
                    >
                      Action Items
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomPrompt("Extract all text content and organize it clearly")}
                    >
                      Extract Text
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <SummaryEditor summary={summary} setSummary={setSummary} onBack={() => setShowSummary(false)} />
        )}

        {/* Generate Button */}
        {!showSummary && (
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateSummary}
              disabled={(!transcript.trim() && !uploadedImage) || isLoading}
              size="lg"
              className="min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  {uploadedImage ? <ImageIcon className="h-4 w-4 mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Summary Editor Component
function SummaryEditor({
  summary,
  setSummary,
  onBack,
}: {
  summary: string
  setSummary: (summary: string) => void
  onBack: () => void
}) {
  const [emailRecipients, setEmailRecipients] = useState("")
  const [isSharing, setIsSharing] = useState(false)

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([summary], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `meeting-summary-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleShare = async () => {
    if (!emailRecipients.trim()) return

    setIsSharing(true)
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary,
          recipients: emailRecipients.split(",").map((email) => email.trim()),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Summary shared successfully!")
        setEmailRecipients("")
      } else {
        alert(data.error || "Failed to share summary")
      }
    } catch (error) {
      console.error("Error sharing summary:", error)
      alert("Failed to share summary")
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Generated Summary</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={onBack}>
            Back to Upload
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Summary</CardTitle>
          <CardDescription>Review and edit the AI-generated summary before sharing</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="min-h-[300px]"
            placeholder="Your summary will appear here..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share Summary
          </CardTitle>
          <CardDescription>Enter email addresses to share this summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipients">Email Recipients</Label>
            <Input
              id="recipients"
              placeholder="email1@example.com, email2@example.com"
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Separate multiple email addresses with commas</p>
          </div>
          <Button onClick={handleShare} disabled={!emailRecipients.trim() || isSharing} className="w-full">
            {isSharing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Share Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
