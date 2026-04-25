import { supabase } from "./supabaseClient"
import type { User } from "@supabase/supabase-js"

export const createUserIfNotExists = async (user: User) => {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!data) {
    await supabase.from("users").insert({
      id: user.id,
      email: user.email,
      role: "viewer",
    })
  }
}
