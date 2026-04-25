"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { createUserIfNotExists } from "@/lib/createUserIfNotExists"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleLogin = async () => {
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) return alert(error.message)

    alert("Signup successful! Now login.")
  }

  return (
    <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Login / Signup</h1>

      <input
        placeholder="Email"
        className="border p-2"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-500 text-white p-2"
        >
          Login
        </button>

        <button
          onClick={handleSignup}
          className="bg-gray-500 text-white p-2"
        >
          Signup
        </button>
      </div>
    </div>
  )
}