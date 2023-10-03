import type { SupabaseClient } from '@supabase/supabase-js'

export async function downloadImage(supabase: SupabaseClient, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .download(path)

    if (error) throw error

    const url = URL.createObjectURL(data)
    return url
  } catch (error) {
    if (error instanceof Error)
      console.error('Error downloading image: ', error.message)

    return null
  }
}

export function getInitials(email: string, fullName?: string | null) {
  if (!fullName) return email?.charAt(0) ?? ''
  const names = fullName.split(' ')
  if (names.length === 1) return `${names[0][0]}`
  else if (names.length > 1) return `${names[0][0]}${names[1][0]}`
  else return email?.charAt(0) ?? ''
}
