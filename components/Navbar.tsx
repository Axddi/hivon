"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1
        className="font-bold text-lg cursor-pointer"
        onClick={() => router.push("/")}
      >
        Hivon Blog
      </h1>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm">{user.email}</span>

            <button
              onClick={() => router.push("/create-post")}
              className="bg-green-500 text-white px-3 py-1"
            >
              Create
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-500 text-white px-3 py-1"
          >
            Login
          </button>
        )}
      </div>
    </div>
  )
}