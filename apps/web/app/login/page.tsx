'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../src/lib/auth-api';
import { useAuthStore } from '../../src/store/auth-store';

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setAuth(res.user, res.accessToken, res.refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[70vh] w-full flex items-center justify-center py-10 px-4 overflow-hidden">
      {/* Dynamic blurred blobs */}
      <div className="absolute top-10 left-10 md:left-1/4 w-72 h-72 bg-rose-400/20 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute bottom-10 right-10 md:right-1/4 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-blob pointer-events-none [animation-delay:4s]" />

      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl animate-fade-in-up">
        <h1 className="text-3xl font-heading font-extrabold text-center text-brand-secondary mb-8 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Đăng Nhập
        </h1>
        {error ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        ) : null}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl outline-none font-semibold text-xs glass-input"
              placeholder="nhap@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl outline-none font-semibold text-xs glass-input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold py-3.5 rounded-2xl hover:shadow-lg hover:shadow-rose-500/10 active:scale-95 transition-all disabled:opacity-50 mt-6 cursor-pointer select-none text-sm uppercase tracking-wider"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className="mt-8 text-center text-xs text-slate-500 font-bold">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-orange-500 hover:text-orange-600 transition-colors font-extrabold">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
