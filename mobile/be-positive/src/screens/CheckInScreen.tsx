import { useMemo, useRef, useState } from 'react'
import { PanResponder, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native'
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg'
import { useAuth } from '../authContext'
import { useLocale } from '../i18n/LocaleContext'
import { MOOD_ORDER, moodLabel } from '../i18n/content'
import { colors, MOOD_COLORS, radius, shadow } from '../theme'

const SIZE = 300
const CX = 150
const CY = 178
const R = 108
const ARC_LEN = Math.PI * R

function detent(i: number) {
  const a = (Math.PI * i) / 4 + Math.PI
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }
}

interface CheckInScreenProps {
  value: number
  onChange: (value: number) => void
  onContinue: () => void
}

export default function CheckInScreen({ value, onChange, onContinue }: CheckInScreenProps) {
  const [layout, setLayout] = useState({ width: SIZE, height: SIZE })
  const { session } = useAuth()
  const { t, locale } = useLocale()
  const mood = MOOD_ORDER[value]
  const moodColor = MOOD_COLORS[value]
  const name = (session?.user.user_metadata?.full_name as string | undefined)?.trim()

  const updateFromTouch = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent
    const px = (locationX / layout.width) * SIZE
    const py = (locationY / layout.height) * SIZE
    let ang = Math.atan2(py - CY, px - CX)
    if (ang > 0) ang = px < CX ? -Math.PI : 0
    const t2 = (ang + Math.PI) / Math.PI
    onChange(Math.max(0, Math.min(4, Math.round(t2 * 4))))
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: updateFromTouch,
      onPanResponderMove: updateFromTouch,
    })
  ).current

  const knob = useMemo(() => detent(value), [value])

  return (
    <View style={styles.container}>
      <View
        style={[styles.glow, { backgroundColor: `${moodColor}22` }]}
        pointerEvents="none"
      />
      <Text style={styles.greeting}>{name ? t('checkin.greeting', { name }) : t('checkin.greetingNoName')}</Text>
      <Text style={styles.title}>{t('checkin.title')}</Text>

      <View
        style={styles.gaugeWrap}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
        {...panResponder.panHandlers}
      >
        <Svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height={SIZE}>
          <Path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke={colors.border}
            strokeWidth={16}
            strokeLinecap="round"
          />
          <Path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke={moodColor}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={`${(ARC_LEN * value) / 4} ${ARC_LEN}`}
          />
          {MOOD_ORDER.map((_, i) => {
            const p = detent(i)
            return i === value ? null : <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.border} />
          })}
          <Circle cx={knob.x} cy={knob.y} r={26} fill={moodColor} opacity={0.18} />
          <Circle cx={knob.x} cy={knob.y} r={15} fill={moodColor} />
          <Circle cx={knob.x} cy={knob.y} r={15} fill="none" stroke="#ffffff" strokeWidth={2} />
          <SvgText x={CX} y={CY - 2} textAnchor="middle" fontSize={34} fontWeight="700" fill={colors.text}>
            {moodLabel(mood, locale)}
          </SvgText>
          <SvgText x={CX} y={CY + 22} textAnchor="middle" fontSize={12} fill={colors.muted}>
            {value + 1} / 5
          </SvgText>
        </Svg>
      </View>

      <Text style={styles.hint}>{t('checkin.hint')}</Text>

      <View style={styles.buttonRow}>
        <Pressable onPress={onContinue} style={[styles.primaryButton, { backgroundColor: moodColor }]}>
          <Text style={styles.primaryButtonText}>{t('checkin.continue')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  glow: {
    position: 'absolute',
    top: -60,
    left: '10%',
    width: '80%',
    height: 320,
    borderRadius: 999,
  },
  greeting: {
    fontSize: 14,
    color: colors.muted,
  },
  title: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  gaugeWrap: {
    marginTop: 20,
  },
  hint: {
    marginTop: -40,
    textAlign: 'center',
    fontSize: 13,
    color: colors.muted,
  },
  buttonRow: {
    marginTop: 'auto',
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: radius.xl,
    alignItems: 'center',
    ...shadow.card,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
})
