"use client"

import Comments from "@/components/Comments"
import { supabase } from "@/lib/supabaseClient"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

type Post = {
  id: string
  title: string
  body: string
  image_url: string | null
  summary: string | null
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [userRole, setUserRole] = useState("viewer")
  const [loading, setLoading] = useState(true)

  const fetchPost = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, image_url, summary")
      .eq("id", id)
      .single()

    setPost(data)
    setLoading(false)
  }, [id])

  const fetchRole = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userData.user.id)
      .single()

    setUserRole(data?.role || "viewer")
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPost()
    fetchRole()
  }, [fetchPost, fetchRole])

  if (loading) return <p className="p-10 text-black">Loading...</p>

  if (!post) {
    return <p className="p-10 text-black">Post not found</p>
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-black mb-4">{post.title}</h1>

        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-5"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = "none"
            }}
          />
        )}

        {post.summary && (
          <div className="border-l-2 border-blue-500 pl-3 bg-blue-50 py-2 rounded-r-md mb-5">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
              AI Summary
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {post.summary}
            </p>
          </div>
        )}

        <p className="text-gray-800 leading-7 whitespace-pre-wrap">{post.body}</p>

        <Comments postId={post.id} userRole={userRole} />
      </article>
    </div>
  )
}
