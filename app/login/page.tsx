"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) return alert(error.message)

    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email,
        role: "viewer", 
      })
    }

    alert("Signup successful!")
  }

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return alert(error.message)

    alert("Login successful!")
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Login / Signup</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-64"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-64"
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-2">
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2">
          Login
        </button>

        <button onClick={handleSignup} className="bg-green-500 text-white px-4 py-2">
          Signup
        </button>
      </div>
    </div>
  )
}