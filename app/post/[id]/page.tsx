"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function PostPage({ params }: any) {
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [])

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .single()

    setPost(data)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", params.id)

    setComments(data || [])
  }

  const addComment = async () => {
    const { data: userData } = await supabase.auth.getUser()

    await supabase.from("comments").insert({
      content: newComment,
      post_id: params.id,
      user_id: userData.user?.id,
    })

    setNewComment("")
    fetchComments()
  }

  return (
    <div className="p-10">
      {post && (
        <>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p>{post.content}</p>
          <p className="text-gray-500 mt-2">{post.summary}</p>
        </>
      )}

      <div className="mt-6">
        <h2 className="font-semibold">Comments</h2>

        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border p-2 w-full"
          placeholder="Write a comment..."
        />

        <button
          onClick={addComment}
          className="bg-blue-500 text-white px-4 py-2 mt-2"
        >
          Add Comment
        </button>

        {comments.map((c) => (
          <div key={c.id} className="border p-2 mt-2">
            {c.content}
          </div>
        ))}
      </div>
    </div>
  )
}