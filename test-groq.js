import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

async function testGroqAPI() {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY not found in .env.local")
    return
  }

  console.log("✅ API Key loaded:", `${apiKey.substring(0, 10)}...`)

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: "Explain the importance of fast language models",
          },
        ],
        max_tokens: 100,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log("✅ Groq API test successful!")
      console.log("Response:", data.choices[0].message.content)
    } else {
      console.error("❌ API Error:", data)
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message)
  }
}

testGroqAPI()
