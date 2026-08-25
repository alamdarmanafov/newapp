// Override for local testing: EXPO_PUBLIC_API_BASE_URL=http://<your-ip>:3100 npx expo start
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://alamdarmanafov.com').replace(
  /\/$/,
  ''
)
