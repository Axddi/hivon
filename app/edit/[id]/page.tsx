"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { getUserRole } from "@/lib/getUserRole"

export default function EditPost({ params }: any) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [post, setPost] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPost()
  }, [])

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single()

    if (!data) {
      alert("Post not found")
      router.push("/")
      return
    }

    setPost(data)
    setTitle(data.title)
    setContent(data.content)
  }

  const updatePost = async () => {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      alert("Login required")
      return
    }

    const role = await getUserRole(userData.user.id)

    // 🔒 PERMISSION CHECK
    if (
      role !== "admin" &&
      !(role === "author" && post.author_id === userData.user.id)
    ) {
      alert("Not allowed to edit this post")
      return
    }

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        content,
      })
      .eq("id", params.id)

    if (error) {
      alert("Error updating post")
      return
    }

    alert("Post updated!")
    router.push("/")
  }

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Edit Post</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 w-full h-40"
      />

      <button
        onClick={updatePost}
        className="bg-green-500 text-white px-4 py-2 mt-2"
      >
        Update
      </button>
    </div>
  )
}