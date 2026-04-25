"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { generateSummary } from "@/lib/ai"

export default function EditPost() {
  const { id } = useParams()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push("/login")
        return
      }

      const { data: roleData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      const role = roleData?.role || "viewer"

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) {
        alert("Post not found")
        router.push("/")
        return
      }

      const canEdit =
        role === "admin" ||
        (role === "author" && data.author_id === userData.user.id)

      if (!canEdit) {
        alert("Only the Author of this post or an Admin can edit it.")
        router.push("/")
        return
      }

      setTitle(data.title)
      setBody(data.body)
      setImageUrl(data.image_url || "")
      setLoading(false)
    }

    if (id) fetchPost()
  }, [id, router])

  const handleUpdate = async () => {
    if (!title.trim() || !body.trim()) {
      return alert("Title and content are required")
    }

    setSaving(true)

    let summary = ""
    try {
      summary = await generateSummary(body)
    } catch {
      summary = "No summary available"
    }

    const { error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        body: body.trim(),
        image_url: imageUrl.trim() || null,
        summary,
      })
      .eq("id", id)

    setSaving(false)

    if (error) {
      console.error(error)
      return alert("Error updating post")
    }

    alert("Post updated!")
    router.push("/")
  }

  if (loading) return <p className="p-10 text-black">Loading...</p>

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto p-10 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-black mb-6">Edit Post</h1>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-200 p-2 w-full rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Featured Image URL</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="border border-gray-200 p-2 w-full rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-400"
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
          <label className="text-sm text-gray-600 mb-1 block">Body Content</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="border border-gray-200 p-2 w-full h-40 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update"}
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
  )
}
