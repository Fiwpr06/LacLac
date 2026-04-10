import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch,
  Vibration,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

import { useFilterStore } from '../src/store/filter-store';
import { useSettingsStore } from '../src/store/settings-store';

const playSoundEffect = async (resource: any) => {
  try {
    const { sound } = await Audio.Sound.createAsync(resource);
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
    await sound.playAsync();
  } catch (err) {}
};

export default function ProfileScreen() {
  const router = useRouter();
  const { filters } = useFilterStore();
  const settings = useSettingsStore();

  const [toggles, setToggles] = useState({
    notifications: false,
    emails: false,
    largerText: false,
    disableConfetti: false,
  });

  const updateToggle = (key: keyof typeof toggles, val: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: val }));
  };

  const isEn = settings.language === 'en';
  const t = {
    title: isEn ? 'Settings' : 'Cài đặt',
    dietary: isEn ? 'Dietary Preferences' : 'Sở thích Ăn uống',
    vegetarian: isEn ? 'Vegetarian' : 'Ăn Chay',
    vegan: isEn ? 'Vegan' : 'Thuần Chay',
    healthy: isEn ? 'Healthy' : 'Tốt cho Sức Khỏe',
    notifications: isEn ? 'Notifications' : 'Thông báo',
    push: isEn ? 'Push Notifications' : 'Thông Báo Đẩy',
    email: isEn ? 'Email Updates' : 'Cập Nhật Qua Email',
    system: isEn ? 'System & Effects' : 'Hệ thống & Hiệu ứng',
    haptic: isEn ? 'Haptic Feedback' : 'Rung Phản Hồi',
    sound: isEn ? 'App Sounds' : 'Âm Thanh Ứng Dụng',
    testHaptic: isEn ? 'Test Haptic' : 'Thử Rung',
    testSound: isEn ? 'Test Sound' : 'Thử Âm thanh',
    general: isEn ? 'General Settings' : 'Cài Đặt Chung',
    language: isEn ? 'English Interface' : 'Giao diện Tiếng Anh',
    accessibility: isEn ? 'Accessibility' : 'Trợ Năng',
    largeText: isEn ? 'Larger Text' : 'Chữ Lớn Hơn',
    reduceMotion: isEn ? 'Reduce Motion' : 'Giảm Chuyển Động',
    disableConfetti: isEn ? 'Disable Confetti' : 'Tắt Pháo Hoa',
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Lọc Cá Nhân (Tích hợp state từ Home Screen) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.dietary}</Text>
          <View style={styles.tagsContainer}>
            <View
              style={[styles.filterTag, filters.dietTag === 'vegetarian' && styles.filterTagActive]}
            >
              <Ionicons
                name="leaf-outline"
                size={16}
                color={filters.dietTag === 'vegetarian' ? '#E53935' : '#666'}
                style={styles.tagIcon}
              />
              <Text
                style={[
                  styles.filterTagText,
                  filters.dietTag === 'vegetarian' && styles.filterTagTextActive,
                ]}
              >
                {t.vegetarian}
              </Text>
            </View>
            <View style={[styles.filterTag, filters.dietTag === 'vegan' && styles.filterTagActive]}>
              <Ionicons
                name="nutrition-outline"
                size={16}
                color={filters.dietTag === 'vegan' ? '#E53935' : '#666'}
                style={styles.tagIcon}
              />
              <Text
                style={[
                  styles.filterTagText,
                  filters.dietTag === 'vegan' && styles.filterTagTextActive,
                ]}
              >
                {t.vegan}
              </Text>
            </View>
            <View
              style={[styles.filterTag, filters.dietTag === 'healthy' && styles.filterTagActive]}
            >
              <Ionicons
                name="fitness-outline"
                size={16}
                color={filters.dietTag === 'healthy' ? '#E53935' : '#666'}
                style={styles.tagIcon}
              />
              <Text
                style={[
                  styles.filterTagText,
                  filters.dietTag === 'healthy' && styles.filterTagTextActive,
                ]}
              >
                {t.healthy}
              </Text>
            </View>
          </View>
          <Text style={styles.cardNote}>
            *{' '}
            {isEn
              ? 'Change these properties in the filter menu on the home page.'
              : 'Bạn có thể thay đổi các thuộc tính này ở menu bộ lọc của trang chủ.'}
          </Text>
        </View>

        {/* Cài đặt Thông báo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.notifications}</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.push}</Text>
            <Switch
              value={toggles.notifications}
              onValueChange={(v) => updateToggle('notifications', v)}
              trackColor={{ true: '#F8D7DA', false: '#F0F0F0' }}
              thumbColor={toggles.notifications ? '#E53935' : '#FFF'}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.email}</Text>
            <Switch
              value={toggles.emails}
              onValueChange={(v) => updateToggle('emails', v)}
              trackColor={{ true: '#F8D7DA', false: '#F0F0F0' }}
              thumbColor={toggles.emails ? '#E53935' : '#FFF'}
            />
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.general}</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.language}</Text>
            <Switch
              value={settings.language === 'en'}
              onValueChange={(v) => settings.setLanguage(v ? 'en' : 'vi')}
              trackColor={{ true: '#F8D7DA', false: '#F0F0F0' }}
              thumbColor={settings.language === 'en' ? '#E53935' : '#FFF'}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.haptic}</Text>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={settings.setHaptic}
              trackColor={{ true: '#F8D7DA', false: '#F0F0F0' }}
              thumbColor={settings.hapticEnabled ? '#E53935' : '#FFF'}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.sound}</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={settings.setSound}
              trackColor={{ true: '#F8D7DA', false: '#F0F0F0' }}
              thumbColor={settings.soundEnabled ? '#E53935' : '#FFF'}
            />
          </View>
          <View style={styles.actionRow}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => settings.hapticEnabled && Vibration.vibrate(100)}
            >
              <Text style={styles.secondaryBtnText}>{t.testHaptic}</Text>
            </Pressable>
            <Pressable
              style={styles.primaryBtn}
              onPress={() =>
                settings.soundEnabled && playSoundEffect(require('../assets/sounds/ting.mp3'))
              }
            >
              <Text style={styles.primaryBtnText}>{t.testSound}</Text>
            </Pressable>
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.accessibility}</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.largeText}</Text>
            <Switch
              value={toggles.largerText}
              onValueChange={(v) => updateToggle('largerText', v)}
              trackColor={{ true: '#F8D7DA', false: '#F0F0F0' }}
              thumbColor={toggles.largerText ? '#E53935' : '#FFF'}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.reduceMotion}</Text>
            <Switch
              value={settings.reduceMotion}
              onValueChange={settings.setReduceMotion}
              trackColor={{ true: '#F8D7DA', false: '#F0F0F0' }}
              thumbColor={settings.reduceMotion ? '#E53935' : '#FFF'}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.disableConfetti}</Text>
            <Switch
              value={toggles.disableConfetti}
              onValueChange={(v) => updateToggle('disableConfetti', v)}
              trackColor={{ true: '#F8D7DA', false: '#F0F0F0' }}
              thumbColor={toggles.disableConfetti ? '#E53935' : '#FFF'}
            />
          </View>
        </View>

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>Lắc Lắc v1.0.0 (Alpha)</Text>
          <Text style={styles.companyText}>© 2024 Lắc Lắc Team</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  cardNote: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterTagActive: {
    backgroundColor: '#FFF0F1',
    borderColor: '#FFCDD2',
  },
  tagIcon: {
    marginRight: 6,
  },
  filterTagText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTagTextActive: {
    color: '#E53935',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  toggleLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#FFF0F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#E53935',
    fontSize: 15,
    fontWeight: '600',
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 20,
    opacity: 0.5,
  },
  versionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  companyText: {
    fontSize: 12,
    color: '#999',
  },
});
