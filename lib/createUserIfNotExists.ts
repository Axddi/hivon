import { supabase } from "./supabaseClient"

export const createUserIfNotExists = async (user: any) => {
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