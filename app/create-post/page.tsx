"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { getUserRole } from "@/lib/getUserRole"
import { generateSummary } from "@/lib/ai"

export default function CreatePost() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
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
    if (!title || !body) return alert("Fill all fields")
    if (!user) return alert("User not loaded")

    setLoading(true)

    try {
      const role = await getUserRole()
      console.log("ROLE:", role)

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
    <div className="p-10 flex flex-col gap-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Create Post</h1>

      <input
        placeholder="Title"
        className="border p-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Write your content..."
        className="border p-2 h-40"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white p-2 disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish"}
      </button>
    </div>
  )
}