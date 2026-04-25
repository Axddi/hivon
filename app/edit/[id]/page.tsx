"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function EditPost() {
  const { id } = useParams()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
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

      setTitle(data.title)
      setBody(data.body)
      setLoading(false)
    }

    if (id) fetchPost()
  }, [id, router])

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("posts")
      .update({
        title,
        body,
      })
      .eq("id", id)

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
          <label className="text-sm text-gray-600 mb-1 block">Content</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="border border-gray-200 p-2 w-full h-40 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1"
          >
            Update
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