import dotenv from "dotenv"
dotenv.config({ path: ".env" })

import { type NextRequest, NextResponse } from "next/server"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

const apiKey = process.env.GROQ_API_KEY
console.log("[v0] Groq API Key loaded:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND")

const groq = createGroq({
  apiKey: apiKey,
})

export async function POST(request: NextRequest) {
  try {
    if (!apiKey) {
      console.log("[v0] Error: GROQ_API_KEY not found in environment variables")
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 })
    }

    const { transcript, image, customPrompt } = await request.json()

    if (!transcript && !image) {
      return NextResponse.json({ error: "Transcript or image is required" }, { status: 400 })
    }


    let prompt: string

    if (image) {
      prompt = `${customPrompt}

I have uploaded a screenshot/image that contains meeting notes, text, or other content. Please analyze this image and extract all readable text content, then provide a well-structured summary based on the instructions above.

Note: This is an image that may contain handwritten notes, typed text, screenshots of documents, or other visual content that needs to be processed and summarized.`
    } else {
      prompt = `${customPrompt}

Meeting Transcript:
${transcript}

Please provide a well-structured summary based on the instructions above.`
    }

    const { text } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      messages: image
        ? [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image", image: image },
              ],
            },
          ]
        : [
            {
              role: "user",
              content: prompt,
            },
          ],
      maxTokens: 1000,
    })

    console.log("[v0] Successfully generated summary")
    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error("[v0] Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
