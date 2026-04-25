"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { createUserIfNotExists } from "@/lib/createUserIfNotExists"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"author" | "viewer" | "admin">("viewer")

  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) return alert("Fill all fields")
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await createUserIfNotExists(data.user)
    }

    setLoading(false)
    router.push("/")
  }

  const handleSignup = async () => {
    if (!email || !password) return alert("Fill all fields")
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        role: selectedRole,
      })
    }

    setLoading(false)
    alert("Signup successful! Please login.")
    setIsSignup(false)
    setEmail("")
    setPassword("")
    setSelectedRole("viewer")
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-xl shadow-sm bg-white">

        <h1 className="text-2xl font-semibold text-black mb-1">
          {isSignup ? "Create account" : "Welcome back"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isSignup
            ? "Sign up to start on Hivon"
            : "Login to your Hivon account"}
        </p>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-200 p-2.5 w-full rounded-lg text-black text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (isSignup ? handleSignup() : handleLogin())}
              className="border border-gray-200 p-2.5 w-full rounded-lg text-black text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          {isSignup && (
            <div>
              <label className="text-sm text-gray-600 mb-2 block">I want to:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("author")}
                  className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    selectedRole === "author"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Author
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("viewer")}
                  className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    selectedRole === "viewer"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Viewer
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    selectedRole === "admin"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Admin
                </button>
              </div>
              {selectedRole === "author" && (
                <p className="text-xs text-gray-500 mt-2">Create posts, edit your posts, and view comments on them.</p>
              )}
              {selectedRole === "viewer" && (
                <p className="text-xs text-gray-500 mt-2">Read posts, summaries, and add comments.</p>
              )}
              {selectedRole === "admin" && (
                <p className="text-xs text-gray-500 mt-2">View all posts, edit any post, and monitor comments.</p>
              )}
            </div>
          )}

          {isSignup ? (
            <button
              onClick={handleSignup}
              disabled={loading}
              className="bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors mt-1"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          )}
        </div>

        <p className="text-sm text-center text-gray-500 mt-4">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignup(!isSignup)
              setEmail("")
              setPassword("")
              setSelectedRole("viewer")
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  )
}
