import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { supabase } from './supabaseClient'

const AVATAR_MAX_DIMENSION = 400
const AVATAR_JPEG_QUALITY = 0.6

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const context = ImageManipulator.manipulate(localUri).resize({ width: AVATAR_MAX_DIMENSION })
  const rendered = await context.renderAsync()
  const saved = await rendered.saveAsync({ compress: AVATAR_JPEG_QUALITY, format: SaveFormat.JPEG })

  const response = await fetch(saved.uri)
  const blob = await response.blob()
  const path = `${userId}/avatar.jpg`

  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    upsert: true,
    contentType: 'image/jpeg',
  })
  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}
