"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"

type Comment = {
  id: string
  comment_text: string
  created_at: string
  users: {
    email: string | null
  } | null
}

export default function Comments({
  postId,
  userRole = "viewer",
}: {
  postId: string
  userRole?: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const getUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select(`*, users ( email )`)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    setComments(data || [])
  }, [postId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComments()
    getUser()
  }, [fetchComments])

  const submitComment = async () => {
    if (!text.trim()) return alert("Write something first")
    if (!user) return alert("Please login to comment")

    setLoading(true)

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      comment_text: text.trim(),
    })

    setLoading(false)

    if (error) {
      alert("Error posting comment: " + error.message)
      return
    }

    setText("")
    fetchComments()
  }

  const deleteComment = async (commentId: string) => {
    if (userRole !== "admin") return
    if (!confirm("Delete this comment?")) return

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (error) {
      alert("Error deleting comment: " + error.message)
      return
    }

    setComments((current) => current.filter((comment) => comment.id !== commentId))
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Comments ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-xs text-gray-400 mb-3">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-gray-50 rounded-lg px-3 py-2"
            >
              <div className="flex justify-between items-center mb-1 gap-2">
                <span className="text-xs font-medium text-gray-600">
                  @{c.users?.email?.split("@")[0] || "unknown"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {userRole === "admin" && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700">{c.comment_text}</p>
            </div>
          ))}
        </div>
      )}
      {user ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            placeholder="Write a comment..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
          />
          <button
            onClick={submitComment}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "..." : "Post"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          <a href="/login" className="text-blue-500 underline">Login</a> to comment
        </p>
      )}
    </div>
  )
}
