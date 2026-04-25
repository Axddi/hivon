import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!

export const generateSummary = async (text: string) => {
  if (!text || text.trim().length === 0) return "No content to summarize"
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })

    const result = await model.generateContent(
      `Summarize this blog in about 200 words:\n${text}`
    )

    const summary = result.response.text()
    console.log("AI RESPONSE:", summary)
    return summary || "No summary"
  } catch (err) {
    console.error(err)
    return "Summary failed"
  }
}