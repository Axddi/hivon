const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!

export const generateSummary = async (text: string) => {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Summarize this blog in about 200 words:\n${text}` }] }]
        }),
      }
    )
    const data = await res.json()
    console.log("AI RESPONSE:", data)
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary"
  } catch (err) {
    console.error(err)
    return "Summary failed"
  }
}