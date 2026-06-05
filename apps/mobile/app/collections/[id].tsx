import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '../../src/store/auth-store';
import { useSettingsStore } from '../../src/store/settings-store';
import {
  CustomCollection,
  CustomFood,
  getCustomCollectionDetail,
  getCustomFoods,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
  uploadImage,
} from '../../src/lib/api';

const { width } = Dimensions.get('window');

export default function CollectionDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const collectionId = params.id;
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const settings = useSettingsStore();
  const isEn = settings.language === 'en';

  const [collection, setCollection] = useState<CustomCollection | null>(null);
  const [foods, setFoods] = useState<CustomFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [isRandomEnabled, setIsRandomEnabled] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const t = {
    backBtn: isEn ? 'Back' : 'Quay lại',
    foodsTitle: isEn ? 'Foods List' : 'Danh sách món ăn',
    addFoodBtn: isEn ? 'Add Food' : 'Thêm món ăn',
    noFoods: isEn ? 'No foods yet' : 'Chưa có món ăn nào',
    editBtn: isEn ? 'Edit' : 'Sửa',
    deleteBtn: isEn ? 'Delete' : 'Xóa',
    confirmDelete: isEn ? 'Are you sure you want to delete this food?' : 'Bạn có chắc muốn xóa món này?',
    labelName: isEn ? 'Food Name' : 'Tên món ăn',
    labelDesc: isEn ? 'Description' : 'Mô tả ngắn',
    labelCategory: isEn ? 'Category / Tag' : 'Danh mục / Thể loại',
    labelImage: isEn ? 'Food Photo' : 'Ảnh món ăn',
    labelNote: isEn ? 'Custom Note' : 'Ghi chú riêng',
    labelRandom: isEn ? 'Enable in Shake pool' : 'Tham gia random',
    labelSort: isEn ? 'Sort Order' : 'Thứ tự sắp xếp',
    saveBtn: isEn ? 'Save' : 'Lưu lại',
    cancelBtn: isEn ? 'Cancel' : 'Hủy',
    uploadBtn: isEn ? 'Pick Photo' : 'Chọn ảnh',
  };

  const loadData = async () => {
    if (!accessToken || !collectionId) return;
    try {
      setLoading(true);
      const [colData, foodsData] = await Promise.all([
        getCustomCollectionDetail(collectionId, accessToken),
        getCustomFoods(collectionId, accessToken),
      ]);
      setCollection(colData);
      setFoods(foodsData);
    } catch (err) {
      console.error(err);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [accessToken, collectionId]);

  const handleOpenAddModal = () => {
    setEditingFoodId(null);
    setName('');
    setDescription('');
    setCategory('');
    setImageUrl('');
    setNote('');
    setIsRandomEnabled(true);
    setSortOrder(0);
    setModalOpen(true);
  };

  const handleOpenEditModal = (food: CustomFood) => {
    setEditingFoodId(food._id);
    setName(food.name);
    setDescription(food.description || '');
    setCategory(food.category || '');
    setImageUrl(food.imageUrl || '');
    setNote(food.note || '');
    setIsRandomEnabled(food.isRandomEnabled);
    setSortOrder(food.sortOrder);
    setModalOpen(true);
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets[0]?.base64 || !accessToken) return;

    setUploading(true);
    try {
      const base64 = result.assets[0].base64;
      const res = await uploadImage(base64, result.assets[0].fileName || 'food.jpg', accessToken);
      setImageUrl(res.url);
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'Lỗi', err.message || 'Không thể upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleRandom = async (food: CustomFood) => {
    if (!accessToken) return;
    try {
      const newVal = !food.isRandomEnabled;
      setFoods((prev) =>
        prev.map((f) => (f._id === food._id ? { ...f, isRandomEnabled: newVal } : f))
      );
      await updateCustomFood(collectionId, food._id, { isRandomEnabled: newVal }, accessToken);
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'Lỗi', err.message || 'Lỗi khi cập nhật');
      loadData();
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !accessToken) return;

    const payload = {
      name,
      description,
      category,
      imageUrl,
      note,
      isRandomEnabled,
      sortOrder,
    };

    setSubmitLoading(true);
    try {
      if (editingFoodId) {
        await updateCustomFood(collectionId, editingFoodId, payload, accessToken);
      } else {
        await addCustomFood(collectionId, payload, accessToken);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'Lỗi', err.message || 'Lỗi khi lưu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (foodId: string) => {
    Alert.alert(
      isEn ? 'Delete Food' : 'Xóa món ăn',
      t.confirmDelete,
      [
        { text: t.cancelBtn, style: 'cancel' },
        {
          text: isEn ? 'Delete' : 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!accessToken) return;
            try {
              await deleteCustomFood(collectionId, foodId, accessToken);
              loadData();
            } catch (err: any) {
              Alert.alert(isEn ? 'Error' : 'Lỗi', err.message || 'Lỗi khi xóa');
            }
          },
        },
      ],
    );
  };

  const baseFontSize = 15 * settings.textScale;

  return (
    <View style={styles.container}>
      {/* Header banner */}
      {collection && (
        <View style={styles.banner}>
          <View style={styles.bannerRow}>
            {collection.imageUrl ? (
              <Image source={{ uri: collection.imageUrl }} style={styles.bannerImage} />
            ) : (
              <View style={[styles.bannerImage, styles.bannerPlaceholder]}>
                <Text style={styles.bannerEmoji}>🍳</Text>
              </View>
            )}
            <View style={styles.bannerInfo}>
              <Text style={[styles.bannerTitle, { fontSize: 20 * settings.textScale }]}>
                {collection.name}
              </Text>
              <Text style={[styles.bannerDesc, { fontSize: baseFontSize - 2 }]} numberOfLines={2}>
                {collection.description || (isEn ? 'No description' : 'Không có mô tả')}
              </Text>
            </View>
          </View>
          <Pressable style={styles.createBtn} onPress={handleOpenAddModal}>
            <Ionicons name="add-circle" size={18} color="#FFF" />
            <Text style={[styles.createBtnText, { fontSize: baseFontSize - 1 }]}>{t.addFoodBtn}</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : foods.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="fast-food-outline" size={64} color="#DDD" />
          <Text style={[styles.emptyText, { fontSize: baseFontSize }]}>{t.noFoods}</Text>
          <Pressable style={[styles.createBtn, { alignSelf: 'center' }]} onPress={handleOpenAddModal}>
            <Ionicons name="add-circle" size={18} color="#FFF" />
            <Text style={[styles.createBtnText, { fontSize: baseFontSize - 1 }]}>{t.addFoodBtn}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {foods.map((food) => (
            <View key={food._id} style={styles.foodCard}>
              <View style={styles.foodInfoRow}>
                {food.imageUrl ? (
                  <Image source={{ uri: food.imageUrl }} style={styles.foodImage} />
                ) : (
                  <View style={[styles.foodImage, styles.foodPlaceholder]}>
                    <Text style={styles.foodEmoji}>🥗</Text>
                  </View>
                )}
                <View style={styles.foodDetails}>
                  <View style={styles.foodHeaderRow}>
                    <Text style={[styles.foodName, { fontSize: baseFontSize }]} numberOfLines={1}>
                      {food.name}
                    </Text>
                    {food.category ? (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{food.category}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.foodDesc, { fontSize: baseFontSize - 2 }]} numberOfLines={2}>
                    {food.description || (isEn ? 'No description' : 'Không có mô tả')}
                  </Text>
                  {food.note ? (
                    <Text style={[styles.foodNote, { fontSize: baseFontSize - 3 }]}>
                      💡 {food.note}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.foodActions}>
                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { fontSize: baseFontSize - 2 }]}>
                    {isEn ? 'Random' : 'Lắc món'}
                  </Text>
                  <Switch
                    value={food.isRandomEnabled}
                    onValueChange={() => handleToggleRandom(food)}
                    trackColor={{ true: '#FFCDD2', false: '#F0F0F0' }}
                    thumbColor={food.isRandomEnabled ? '#E53935' : '#FFF'}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>

                <View style={styles.btnRow}>
                  <Pressable style={styles.iconAction} onPress={() => handleOpenEditModal(food)}>
                    <Ionicons name="create-outline" size={16} color="#666" />
                    <Text style={[styles.iconActionText, { fontSize: baseFontSize - 2, color: '#666' }]}>
                      {t.editBtn}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.iconAction} onPress={() => handleDelete(food._id)}>
                    <Ionicons name="trash-outline" size={16} color="#D32F2F" />
                    <Text style={[styles.iconActionText, { fontSize: baseFontSize - 2, color: '#D32F2F' }]}>
                      {t.deleteBtn}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add/Edit Food Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingFoodId ? (isEn ? 'Edit Food' : 'Sửa món ăn') : t.addFoodBtn}
              </Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{t.labelName}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.textInput}
                placeholder={isEn ? 'e.g. Broken Rice' : 'Ví dụ: Cơm tấm sườn ốp la'}
              />

              <Text style={styles.inputLabel}>{t.labelDesc}</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.textInput}
                placeholder={isEn ? 'e.g. Delicious pork chop...' : 'Ví dụ: Sườn nướng thơm ngon...'}
              />

              <View style={styles.gridRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{t.labelCategory}</Text>
                  <TextInput
                    value={category}
                    onChangeText={setCategory}
                    style={styles.textInput}
                    placeholder="Lunch"
                  />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.inputLabel}>{t.labelSort}</Text>
                  <TextInput
                    value={String(sortOrder)}
                    onChangeText={(val) => setSortOrder(parseInt(val) || 0)}
                    keyboardType="numeric"
                    style={styles.textInput}
                    placeholder="0"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>{t.labelImage}</Text>
              <View style={styles.uploadRow}>
                <TextInput
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="http://..."
                />
                <Pressable
                  style={styles.uploadBtn}
                  onPress={handleSelectImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.uploadBtnText}>{t.uploadBtn}</Text>
                  )}
                </Pressable>
              </View>

              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.previewImage} />
              ) : null}

              <Text style={styles.inputLabel}>{t.labelNote}</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                style={styles.textInput}
                placeholder={isEn ? 'e.g. Eat hot' : 'Ví dụ: Ăn nóng mới ngon'}
              />

              <View style={styles.switchLabelRow}>
                <Text style={styles.switchLabelTitle}>{t.labelRandom}</Text>
                <Switch
                  value={isRandomEnabled}
                  onValueChange={setIsRandomEnabled}
                  trackColor={{ true: '#FFCDD2', false: '#F0F0F0' }}
                  thumbColor={isRandomEnabled ? '#E53935' : '#FFF'}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelModalBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelModalBtnText}>{t.cancelBtn}</Text>
              </Pressable>
              <Pressable
                style={styles.saveModalBtn}
                onPress={handleSubmit}
                disabled={submitLoading || uploading}
              >
                {submitLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveModalBtnText}>{t.saveBtn}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  banner: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bannerRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 16 },
  bannerImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F5F5F5' },
  bannerPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE0B2' },
  bannerEmoji: { fontSize: 36 },
  bannerInfo: { flex: 1 },
  bannerTitle: { fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  bannerDesc: { color: '#666', lineHeight: 18 },
  createBtn: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  createBtnText: { color: '#FFF', fontWeight: '700' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14 },
  emptyText: { color: '#888' },
  scrollContent: { padding: 16, gap: 16 },
  foodCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  foodInfoRow: { flexDirection: 'row', padding: 14, gap: 14, alignItems: 'center' },
  foodImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#F5F5F5' },
  foodPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0F2F1' },
  foodEmoji: { fontSize: 32 },
  foodDetails: { flex: 1 },
  foodHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 },
  foodName: { fontWeight: '700', color: '#1A1A1A', flex: 1 },
  categoryBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: { fontSize: 10, fontWeight: '700', color: '#666', textTransform: 'uppercase' },
  foodDesc: { color: '#777', lineHeight: 17, marginBottom: 2 },
  foodNote: { color: '#E53935', fontWeight: '500', fontStyle: 'italic' },
  foodActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchLabel: { color: '#666', fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 14 },
  iconAction: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  iconActionText: { fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  modalForm: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
  textInput: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
  },
  gridRow: { flexDirection: 'row', gap: 14 },
  uploadRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 16 },
  uploadBtn: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
  },
  uploadBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  previewImage: { width: '100%', height: 120, borderRadius: 12, marginBottom: 16 },
  switchLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabelTitle: { fontSize: 14, fontWeight: '600', color: '#555' },
  modalFooter: { flexDirection: 'row', gap: 12 },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelModalBtnText: { color: '#666', fontWeight: '600', fontSize: 15 },
  saveModalBtn: {
    flex: 1,
    backgroundColor: '#E53935',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveModalBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
