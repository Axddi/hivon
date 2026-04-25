export const generateSummary = async (text: string) => {
  if (!text || text.trim().length === 0) return "No content to summarize"

  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY

    if (!apiKey) {
      throw new Error("Missing NEXT_PUBLIC_GROQ_API_KEY")
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You summarize blog posts clearly and neutrally. Return only the summary.",
          },
          {
            role: "user",
            content: `Summarize this blog post in about 200 words:\n\n${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 350,
      }),
    })

    if (!response.ok) {
      throw new Error("Summary request failed")
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string
        }
      }>
    }
    const summary = data.choices?.[0]?.message?.content?.trim()
    return summary || "No summary"
  } catch (err) {
    console.error(err)
    return "Summary failed"
  }
}
