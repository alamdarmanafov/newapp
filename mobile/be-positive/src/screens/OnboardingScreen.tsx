import { useRef, useState } from 'react'
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native'
import { colors, radius, shadow } from '../theme'

interface Slide {
  emoji: string
  title: string
  body: string
}

const SLIDES: Slide[] = [
  {
    emoji: '🌤️',
    title: 'Əhvalını izlə',
    body: 'Hər gün bir neçə saniyədə əhvalını qeyd et və zamanla necə dəyişdiyini gör.',
  },
  {
    emoji: '✨',
    title: 'AI dəstəyi al',
    body: 'Qeydlərinə əsaslanan fərdi tövsiyələr və istənilən vaxt AI ilə söhbət et.',
  },
  {
    emoji: '📈',
    title: 'İnkişafını gör',
    body: 'Streak, aylıq təqvim və içgörülərlə vərdişini qur, nəyin sənə təsir etdiyini kəşf et.',
  },
]

const { width } = Dimensions.get('window')

interface OnboardingScreenProps {
  onFinish: () => void
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [index, setIndex] = useState(0)
  const listRef = useRef<FlatList<Slide>>(null)
  const isLast = index === SLIDES.length - 1

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width)
    if (next !== index) setIndex(next)
  }

  const handleNext = () => {
    if (isLast) {
      onFinish()
      return
    }
    listRef.current?.scrollToIndex({ index: index + 1 })
  }

  return (
    <View style={styles.root}>
      <Pressable onPress={onFinish} style={styles.skip}>
        <Text style={styles.skipText}>Keç</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <Pressable onPress={handleNext} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{isLast ? 'Başla' : 'İrəli'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  skip: {
    position: 'absolute',
    top: 64,
    right: 24,
    zIndex: 1,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emojiWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    marginTop: 12,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 28,
    paddingBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow.card,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
})
