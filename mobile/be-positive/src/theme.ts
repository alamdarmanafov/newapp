export interface ColorPalette {
  primary: string
  primaryDark: string
  primarySoft: string
  accent: string
  background: string
  surface: string
  border: string
  text: string
  muted: string
  danger: string
  flame: string
}

export const lightColors: ColorPalette = {
  primary: '#2F8FE0',
  primaryDark: '#1C6FBB',
  primarySoft: '#EAF4FE',
  accent: '#2F8FE0',
  background: '#ffffff',
  surface: '#F4F9FE',
  border: '#DCEEFB',
  text: '#12233D',
  muted: '#6B7A90',
  danger: '#e5484d',
  flame: '#FF9F45',
}

export const darkColors: ColorPalette = {
  primary: '#2F8FE0',
  primaryDark: '#1C6FBB',
  primarySoft: '#16283f',
  accent: '#2F8FE0',
  background: '#0B1220',
  surface: '#17243a',
  border: '#223252',
  text: '#EAF1FB',
  muted: '#93A3BE',
  danger: '#ff6b6b',
  flame: '#FF9F45',
}

// Default export kept for any spot that isn't theme-aware yet — prefer
// useTheme().colors everywhere a component renders.
export const colors = lightColors

// Mood intensity ramp — muted slate-blue (worst) to vivid blue (best). Kept
// identical across themes so mood data reads consistently either way.
export const MOOD_COLORS = ['#9AACC2', '#7EB8E0', '#5FA8E5', '#3B93E0', '#1C6FBB']

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
}

export const shadow = {
  card: {
    shadowColor: '#2F8FE0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  soft: {
    shadowColor: '#2F8FE0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
}
