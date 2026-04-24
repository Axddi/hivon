import { supabase } from "./supabaseClient"

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error("Error fetching user:", error.message)
    return null
  }

  return data.user
}