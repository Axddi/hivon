"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { getUserRole } from "@/lib/getUserRole"
import { generateSummary } from "@/lib/ai"

export default function CreatePost() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    }
    checkUser()
  }, [router])

  const handleSubmit = async () => {
    if (!title || !body) return alert("Title and body are required")
    if (!user) return alert("User not loaded")

    setLoading(true)

    try {
      const role = await getUserRole()

      if (role !== "author" && role !== "admin") {
        setLoading(false)
        return alert("You are not allowed to create posts")
      }

      let summary = ""
      try {
        summary = await generateSummary(body)
      } catch {
        summary = "No summary available"
      }

      const { error } = await supabase.from("posts").insert([
        {
          title,
          body,
          image_url: imageUrl || null,
          author_id: user.id,
          summary,
        },
      ])

      if (error) {
        console.error(error)
        setLoading(false)
        return alert(error.message)
      }

      alert("Post created successfully!")
      router.push("/")
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-xl font-bold mb-6">Create Post</h1>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Title *</label>
          <input
            placeholder="Post title"
            className="border border-gray-200 p-2 w-full rounded-lg focus:outline-none focus:border-gray-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Featured Image URL
          </label>
          <input
            placeholder="https://example.com/image.jpg"
            className="border border-gray-200 p-2 w-full rounded-lg focus:outline-none focus:border-gray-400"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-2 w-full h-48 object-cover rounded-lg border border-gray-200"
              onError={(e: any) => (e.target.style.display = "none")}
            />
          )}
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Body Content *
          </label>
          <textarea
            placeholder="Write your content..."
            className="border border-gray-200 p-2 w-full h-40 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-700 text-green-100 px-4 py-2 rounded-lg font-medium disabled:opacity-50 flex-1"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
          <button
            onClick={() => router.push("/")}
            className="border border-gray-200 px-4 py-2 rounded-lg text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}