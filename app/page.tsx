"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Comments from "@/components/Comments"

export default function Home() {
  const POSTS_PER_PAGE = 5
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [posts, setPosts] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [showMine, setShowMine] = useState(false)
  const [search, setSearch] = useState("")

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)
  const router = useRouter()

  useEffect(() => {
    init()
    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [showMine, page])

  const init = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)

    if (data.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single()
      setUserRole(userData?.role || "viewer")
    }

    await fetchPosts(data.user)
    setLoading(false)
  }

  const fetchPosts = async (currentUser?: any) => {
    const from = (page - 1) * POSTS_PER_PAGE
    const to = from + POSTS_PER_PAGE - 1

    let query = supabase
      .from("posts")
      .select(`*, users ( email, role )`, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)

    if (showMine && currentUser) {
      query = query.eq("author_id", currentUser.id)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
    }

    const { data, count } = await query
    setPosts(data || [])
    setTotalCount(count || 0)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const statsTotal = totalCount
  const statsSummary = posts.filter(
    (p) =>
      p.summary &&
      p.summary !== "Summary failed" &&
      p.summary !== "No summary available"
  ).length
  const statsAuthors = new Set(posts.map((p) => p.author_id)).size

  const getInitials = (email: string) =>
    email?.split("@")[0].slice(0, 2).toUpperCase() || "??"

  const getRoleBadge = (role: string) => {
    if (role === "author") return "bg-green-100 text-green-700"
    if (role === "admin") return "bg-red-100 text-red-700"
    return "bg-gray-100 text-gray-600"
  }

  if (loading) return <p className="p-10 text-black">Loading...</p>

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-6">

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-400 mb-1">Total posts</p>
            <p className="text-2xl font-medium text-blue-700">{statsTotal}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-400 mb-1">With AI summary</p>
            <p className="text-2xl font-medium text-blue-700">{statsSummary}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-400 mb-1">Authors</p>
            <p className="text-2xl font-medium text-blue-700">{statsAuthors}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-xl font-semibold text-black">Hivon Feed</h1>
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={handleSearchChange}
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm w-44 text-black placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
            {user && (
              <>
                <button
                  onClick={() => { setShowMine(false); setPage(1) }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    !showMine
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { setShowMine(true); setPage(1) }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    showMine
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  Mine
                </button>
                <button
                  onClick={() => router.push("/create-post")}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  + Post
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <button
                onClick={() => router.push("/login")}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">
            No posts found
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => {
              const hasSummary =
                post.summary &&
                post.summary !== "Summary failed" &&
                post.summary !== "No summary available"
              const canEdit =
                userRole === "admin" || user?.id === post.author_id
              return (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-xl p-5 bg-white hover:border-blue-200 transition-colors shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                        {getInitials(post.users?.email || "")}
                      </div>
                      <span className="text-sm text-gray-600">
                        @{post.users?.email?.split("@")[0] || "unknown"}
                      </span>
                      {post.users?.role && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadge(
                            post.users.role
                          )}`}
                        >
                          {post.users.role}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-black mb-2 leading-snug">
                    {post.title}
                  </h2>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                      onError={(e: any) => (e.target.style.display = "none")}
                    />
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
                    {post.body}
                  </p>
                  {hasSummary && (
                    <div className="border-l-2 border-blue-500 pl-3 bg-blue-50 py-2 rounded-r-md mb-3">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                        AI Summary
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                  )}
                  {canEdit && (
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                      <button
                        onClick={() => router.push(`/edit/${post.id}`)}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                      >
                        {userRole === "admin" && user?.id !== post.author_id
                          ? "Edit post (admin)"
                          : "Edit post"}
                      </button>
                    </div>
                  )}
                  <Comments postId={post.id} />
                </div>
              )
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg disabled:opacity-40 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg disabled:opacity-40 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  )
}