import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
  Animated,
  ActivityIndicator,
  Image,
  Vibration,
  Alert,
} from 'react-native';
import { useRouter, usePathname, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import { useFilterStore } from '../src/store/filter-store';
import { useHistoryStore } from '../src/store/history-store';
import { useSettingsStore } from '../src/store/settings-store';
import { useAuthStore } from '../src/store/auth-store';
import { useShakeDetector } from '../src/hooks/use-shake-detector';
import { postShake, getCustomCollections, CustomCollection } from '../src/lib/api';
import { historyApi } from '../src/lib/user-api';

const { width } = Dimensions.get('window');

const playSoundEffect = async (resource: any) => {
  try {
    const { sound } = await Audio.Sound.createAsync(resource);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (err) {
    console.warn('Error playing sound:', err);
  }
};

export default function ShakeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [isFocused, setIsFocused] = useState(false);

  const settings = useSettingsStore();
  const { soundEnabled, setSound, hapticEnabled, language } = settings;
  const isEn = language === 'en';

  const { filters } = useFilterStore();
  const { history, addHistory } = useHistoryStore();
  const { user, accessToken } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [excludeFoodIds, setExcludeFoodIds] = useState<string[]>([]);
  const [includeSystem, setIncludeSystem] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  const fetchCollections = async () => {
    if (!accessToken) {
      setCollections([]);
      return;
    }
    try {
      setCollectionsLoading(true);
      const data = await getCustomCollections(accessToken);
      setCollections(data);
    } catch (err) {
      console.warn('Error fetching custom collections on main screen:', err);
    } finally {
      setCollectionsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      fetchCollections();
      return () => setIsFocused(false);
    }, [accessToken]),
  );

  const handleManualShake = async (isManual = true) => {
    if (loading) return;

    if (accessToken && !includeSystem && selectedCollections.length === 0) {
      Alert.alert(
        isEn ? 'Warning' : 'Chú ý',
        isEn
          ? 'Please select at least one shaking source (System or a custom collection).'
          : 'Vui lòng chọn ít nhất một nguồn lắc (Hệ thống hoặc bộ sưu tập cá nhân).',
      );
      return;
    }

    try {
      setLoading(true);
      if (soundEnabled) {
        await playSoundEffect(require('../assets/sounds/shake.mp3'));
      }

      let res = await postShake({
        sessionId: Date.now().toString(),
        triggerType: isManual ? 'button' : 'shake',
        filters,
        collectionIds: accessToken ? selectedCollections : undefined,
        includeSystem: accessToken ? includeSystem : undefined,
        excludeFoodIds,
      }, accessToken || undefined);

      if (res && res.resetRequired) {
        setExcludeFoodIds([]);
        Alert.alert(
          isEn ? 'Notice' : 'Thông báo',
          isEn
            ? 'All items in this collection have been shaken. Resetting pool!'
            : 'Bạn đã lắc hết tất cả món trong bộ này. Bộ món ăn đã được reset.',
        );

        res = await postShake({
          sessionId: Date.now().toString(),
          triggerType: isManual ? 'button' : 'shake',
          filters,
          collectionIds: accessToken ? selectedCollections : undefined,
          includeSystem: accessToken ? includeSystem : undefined,
          excludeFoodIds: [],
        }, accessToken || undefined);
      }

      // Chờ một khoảng nhỏ để tiếng xúc xắc (shake) vang lên rõ trước khi phát tiếng ting
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (res && res.food) {
        if (hapticEnabled) Vibration.vibrate();
        if (soundEnabled) {
          await playSoundEffect(require('../assets/sounds/ting.mp3'));
        }
        addHistory(res.food);

        // Add to local exclude list
        setExcludeFoodIds((prev) => [...prev, res.food!._id]);

        // Persist history to DB if logged in
        if (accessToken && res.food._id) {
          historyApi.add(
            {
              foodId: res.food._id,
              foodName: res.food.name?.vi || '',
              foodImage: res.food.thumbnailImage ?? res.food.images?.[0],
              priceRange: res.food.priceRange,
              origin: res.food.origin,
            },
            accessToken,
          ).catch(() => {});
        }

        if (pathname === '/') {
          router.push(`/food/${res.food._id}?from=shake`);
        } else {
          router.replace(`/food/${res.food._id}?from=shake`);
        }
      } else {
        if (hapticEnabled) Vibration.vibrate();
        if (soundEnabled) {
          await playSoundEffect(require('../assets/sounds/false.mp3'));
        }
        Alert.alert(
          isEn ? 'Notice' : 'Thông báo',
          isEn
            ? 'No food items found matching your selection.'
            : 'Không tìm thấy món ăn nào phù hợp với bộ lọc/nguồn của bạn.',
        );
      }
    } catch (err) {
      if (hapticEnabled) Vibration.vibrate();
      if (soundEnabled) {
        await playSoundEffect(require('../assets/sounds/false.mp3'));
      }
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useShakeDetector(
    () => {
      handleManualShake(false);
    },
    { enabled: !loading && isFocused },
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Pressable style={styles.avatarPlaceholder} onPress={() => router.push('/profile')}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} />
            ) : (
              <Ionicons name="person" size={24} color="#333" />
            )}
          </Pressable>
          <View>
            <Text style={styles.greeting}>
              {user ? `Xin chào, ${user.name}!` : 'Chào Quý Khách!'}
            </Text>
            <Text style={styles.subtitle}>Bạn cần tìm món gì?</Text>
          </View>
        </View>
        <Pressable onPress={() => setSound(!soundEnabled)} style={styles.iconBtn}>
          <Ionicons name={soundEnabled ? 'volume-high' : 'volume-mute'} size={22} color="#333" />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          placeholder="Tìm món ăn, nhà hàng..."
          style={styles.searchInput}
          placeholderTextColor="#888"
        />
        <Pressable style={styles.filterIco} onPress={() => router.push('/filter')}>
          <Ionicons name="options" size={20} color="#333" />
        </Pressable>
      </View>

      {/* Shaking Sources selection if user is logged in */}
      {accessToken ? (
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceTitle}>
            {isEn ? 'Shaking Sources:' : 'Nguồn lắc món:'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sourceScroll}
          >
            {/* System Foods Pill */}
            <Pressable
              onPress={() => setIncludeSystem(!includeSystem)}
              style={[
                styles.sourcePill,
                includeSystem ? styles.sourcePillActive : styles.sourcePillInactive,
              ]}
            >
              <Ionicons
                name={includeSystem ? 'checkbox' : 'square-outline'}
                size={16}
                color={includeSystem ? '#FFF' : '#666'}
              />
              <Text
                style={[
                  styles.sourcePillText,
                  includeSystem ? styles.sourcePillTextActive : styles.sourcePillTextInactive,
                ]}
              >
                {isEn ? 'System Foods' : 'Món hệ thống'}
              </Text>
            </Pressable>

            {/* Custom Collections Pills */}
            {collections.map((col) => {
              const isSelected = selectedCollections.includes(col._id);
              return (
                <Pressable
                  key={col._id}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedCollections((prev) => prev.filter((id) => id !== col._id));
                    } else {
                      setSelectedCollections((prev) => [...prev, col._id]);
                    }
                  }}
                  style={[
                    styles.sourcePill,
                    isSelected ? styles.sourcePillActive : styles.sourcePillInactive,
                  ]}
                >
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={16}
                    color={isSelected ? '#FFF' : '#666'}
                  />
                  <Text
                    style={[
                      styles.sourcePillText,
                      isSelected ? styles.sourcePillTextActive : styles.sourcePillTextInactive,
                    ]}
                  >
                    {col.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.centerStage}>
        {loading ? (
          <ActivityIndicator size="large" color="#E53935" />
        ) : (
          <Pressable onPress={() => handleManualShake(true)} style={styles.shakeCircle}>
            <Animated.View style={styles.innerCircle}>
              <Ionicons name="restaurant" size={56} color="#FFF" />
            </Animated.View>
          </Pressable>
        )}
        <Text style={styles.shakeTitle}>Lắc để Chọn Món</Text>
        <Text style={styles.shakeHint}>Chạm để cài đặt sở thích</Text>

        <Pressable style={styles.pillBtn} onPress={() => handleManualShake(true)}>
          <Ionicons name="sparkles" size={18} color="#FFF" />
          <Text style={styles.pillText}>Làm Tôi Bất Ngờ</Text>
        </Pressable>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Món ăn gần đây</Text>
          <Pressable onPress={() => router.push('/history')}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.historyScroll}
        >
          {history.slice(0, 10).length > 0 ? (
            history.slice(0, 10).map((item) => (
              <Pressable
                key={item._id}
                style={styles.historyCard}
                onPress={() => router.push(`/food/${item._id}`)}
              >
                {item.thumbnailImage || (item.images && item.images.length > 0) ? (
                  <Image
                    source={{ uri: item.thumbnailImage || item.images?.[0] }}
                    style={styles.historyImgPlaceholder}
                  />
                ) : (
                  <View style={styles.historyImgPlaceholder}>
                    <Ionicons name="fast-food-outline" size={24} color="#AAA" />
                  </View>
                )}
                <Text style={styles.historyName} numberOfLines={1}>
                  {item.name?.vi}
                </Text>
                <Text style={styles.historyMeta} numberOfLines={1}>
                  $ • {item.origin || 'Vietnamese'}
                </Text>
              </Pressable>
            ))
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 20,
              }}
            >
              <Text style={{ color: '#999', fontSize: 14 }}>Chưa xem món nào</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#E53935' },
  greeting: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  iconBtn: {
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  searchWrap: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  filterIco: { padding: 6 },
  centerStage: { flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  shakeCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: width,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  shakeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  shakeHint: { fontSize: 14, color: '#666', marginBottom: 30 },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  pillText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  bottomSection: { paddingBottom: 40 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  seeAll: { fontSize: 14, color: '#E53935', fontWeight: '500' },
  historyScroll: { paddingHorizontal: 20, gap: 16 },
  historyCard: { width: 140 },
  historyImgPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#EAEAEA',
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyName: { fontSize: 15, fontWeight: '500', color: '#333' },
  historyMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  onboardContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEbee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  onboardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  onboardSub: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: '#E53935',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  secondaryBtnText: { color: '#333', fontSize: 16, fontWeight: '500' },
  sourceContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sourceScroll: {
    gap: 10,
    paddingRight: 20,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  sourcePillActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  sourcePillInactive: {
    backgroundColor: '#FFF',
    borderColor: '#EAEAEA',
  },
  sourcePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sourcePillTextActive: {
    color: '#FFF',
  },
  sourcePillTextInactive: {
    color: '#555',
  },
});
