import { supabase } from "./supabaseClient"

export const getUserRole = async () => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) return null

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle() 

  if (error) {
    console.error("Role fetch error:", error)
    return null
  }

  return data?.role || "viewer"
}
