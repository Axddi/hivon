"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { getCurrentUser } from "@/lib/getUser"
import { useRouter } from "next/navigation"
import { getUserRole } from "@/lib/getUserRole"
import { generateSummary } from "@/lib/ai"

export default function CreatePost() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUser()
      if (!u) return router.push("/login")
      setUser(u)
    }
    fetchUser()
  }, [])

const handleSubmit = async () => {
  if (!title || !body) {
    return alert("Fill all fields")
  }

  if (!user) {
    return alert("User not loaded")
  }
  const role = await getUserRole(user.id)
  console.log("USER ROLE:", role)
  if (role !== "author" && role !== "admin") {
    return alert("You are not allowed to create posts")
  }
  const summary = await generateSummary(body)
  const { error } = await supabase.from("posts").insert({
    title,
    body,
    author_id: user.id,
    summary,
  })

  if (error) {
    console.error(error)
    return alert("Error creating post")
  }

  alert("Post created successfully!")
}


  return (
    <div className="p-10 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Create Post</h1>

      <input
        placeholder="Title"
        className="border p-2"
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Write your content..."
        className="border p-2 h-40"
        onChange={(e) => setBody(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2"
      >
        Publish
      </button>
    </div>
  )
}