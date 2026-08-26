import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import MapView, { Circle, type Region } from 'react-native-maps'
import * as Location from 'expo-location'
import PlaceMoodModal from '../components/PlaceMoodModal'
import { useLocale } from '../i18n/LocaleContext'
import { fetchPlaceAggregates, submitPlaceMood, type PlaceAggregate } from '../places'
import { colors, MOOD_COLORS, radius, shadow } from '../theme'
import type { MoodKey } from '../types'

const DEFAULT_DELTA = 0.03

export default function PlacesScreen() {
  const { t } = useLocale()
  const [region, setRegion] = useState<Region | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [aggregates, setAggregates] = useState<PlaceAggregate[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setPermissionDenied(true)
        return
      }
      const position = await Location.getCurrentPositionAsync({})
      setRegion({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: DEFAULT_DELTA,
        longitudeDelta: DEFAULT_DELTA,
      })
    })()
  }, [])

  const loadAggregates = useCallback((r: Region) => {
    fetchPlaceAggregates({
      minLat: r.latitude - r.latitudeDelta / 2,
      maxLat: r.latitude + r.latitudeDelta / 2,
      minLng: r.longitude - r.longitudeDelta / 2,
      maxLng: r.longitude + r.longitudeDelta / 2,
    }).then(setAggregates)
  }, [])

  useEffect(() => {
    if (region) loadAggregates(region)
  }, [region, loadAggregates])

  const handleRegionChangeComplete = (r: Region) => {
    setRegion(r)
    if (fetchTimer.current) clearTimeout(fetchTimer.current)
    fetchTimer.current = setTimeout(() => loadAggregates(r), 400)
  }

  const handleSubmitMood = async (mood: MoodKey) => {
    setSubmitting(true)
    try {
      const position = await Location.getCurrentPositionAsync({})
      const message = await submitPlaceMood(mood, position.coords.latitude, position.coords.longitude)
      if (message) {
        Alert.alert(t('places.errorTitle'), message)
      } else {
        setPickerOpen(false)
        if (region) loadAggregates(region)
      }
    } catch {
      Alert.alert(t('places.errorTitle'), t('places.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  if (permissionDenied) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerEmoji}>🗺️</Text>
        <Text style={styles.centerTitle}>{t('places.permissionTitle')}</Text>
        <Text style={styles.centerBody}>{t('places.permissionBody')}</Text>
        <Pressable style={styles.settingsButton} onPress={() => Linking.openSettings()}>
          <Text style={styles.settingsButtonText}>{t('places.openSettings')}</Text>
        </Pressable>
      </View>
    )
  }

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('places.title')}</Text>
        <Text style={styles.subtitle}>{t('places.subtitle')}</Text>
      </View>

      <MapView style={styles.map} initialRegion={region} onRegionChangeComplete={handleRegionChangeComplete} showsUserLocation>
        {aggregates.map((agg) => (
          <Circle
            key={`${agg.gridLat}-${agg.gridLng}`}
            center={{ latitude: agg.gridLat, longitude: agg.gridLng }}
            radius={90}
            fillColor={`${MOOD_COLORS[Math.round(agg.avgMood)]}99`}
            strokeWidth={0}
          />
        ))}
      </MapView>

      {aggregates.length === 0 && (
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyBannerText}>{t('places.empty')}</Text>
        </View>
      )}

      <Pressable style={styles.addButton} onPress={() => setPickerOpen(true)}>
        <Text style={styles.addButtonText}>{t('places.addButton')}</Text>
      </Pressable>

      <PlaceMoodModal
        visible={pickerOpen}
        submitting={submitting}
        onSubmit={handleSubmitMood}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12.5,
    color: colors.muted,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  centerEmoji: {
    fontSize: 44,
    marginBottom: 16,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  centerBody: {
    marginTop: 8,
    fontSize: 13.5,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
  settingsButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    ...shadow.soft,
  },
  settingsButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14.5,
  },
  emptyBanner: {
    position: 'absolute',
    top: 88,
    left: 20,
    right: 20,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    ...shadow.soft,
  },
  emptyBannerText: {
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    ...shadow.card,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
})
