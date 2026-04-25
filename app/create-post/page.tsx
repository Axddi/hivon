"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { generateSummary } from "@/lib/ai"
import type { User } from "@supabase/supabase-js"

export default function CreatePost() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [canCreate, setCanCreate] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/login")
        return
      }

      setUser(data.user)

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single()

      const role = userData?.role || "viewer"
      setUserRole(role)
      setCanCreate(role === "author" || role === "admin")
      setLoading(false)
    }
    checkUser()
  }, [router])

  const handleSubmit = async () => {
    if (!canCreate) {
      return alert("Only Authors and Admins can create posts.")
    }

    if (!title || !body) return alert("Title and body are required")
    if (!user) return alert("User not loaded")

    setLoading(true)

    try {
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

  if (loading) return <p className="p-10 text-black">Loading...</p>

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Authors and Admins Only</h1>
          <p className="text-gray-600 mb-6">
            You need an Author or Admin account to create posts. You&apos;re currently a <strong>{userRole}</strong>.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto p-10">
        <h1 className="text-xl font-bold mb-6 text-black">Create Post</h1>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Title *</label>
            <input
              placeholder="Post title"
              className="border border-gray-200 p-2 w-full rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-400"
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
              className="border border-gray-200 p-2 w-full rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-400"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-2 w-full h-48 object-cover rounded-lg border border-gray-200"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Body Content *
            </label>
            <textarea
              placeholder="Write your content..."
              className="border border-gray-200 p-2 w-full h-40 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 flex-1 transition-colors"
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
