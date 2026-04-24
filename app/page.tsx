"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { generateSummary } from "@/lib/ai"

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })

      setPosts(data || [])
    }

    fetchPosts()
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">All Posts</h1>

      <button
        onClick={async () => {
          const res = await generateSummary("This is a test blog about AI.")
          console.log("SUMMARY:", res)
        }}
        className="bg-blue-500 text-white px-4 py-2 mb-4"
      >
        Test AI
      </button>

      {posts.map((post) => (
        <div key={post.id} className="border p-4 mb-4">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p className="text-gray-600">{post.summary}</p>
        </div>
      ))}
    </div>
  )
}