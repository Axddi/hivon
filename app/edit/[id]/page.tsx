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

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <div className="p-10 max-w-xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Edit Post</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="border p-2 h-40"
      />

      <button
        onClick={handleUpdate}
        className="bg-green-500 text-white p-2"
      >
        Update
      </button>
    </div>
  )
}