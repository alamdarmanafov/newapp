// Supabase project credentials (the publishable/anon key is safe to ship in the
// client — access is enforced by Row Level Security, not by keeping this secret).
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ktnhctzzgzbqhqtdijze.supabase.co'
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_gfqGuF_8eSVNztCIBH6njA_pwN8kHDq'

// AI coach/chat are served as Supabase Edge Functions on the same project.
export const FUNCTIONS_BASE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1`

export const DAILY_CHAT_MESSAGE_LIMIT = 3

// Google OAuth client IDs (from Google Cloud Console -> APIs & Services ->
// Credentials). These are public identifiers, not secrets. TODO: replace the
// placeholders once the credentials exist.
export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ??
  '360468046824-1dp6cc53joq20l1tsh47fabk56eujb3t.apps.googleusercontent.com'
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? 'REPLACE_WITH_GOOGLE_WEB_CLIENT_ID'
