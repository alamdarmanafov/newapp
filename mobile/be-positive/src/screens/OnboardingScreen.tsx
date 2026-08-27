import { useMemo, useRef, useState } from 'react'
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import type { TranslationKey } from '../i18n/translations'
import { radius, shadow, type ColorPalette } from '../theme'
import { useTheme } from '../themeContext'

interface Slide {
  emoji: string
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

const SLIDES: Slide[] = [
  { emoji: '🌤️', titleKey: 'onboarding.slide1Title', bodyKey: 'onboarding.slide1Body' },
  { emoji: '✨', titleKey: 'onboarding.slide2Title', bodyKey: 'onboarding.slide2Body' },
  { emoji: '📈', titleKey: 'onboarding.slide3Title', bodyKey: 'onboarding.slide3Body' },
]

const { width } = Dimensions.get('window')

interface OnboardingScreenProps {
  onFinish: () => void
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const { t } = useLocale()
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
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
      <View style={styles.topRow}>
        <LanguageSwitcher />
        <Pressable onPress={onFinish}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.titleKey}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{t(item.titleKey)}</Text>
            <Text style={styles.body}>{t(item.bodyKey)}</Text>
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
          <Text style={styles.primaryButtonText}>{isLast ? t('onboarding.start') : t('onboarding.next')}</Text>
        </Pressable>
      </View>
    </View>
  )
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      marginBottom: 8,
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
}
