'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../src/store/auth-store';
import { useSettingsStore } from '../../src/store/settings';
import {
  CustomCollection,
  getCustomCollections,
  createCustomCollection,
  updateCustomCollection,
  deleteCustomCollection,
  copyCustomCollection,
  uploadImage,
} from '../../src/lib/api';

export default function CollectionsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { language } = useSettingsStore();
  const isEn = language === 'en';

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
    title: isEn ? 'My Custom Collections' : 'Bộ Món Ăn Cá Nhân',
    desc: isEn
      ? 'Create and manage your private food lists to shake from.'
      : 'Tự tạo danh sách món ăn riêng và sử dụng để lắc chọn món.',
    loginRequired: isEn
      ? 'Please sign in to manage collections.'
      : 'Vui lòng đăng nhập để quản lý bộ món ăn.',
    addBtn: isEn ? 'New Collection' : 'Thêm bộ mới',
    noCollections: isEn ? 'No collections found. Create one!' : 'Chưa có bộ sưu tập nào. Hãy tạo mới nhé!',
    copyBtn: isEn ? 'Copy' : 'Sao chép',
    editBtn: isEn ? 'Edit' : 'Sửa',
    deleteBtn: isEn ? 'Delete' : 'Xóa',
    confirmDelete: isEn
      ? 'Are you sure you want to delete this collection and all its foods?'
      : 'Bạn có chắc chắn muốn xóa bộ sưu tập này và tất cả món ăn bên trong?',
    labelName: isEn ? 'Collection Name' : 'Tên bộ món ăn',
    labelDesc: isEn ? 'Description' : 'Mô tả',
    labelImage: isEn ? 'Cover Image (URL or Upload)' : 'Ảnh đại diện bộ sưu tập',
    uploadingText: isEn ? 'Uploading...' : 'Đang tải lên...',
    saveBtn: isEn ? 'Save' : 'Lưu lại',
    cancelBtn: isEn ? 'Cancel' : 'Hủy',
    copySuccess: isEn ? 'Collection copied!' : 'Đã sao chép bộ món ăn!',
    deleteSuccess: isEn ? 'Collection deleted!' : 'Đã xóa bộ món ăn!',
    saveSuccess: isEn ? 'Collection saved!' : 'Đã lưu bộ món ăn!',
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
    if (!accessToken) {
      setLoading(false);
      return;
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !accessToken) return;

    try {
      setSubmitLoading(true);
      if (editingId) {
        await updateCustomCollection(editingId, { name, description, imageUrl }, accessToken);
      } else {
        await createCustomCollection({ name, description, imageUrl }, accessToken);
      }
      setModalOpen(false);
      fetchCollections();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete) || !accessToken) return;
    try {
      await deleteCustomCollection(id, accessToken);
      fetchCollections();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa');
    }
  };

  const handleCopy = async (id: string) => {
    if (!accessToken) return;
    try {
      await copyCustomCollection(id, accessToken);
      fetchCollections();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi sao chép');
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

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-brand-secondary mb-2">
            {t.title}
          </h1>
          <p className="text-brand-muted">{t.desc}</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primaryHover transition-all shadow-[0_4px_14px_rgba(255,59,48,0.25)] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {t.addBtn}
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-brand-border">
          <div className="text-5xl mb-4">🍱</div>
          <p className="text-slate-500 font-medium">{t.noCollections}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col._id}
              className="bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all flex flex-col h-[360px]"
            >
              {/* Cover Image */}
              <div className="h-40 bg-slate-100 relative overflow-hidden shrink-0">
                {col.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={col.imageUrl} alt={col.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-4xl">
                    🍳
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
                <div className="min-w-0">
                  <Link href={`/collections/${col._id}`}>
                    <h3 className="text-lg font-bold text-slate-800 hover:text-brand-primary truncate cursor-pointer">
                      {col.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {col.description || (isEn ? 'No description' : 'Không có mô tả')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link href={`/collections/${col._id}`} className="flex-1">
                    <button className="w-full py-2 bg-brand-primary/10 text-brand-primary text-sm font-bold rounded-lg hover:bg-brand-primary/20 transition-colors">
                      {isEn ? 'View Foods' : 'Xem Món'}
                    </button>
                  </Link>
                  <button
                    onClick={() => handleCopy(col._id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                  >
                    {t.copyBtn}
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(col)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                  >
                    {t.editBtn}
                  </button>
                  <button
                    onClick={() => handleDelete(col._id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors"
                  >
                    {t.deleteBtn}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? (isEn ? 'Edit Collection' : 'Chỉnh sửa bộ') : (isEn ? 'New Collection' : 'Tạo bộ mới')}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.labelName}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                  placeholder={isEn ? 'e.g. Snack Night' : 'Ví dụ: Ăn vặt đêm'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.labelDesc}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none"
                  placeholder={isEn ? 'Brief description...' : 'Mô tả ngắn...'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.labelImage}</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    placeholder="http://..."
                  />
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center shrink-0">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    {uploading ? t.uploadingText : (isEn ? 'Upload' : 'Tải lên')}
                  </label>
                </div>
                {imageUrl && (
                  <div className="mt-3 h-24 w-full relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || uploading}
                  className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primaryHover disabled:opacity-50 transition-colors"
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
