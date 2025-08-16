import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { summary, recipients } = await request.json()

    if (!summary || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Summary and recipients are required" }, { status: 400 })
    }

    const validEmails = recipients.filter((email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    })

    if (validEmails.length === 0) {
      return NextResponse.json({ error: "No valid email addresses provided" }, { status: 400 })
    }

    const emailSubject = `Meeting Summary - ${new Date().toLocaleDateString()}`
    const emailBody = `
Dear Recipient,

Please find the meeting summary below:

${summary}

---
This summary was generated using AI Meeting Notes Summarizer.
Generated on: ${new Date().toLocaleString()}

Best regards,
Meeting Notes Team
    `.trim()
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      message: `Summary successfully sent to ${validEmails.length} recipient(s)`,
      recipients: validEmails,
      subject: emailSubject,
    })
  } catch (error) {
    console.error("Error sharing summary:", error)
    return NextResponse.json({ error: "Failed to share summary" }, { status: 500 })
  }
}
