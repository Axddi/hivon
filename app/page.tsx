"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        const { data: userPosts } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })

        setPosts(userPosts || [])
      } else {
        const { data: allPosts } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false })

        setPosts(allPosts || [])
      }

      setLoading(false)
    }

    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <div className="p-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {user ? "My Dashboard" : "All Posts"}
        </h1>

        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600">{post.summary}</p>
          </div>
        ))
      )}

      {user && (
        <button
          onClick={() => router.push("/create-post")}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Post
        </button>
      )}
    </div>
  )
}