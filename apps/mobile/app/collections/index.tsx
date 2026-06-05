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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '../../src/store/auth-store';
import { useSettingsStore } from '../../src/store/settings-store';
import {
  CustomCollection,
  getCustomCollections,
  createCustomCollection,
  updateCustomCollection,
  deleteCustomCollection,
  copyCustomCollection,
  uploadImage,
} from '../../src/lib/api';

const { width } = Dimensions.get('window');

export default function CollectionsScreen() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const settings = useSettingsStore();
  const isEn = settings.language === 'en';

  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const t = {
    title: isEn ? 'Custom Collections' : 'Bộ Món Ăn Cá Nhân',
    addBtn: isEn ? 'Create Collection' : 'Tạo bộ món ăn',
    noCollections: isEn ? 'No collections found' : 'Chưa có bộ sưu tập nào',
    copySuccess: isEn ? 'Collection copied' : 'Đã sao chép bộ sưu tập',
    deleteSuccess: isEn ? 'Collection deleted' : 'Đã xóa bộ sưu tập',
    confirmDelete: isEn ? 'Delete collection and all its foods?' : 'Xóa bộ sưu tập này và tất cả món ăn bên trong?',
    labelName: isEn ? 'Name' : 'Tên bộ sưu tập',
    labelDesc: isEn ? 'Description' : 'Mô tả',
    labelImage: isEn ? 'Cover Image' : 'Ảnh đại diện',
    saveBtn: isEn ? 'Save' : 'Lưu lại',
    cancelBtn: isEn ? 'Cancel' : 'Hủy',
    uploadBtn: isEn ? 'Choose Photo' : 'Chọn ảnh từ máy',
  };

  const fetchCollections = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await getCustomCollections(accessToken);
      setCollections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [accessToken]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (col: CustomCollection) => {
    setEditingId(col._id);
    setName(col.name);
    setDescription(col.description || '');
    setImageUrl(col.imageUrl || '');
    setModalOpen(true);
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (result.canceled || !result.assets[0]?.base64 || !accessToken) return;

    setUploading(true);
    try {
      const base64 = result.assets[0].base64;
      const res = await uploadImage(base64, result.assets[0].fileName || 'collection.jpg', accessToken);
      setImageUrl(res.url);
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'Lỗi', err.message || 'Không thể upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !accessToken) return;

    setSubmitLoading(true);
    try {
      if (editingId) {
        await updateCustomCollection(editingId, { name, description, imageUrl }, accessToken);
      } else {
        await createCustomCollection({ name, description, imageUrl }, accessToken);
      }
      setModalOpen(false);
      fetchCollections();
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'Lỗi', err.message || 'Lỗi khi lưu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      isEn ? 'Delete Collection' : 'Xóa bộ sưu tập',
      t.confirmDelete,
      [
        { text: t.cancelBtn, style: 'cancel' },
        {
          text: isEn ? 'Delete' : 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!accessToken) return;
            try {
              await deleteCustomCollection(id, accessToken);
              fetchCollections();
            } catch (err: any) {
              Alert.alert(isEn ? 'Error' : 'Lỗi', err.message || 'Lỗi khi xóa');
            }
          },
        },
      ],
    );
  };

  const handleCopy = async (id: string) => {
    if (!accessToken) return;
    try {
      setLoading(true);
      await copyCustomCollection(id, accessToken);
      Alert.alert(isEn ? 'Success' : 'Thành công', t.copySuccess);
      fetchCollections();
    } catch (err: any) {
      Alert.alert(isEn ? 'Error' : 'Lỗi', err.message || 'Lỗi khi sao chép');
      setLoading(false);
    }
  };

  const baseFontSize = 15 * settings.textScale;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: 18 * settings.textScale }]}>{t.title}</Text>
        <Pressable onPress={handleOpenAddModal} style={styles.addIcon}>
          <Ionicons name="add" size={26} color="#E53935" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : collections.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="journal-outline" size={64} color="#DDD" />
          <Text style={[styles.emptyText, { fontSize: baseFontSize }]}>{t.noCollections}</Text>
          <Pressable style={styles.createBtn} onPress={handleOpenAddModal}>
            <Text style={[styles.createBtnText, { fontSize: baseFontSize }]}>{t.addBtn}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {collections.map((col) => (
            <View key={col._id} style={styles.card}>
              <Pressable
                onPress={() => router.push(`/collections/${col._id}`)}
                style={styles.cardPressable}
              >
                {col.imageUrl ? (
                  <Image source={{ uri: col.imageUrl }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderEmoji}>🍳</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { fontSize: baseFontSize + 1 }]} numberOfLines={1}>
                    {col.name}
                  </Text>
                  <Text style={[styles.cardDesc, { fontSize: baseFontSize - 2 }]} numberOfLines={2}>
                    {col.description || (isEn ? 'No description' : 'Không có mô tả')}
                  </Text>
                </View>
              </Pressable>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => router.push(`/collections/${col._id}`)}
                >
                  <Ionicons name="eye-outline" size={16} color="#E53935" />
                  <Text style={[styles.actionBtnText, { fontSize: baseFontSize - 2 }]}>
                    {isEn ? 'Foods' : 'Xem món'}
                  </Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => handleCopy(col._id)}>
                  <Ionicons name="copy-outline" size={15} color="#666" />
                  <Text style={[styles.actionBtnText, { fontSize: baseFontSize - 2, color: '#666' }]}>
                    {isEn ? 'Copy' : 'Chép'}
                  </Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => handleOpenEditModal(col)}>
                  <Ionicons name="create-outline" size={15} color="#666" />
                  <Text style={[styles.actionBtnText, { fontSize: baseFontSize - 2, color: '#666' }]}>
                    {isEn ? 'Edit' : 'Sửa'}
                  </Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => handleDelete(col._id)}>
                  <Ionicons name="trash-outline" size={15} color="#D32F2F" />
                  <Text style={[styles.actionBtnText, { fontSize: baseFontSize - 2, color: '#D32F2F' }]}>
                    {isEn ? 'Delete' : 'Xóa'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? (isEn ? 'Edit Collection' : 'Sửa bộ sưu tập') : t.addBtn}
              </Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{t.labelName}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.textInput}
                placeholder={isEn ? 'e.g. Work Team Lunch' : 'Ví dụ: Ăn trưa đồng nghiệp'}
              />

              <Text style={styles.inputLabel}>{t.labelDesc}</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={[styles.textInput, styles.textArea]}
                multiline
                numberOfLines={3}
                placeholder={isEn ? 'Brief description...' : 'Mô tả ngắn...'}
              />

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
                    <Text style={styles.uploadBtnText}>{isEn ? 'Pick' : 'Chọn'}</Text>
                  )}
                </Pressable>
              </View>

              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.previewImage} />
              ) : null}
            </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontWeight: '700', color: '#1A1A1A' },
  addIcon: { padding: 4 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { color: '#888', marginTop: 12, marginBottom: 20 },
  createBtn: {
    backgroundColor: '#E53935',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  createBtnText: { color: '#FFF', fontWeight: '700' },
  scrollContent: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressable: { flexDirection: 'row', padding: 14, gap: 14, alignItems: 'center' },
  cardImage: { width: 68, height: 68, borderRadius: 12, backgroundColor: '#F5F5F5' },
  imagePlaceholder: { alignItems: 'center', backgroundColor: '#FFE0B2', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 28 },
  cardInfo: { flex: 1 },
  cardName: { fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  cardDesc: { color: '#777', lineHeight: 18 },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionBtnText: { color: '#E53935', fontWeight: '600' },
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
  modalBody: { marginBottom: 24 },
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
  textArea: { height: 80, textAlignVertical: 'top' },
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
  previewImage: { width: '100%', height: 120, borderRadius: 12, marginTop: 4 },
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
