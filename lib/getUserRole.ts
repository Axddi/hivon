import { supabase } from "./supabaseClient"

export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching role:", error.message)
    return null
  }

  return data.role
}