"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState("viewer")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
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
      setLoading(false)
    }

    getUser()

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        if (!session?.user) {
          setUserRole("viewer")
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) return <div className="flex justify-between items-center p-4 border-b">
    <h1 className="font-bold text-lg">Hivon</h1>
  </div>

  return (
    <div className="flex justify-between items-center p-4 border-b bg-white">
      <h1
        className="font-bold text-lg cursor-pointer text-black"
        onClick={() => router.push("/")}
      >
        Blogs
      </h1>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-700">{user.email}</span>

            {(userRole === "author" || userRole === "admin") && (
              <button
                onClick={() => router.push("/create-post")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                + Post
              </button>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </div>
  )
}
