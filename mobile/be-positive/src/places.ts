import { MOOD_ORDER } from './i18n/content'
import { supabase } from './supabaseClient'
import type { MoodKey } from './types'

export interface PlaceAggregate {
  gridLat: number
  gridLng: number
  avgMood: number
  count: number
}

export interface MapBounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

export async function submitPlaceMood(mood: MoodKey, category: string, lat: number, lng: number): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'No active session'

  const { error } = await supabase.from('place_moods').insert({
    user_id: user.id,
    mood: MOOD_ORDER.indexOf(mood),
    category,
    lat,
    lng,
  })
  return error?.message ?? null
}

export async function fetchPlaceAggregates(bounds: MapBounds, category: string | null): Promise<PlaceAggregate[]> {
  const { data, error } = await supabase.rpc('place_mood_aggregates', {
    min_lat: bounds.minLat,
    max_lat: bounds.maxLat,
    min_lng: bounds.minLng,
    max_lng: bounds.maxLng,
    p_category: category,
  })
  if (error || !data) return []

  return (data as { grid_lat: number; grid_lng: number; avg_mood: number; entry_count: number }[]).map((row) => ({
    gridLat: row.grid_lat,
    gridLng: row.grid_lng,
    avgMood: row.avg_mood,
    count: row.entry_count,
  }))
}

export interface MyPlaceCategoryStat {
  category: string
  avgMood: number
  count: number
}

// A user's own check-ins, grouped by category, best mood first. Used for
// the personal "where do you feel best" stat in Profile -- unlike the map,
// this reads the user's own rows directly (allowed by RLS for the owner
// only), not the anonymous aggregate function.
export async function fetchMyPlaceCategoryStats(userId: string): Promise<MyPlaceCategoryStat[]> {
  const { data, error } = await supabase.from('place_moods').select('category, mood').eq('user_id', userId)
  if (error || !data) return []

  const byCategory = new Map<string, { sum: number; count: number }>()
  for (const row of data as { category: string; mood: number }[]) {
    const current = byCategory.get(row.category) ?? { sum: 0, count: 0 }
    current.sum += row.mood
    current.count += 1
    byCategory.set(row.category, current)
  }

  return Array.from(byCategory.entries())
    .map(([category, stat]) => ({ category, avgMood: stat.sum / stat.count, count: stat.count }))
    .sort((a, b) => b.avgMood - a.avgMood)
}
