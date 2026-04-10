import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import { useFilterStore } from '../src/store/filter-store';

type Option<T extends string> = {
  label: string;
  value: T;
};

const priceOptions: Array<Option<'cheap' | 'medium' | 'expensive'>> = [
  { label: 'Rẻ', value: 'cheap' },
  { label: 'Vừa', value: 'medium' },
  { label: 'Cao', value: 'expensive' },
];

const budgetOptions: Array<
  Option<'under_30k' | 'from_30k_to_50k' | 'from_50k_to_100k' | 'over_100k'>
> = [
  { label: '< 30.000đ', value: 'under_30k' },
  { label: '30k - 50k', value: 'from_30k_to_50k' },
  { label: '50k - 100k', value: 'from_50k_to_100k' },
  { label: '> 100.000đ', value: 'over_100k' },
];

const dishTypeOptions: Array<Option<'liquid' | 'dry' | 'fried_grilled'>> = [
  { label: 'Món nước', value: 'liquid' },
  { label: 'Món khô', value: 'dry' },
  { label: 'Chiên / Nướng', value: 'fried_grilled' },
];

const cuisineOptions: Array<Option<'vietnamese' | 'asian' | 'european'>> = [
  { label: 'Món Việt', value: 'vietnamese' },
  { label: 'Món Á', value: 'asian' },
  { label: 'Món Âu', value: 'european' },
];

const mealOptions: Array<Option<'breakfast' | 'lunch' | 'dinner' | 'snack'>> = [
  { label: 'Sáng', value: 'breakfast' },
  { label: 'Trưa', value: 'lunch' },
  { label: 'Tối', value: 'dinner' },
  { label: 'Ăn vặt', value: 'snack' },
];

const cookingStyleOptions: Array<Option<'soup' | 'dry' | 'fried' | 'grilled' | 'raw' | 'steamed'>> =
  [
    { label: 'Canh / Súp', value: 'soup' },
    { label: 'Khô', value: 'dry' },
    { label: 'Chiên Rán', value: 'fried' },
    { label: 'Nướng', value: 'grilled' },
    { label: 'Đồ Sống', value: 'raw' },
    { label: 'Hấp', value: 'steamed' },
  ];

const dietOptions: Array<Option<'vegetarian' | 'vegan' | 'keto' | 'clean'>> = [
  { label: 'Ăn Chay', value: 'vegetarian' },
  { label: 'Thuần Chay', value: 'vegan' },
  { label: 'Keto', value: 'keto' },
  { label: 'Eat Clean', value: 'clean' },
];

const contextOptions: Array<Option<'solo' | 'date' | 'group' | 'travel' | 'office'>> = [
  { label: 'Một mình', value: 'solo' },
  { label: 'Hẹn hò', value: 'date' },
  { label: 'Nhóm bạn', value: 'group' },
  { label: 'Du lịch', value: 'travel' },
  { label: 'Văn phòng', value: 'office' },
];

const allergens: Array<Option<string>> = [
  { label: 'Đậu phộng', value: 'peanuts' },
  { label: 'Hải sản có vỏ', value: 'shellfish' },
  { label: 'Sữa', value: 'dairy' },
  { label: 'Gluten', value: 'gluten' },
];

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

const Choice = <T extends string>({
  title,
  options,
  current,
  onSelect,
}: {
  title: string;
  options: Array<Option<T>>;
  current?: T;
  onSelect: (value?: T) => void;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.row}>
      {options.map((item) => (
        <Pressable
          key={item.value}
          style={[styles.pill, current === item.value && styles.pillActive]}
          onPress={async () => {
            await playSoundEffect(require('../assets/sounds/tick-filter.mp3'));
            onSelect(current === item.value ? undefined : item.value);
          }}
        >
          <Text style={[styles.pillText, current === item.value && styles.pillTextActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
);

export default function FilterScreen() {
  const router = useRouter();
  const { filters, setFilter, reset } = useFilterStore();

  const handleReset = () => {
    if (reset) reset();
  };

  const toggleAllergen = (val: string) => {
    const arr = filters.allergenExclude || [];
    if (arr.includes(val)) {
      setFilter(
        'allergenExclude',
        arr.filter((t) => t !== val),
      );
    } else {
      setFilter('allergenExclude', [...arr, val]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Bộ Lọc Sở Thích</Text>
        <Pressable onPress={handleReset}>
          <Text style={styles.clearText}>Xóa Hết</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Choice
          title="Mức giá (Phân loại)"
          options={priceOptions}
          current={filters.priceRange as any}
          onSelect={(value) => setFilter('priceRange' as any, value)}
        />

        <Choice
          title="Khoảng giá (Chi tiết)"
          options={budgetOptions}
          current={filters.budgetBucket as any}
          onSelect={(value) => setFilter('budgetBucket' as any, value)}
        />

        <Choice
          title="Thể loại món"
          options={dishTypeOptions}
          current={filters.dishType as any}
          onSelect={(value) => setFilter('dishType' as any, value)}
        />

        <Choice
          title="Ẩm thực"
          options={cuisineOptions}
          current={filters.cuisineType as any}
          onSelect={(value) => setFilter('cuisineType' as any, value)}
        />

        <Choice
          title="Cách chế biến"
          options={cookingStyleOptions}
          current={filters.cookingStyle as any}
          onSelect={(value) => setFilter('cookingStyle' as any, value)}
        />

        <Choice
          title="Bữa ăn"
          options={mealOptions}
          current={filters.mealType as any}
          onSelect={(value) => setFilter('mealType' as any, value)}
        />

        <Choice
          title="Chế độ ăn kiêng"
          options={dietOptions}
          current={filters.dietTag as any}
          onSelect={(value) => setFilter('dietTag' as any, value)}
        />

        <Choice
          title="Ngữ cảnh"
          options={contextOptions}
          current={filters.context as any}
          onSelect={(value) => setFilter('context' as any, value)}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dị Ứng / Cấm Kỵ</Text>
          <View style={styles.optionsWrap}>
            {allergens.map((allergen, index) => {
              const isActive = (filters.allergenExclude || []).includes(allergen.value);
              const isLast = index === allergens.length - 1;
              return (
                <View
                  key={allergen.value}
                  style={[styles.toggleRow, isLast && { borderBottomWidth: 0 }]}
                >
                  <Text style={styles.rowLabel}>{allergen.label}</Text>
                  <Switch
                    value={isActive}
                    onValueChange={() => toggleAllergen(allergen.value)}
                    trackColor={{ false: '#EAEAEA', true: '#FFCDD2' }}
                    thumbColor={isActive ? '#E53935' : '#FFF'}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.applyBtn} onPress={() => router.back()}>
          <Text style={styles.applyBtnText}>Lắc Với Bộ Lọc</Text>
          <Ionicons name="restaurant" size={18} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', fontFamily: 'serif' },
  clearText: { color: '#666', fontSize: 14, fontWeight: '500' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  pillActive: { backgroundColor: '#E53935', borderColor: '#E53935' },
  pillText: { color: '#333', fontSize: 14, fontWeight: '500' },
  pillTextActive: { color: '#FFF', fontWeight: '700' },
  optionsWrap: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  rowLabel: { fontSize: 16, color: '#333' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  applyBtn: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  applyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
