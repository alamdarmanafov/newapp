import { supabase } from './supabaseClient'

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri)
  const blob = await response.blob()
  const ext = localUri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg'
  const path = `${userId}/avatar.${ext}`

  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    upsert: true,
    contentType: blob.type || 'image/jpeg',
  })
  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}
