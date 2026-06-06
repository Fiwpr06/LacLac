'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../src/store/auth-store';
import { useSettingsStore } from '../../../src/store/settings';
import {
  CustomCollection,
  CustomFood,
  getCustomCollectionDetail,
  getCustomFoods,
  addCustomFood,
  updateCustomFood,
  deleteCustomFood,
  uploadImage,
} from '../../../src/lib/api';

type Params = { id: string };

export default function CollectionDetailPage({ params }: { params: Params }) {
  const collectionId = params.id;
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { language } = useSettingsStore();
  const isEn = language === 'en';

  const [collection, setCollection] = useState<CustomCollection | null>(null);
  const [foods, setFoods] = useState<CustomFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State for Food
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [isRandomEnabled, setIsRandomEnabled] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const t = {
    backBtn: isEn ? 'Back to Collections' : 'Quay lại bộ sưu tập',
    foodsTitle: isEn ? 'Foods in this Collection' : 'Món ăn trong bộ',
    addFoodBtn: isEn ? 'Add Custom Food' : 'Thêm món ăn',
    noFoods: isEn ? 'No foods in this collection yet. Add one!' : 'Chưa có món ăn nào trong bộ này. Hãy thêm mới nhé!',
    editBtn: isEn ? 'Edit' : 'Sửa',
    deleteBtn: isEn ? 'Delete' : 'Xóa',
    confirmDelete: isEn ? 'Delete this food?' : 'Bạn có chắc chắn muốn xóa món ăn này?',
    labelName: isEn ? 'Food Name' : 'Tên món ăn',
    labelDesc: isEn ? 'Short Description' : 'Mô tả ngắn',
    labelCategory: isEn ? 'Category / Tag' : 'Thể loại / Danh mục',
    labelImage: isEn ? 'Food Image' : 'Ảnh món ăn',
    labelNote: isEn ? 'Private Notes' : 'Ghi chú riêng (tùy chọn)',
    labelRandom: isEn ? 'Enable in Shake Pool' : 'Cho phép tham gia Random',
    labelSort: isEn ? 'Sort Order' : 'Thứ tự sắp xếp',
    uploadingText: isEn ? 'Uploading...' : 'Đang tải lên...',
    saveBtn: isEn ? 'Save' : 'Lưu lại',
    cancelBtn: isEn ? 'Cancel' : 'Hủy',
    loginRequired: isEn ? 'Please sign in to view details.' : 'Vui lòng đăng nhập để xem chi tiết.',
  };

  const loadData = useCallback(async () => {
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
      router.push('/collections');
    } finally {
      setLoading(false);
    }
  }, [accessToken, collectionId, router]);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    loadData();
  }, [accessToken, loadData]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        setUploading(true);
        const res = await uploadImage(base64, file.name, accessToken);
        setImageUrl(res.url);
      } catch (err: any) {
        alert(err.message || 'Không thể upload ảnh');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleToggleRandom = async (food: CustomFood) => {
    if (!accessToken) return;
    try {
      const updatedValue = !food.isRandomEnabled;
      // Tối ưu UI trước, sau đó cập nhật API sau
      setFoods((prev) =>
        prev.map((f) => (f._id === food._id ? { ...f, isRandomEnabled: updatedValue } : f))
      );
      await updateCustomFood(collectionId, food._id, { isRandomEnabled: updatedValue }, accessToken);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái random');
      // Phục hồi lại nếu lỗi
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      setSubmitLoading(true);
      if (editingFoodId) {
        await updateCustomFood(collectionId, editingFoodId, payload, accessToken);
      } else {
        await addCustomFood(collectionId, payload, accessToken);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (foodId: string) => {
    if (!confirm(t.confirmDelete) || !accessToken) return;
    try {
      await deleteCustomFood(collectionId, foodId, accessToken);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa món ăn');
    }
  };

  if (!accessToken) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{t.loginRequired}</h2>
        <Link
          href="/login"
          className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primaryHover transition-colors inline-block"
        >
          {isEn ? 'Sign In Now' : 'Đăng nhập ngay'}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="w-9 h-9 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Back link */}
      <Link href="/collections" className="inline-flex items-center gap-1.5 text-brand-primary font-black text-xs uppercase tracking-wider mb-6 hover:underline">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t.backBtn}
      </Link>

      {/* Collection Banner */}
      {collection && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-6 items-center border border-white/40">
          <div className="w-28 h-28 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50 shadow-sm relative">
            {collection.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={collection.imageUrl} alt={collection.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 via-rose-500 to-pink-500 flex items-center justify-center text-white text-4xl">
                🍳
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-800 tracking-tight mb-2">
              {collection.name}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed max-w-2xl">
              {collection.description || (isEn ? 'No description' : 'Không có mô tả')}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3 bg-gradient-to-r from-brand-primary to-orange-500 text-white font-black text-xs rounded-xl shadow-md shadow-brand-primary/15 hover:shadow-lg hover:shadow-brand-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 w-full md:w-auto uppercase tracking-wider select-none cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            {t.addFoodBtn}
          </button>
        </div>
      )}

      {/* Foods Grid */}
      <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4">{t.foodsTitle}</h2>

      {foods.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-white/40 flex flex-col items-center">
          <div className="text-5xl mb-4 animate-float">🍽️</div>
          <p className="text-slate-400 text-sm font-semibold">{t.noFoods}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {foods.map((food) => (
            <div
              key={food._id}
              className="glass-panel rounded-3xl p-5 hover:shadow-xl transition-all duration-300 flex gap-4 border border-white/40 group"
            >
              {/* Food Image */}
              <div className="w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-200/50 relative">
                {food.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-2xl group-hover:scale-105 transition-transform duration-500">
                    🥗
                  </div>
                )}
              </div>

              {/* Food Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-black text-slate-800 truncate" title={food.name}>
                      {food.name}
                    </h3>
                    {food.category && (
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded text-[9px] font-black uppercase tracking-wider shrink-0">
                        {food.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold line-clamp-2 mt-1 leading-relaxed">
                    {food.description || (isEn ? 'No description' : 'Không có mô tả')}
                  </p>
                  {food.note && (
                    <p className="text-[11px] text-brand-primary font-bold italic mt-1.5 truncate">
                      💡 {food.note}
                    </p>
                  )}
                </div>

                {/* Bottom line: switch random + actions */}
                <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {isEn ? 'Random' : 'Lắc món'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer scale-75 origin-left">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={food.isRandomEnabled}
                        onChange={() => handleToggleRandom(food)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(food)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-[10px] font-bold border border-slate-200/50 rounded-lg transition-colors select-none cursor-pointer"
                    >
                      {t.editBtn}
                    </button>
                    <button
                      onClick={() => handleDelete(food._id)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-brand-primary text-[10px] font-bold border border-rose-100/50 rounded-lg transition-colors select-none cursor-pointer"
                    >
                      {t.deleteBtn}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up duration-200">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800">
                {editingFoodId ? (isEn ? 'Edit Food' : 'Chỉnh sửa món') : (isEn ? 'Add Food' : 'Thêm món ăn')}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 select-none cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto slim-scrollbar">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.labelName}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-xs"
                  placeholder={isEn ? 'e.g. Broken Rice' : 'Ví dụ: Cơm tấm sườn bì'}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.labelDesc}</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-xs"
                  placeholder={isEn ? 'Brief details...' : 'Mô tả ngắn gọn...'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.labelCategory}</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-xs"
                    placeholder={isEn ? 'e.g. Lunch' : 'Ví dụ: Ăn trưa'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.labelSort}</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-xs"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.labelImage}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-xs"
                    placeholder="http://..."
                  />
                  <label className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl cursor-pointer transition-colors flex items-center justify-center shrink-0 text-xs">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    {uploading ? t.uploadingText : (isEn ? 'Upload' : 'Tải lên')}
                  </label>
                </div>
                {imageUrl && (
                  <div className="mt-3 h-24 w-full relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{t.labelNote}</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold text-xs"
                  placeholder={isEn ? 'e.g. Eat with extra sauce' : 'Ví dụ: Ăn kèm nhiều nước mắm'}
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1 select-none">
                <input
                  type="checkbox"
                  id="isRandomEnabled"
                  checked={isRandomEnabled}
                  onChange={(e) => setIsRandomEnabled(e.target.checked)}
                  className="rounded-md w-4 h-4 border-slate-200 text-brand-primary focus:ring-brand-primary/20 transition-all duration-200 cursor-pointer"
                />
                <label htmlFor="isRandomEnabled" className="text-xs font-bold text-slate-600 cursor-pointer">
                  {t.labelRandom}
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs rounded-xl transition-colors uppercase tracking-wider select-none cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || uploading}
                  className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-orange-500 text-white font-black text-xs rounded-xl hover:shadow-lg hover:shadow-brand-primary/20 disabled:opacity-50 transition-all uppercase tracking-wider select-none cursor-pointer"
                >
                  {submitLoading ? (isEn ? 'Saving...' : 'Đang lưu...') : t.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
