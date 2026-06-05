'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Globe, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface DownloadCardProps {
  apkUrl?: string;
}

export default function DownloadCard({ apkUrl }: DownloadCardProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'web'>('android');
  const webUrl = 'https://laclac-web.vercel.app/';

  return (
    <div className="w-full max-w-[360px] mx-auto relative group">
      
      {/* Background radial glow that reacts to active tab */}
      <div 
        className={`absolute -inset-4 rounded-[2.5rem] blur-3xl opacity-20 group-hover:opacity-35 transition-all duration-1000 -z-10 ${
          activeTab === 'android' ? 'bg-[#FF3B30]' : 'bg-[#007AFF]'
        }`} 
      />

      {/* Outer Border Glow effect */}
      <div 
        className={`absolute -inset-[1px] rounded-[1.8rem] transition-all duration-700 opacity-60 group-hover:opacity-100 -z-10 bg-gradient-to-tr ${
          activeTab === 'android' 
            ? 'from-[#FF3B30] via-orange-400 to-[#FF3B30]/20' 
            : 'from-[#007AFF] via-[#00C7BE] to-[#007AFF]/20'
        }`}
      />
      
      {/* Main Glass Card */}
      <div className="relative bg-white/70 backdrop-blur-2xl rounded-[1.75rem] p-6 shadow-card flex flex-col items-center min-h-[460px] border border-white/20">
        
        {/* Tab Selector */}
        <div className="w-full flex p-1 bg-gray-100/80 rounded-2xl mb-6 border border-gray-200/30 shadow-inner relative z-10">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-500 relative ${
              activeTab === 'android' ? 'text-white' : 'text-[#8E8E93] hover:text-[#1A1A1A]'
            }`}
          >
            {activeTab === 'android' && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-gradient-to-r from-[#FF3B30] to-orange-500 rounded-xl shadow-md shadow-[#FF3B30]/25"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.55 }}
              />
            )}
            <Smartphone className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Android APK</span>
          </button>
          
          <button
            onClick={() => setActiveTab('web')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-500 relative ${
              activeTab === 'web' ? 'text-white' : 'text-[#8E8E93] hover:text-[#1A1A1A]'
            }`}
          >
            {activeTab === 'web' && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-gradient-to-r from-[#007AFF] to-[#00C7BE] rounded-xl shadow-md shadow-[#007AFF]/25"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.55 }}
              />
            )}
            <Globe className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Web App</span>
          </button>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'android' ? (
            <motion.div
              key="android"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full flex flex-col items-center flex-1 justify-between"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-heading font-black text-[#1A1A1A] mb-1">Tải file APK</h3>
                <p className="text-[#8E8E93] text-xs">Quét mã QR để tải trực tiếp</p>
              </div>

              {/* QR Container Glass */}
              <div className="p-4 bg-white/95 rounded-[1.5rem] shadow-sm border border-gray-100 mb-6 relative group/qr overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/5 to-transparent opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
                {apkUrl ? (
                  <QRCodeSVG value={apkUrl} size={140} bgColor={"#ffffff"} fgColor={"#1A1A1A"} level={"H"} includeMargin={false} />
                ) : (
                  <div className="w-[140px] h-[140px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl gap-2">
                    <Smartphone className="w-6 h-6 text-gray-300" />
                    <span className="text-gray-400 text-[10px] font-semibold">Chưa cấu hình URL tải</span>
                  </div>
                )}
              </div>

              {/* Download Button Android */}
              <a
                href={apkUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF3B30] to-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:shadow-md hover:shadow-[#FF3B30]/20 active:scale-98 transition-all group/btn"
              >
                <Download className="w-4.5 h-4.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                Tải Xuống Trực Tiếp
              </a>

              {/* Secure Notice */}
              <div className="mt-5 w-full p-3 rounded-xl bg-[#FF3B30]/5 border border-[#FF3B30]/10 flex items-start gap-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-[#FF3B30] shrink-0 mt-0.5" />
                <div className="text-left space-y-0.5">
                  <span className="text-[11px] font-bold text-[#FF3B30] block">Hướng dẫn cài đặt:</span>
                  <p className="text-[10px] text-[#8E8E93] leading-relaxed">
                    Bạn cần đồng ý cài đặt từ <strong className="text-[#1A1A1A]">Nguồn không xác định</strong> trong Cài đặt bảo mật của máy để cài file APK.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="web"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full flex flex-col items-center flex-1 justify-between"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-heading font-black text-[#1A1A1A] mb-1">Trải nghiệm Web</h3>
                <p className="text-[#8E8E93] text-xs">Quét mã QR hoặc click để mở ngay</p>
              </div>

              {/* QR Container Glass */}
              <div className="p-4 bg-white/95 rounded-[1.5rem] shadow-sm border border-gray-100 mb-6 relative group/qr overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#007AFF]/5 to-transparent opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
                <QRCodeSVG value={webUrl} size={140} bgColor={"#ffffff"} fgColor={"#1A1A1A"} level={"H"} includeMargin={false} />
              </div>

              {/* Open Link Button Web */}
              <a
                href={webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#007AFF] to-[#00C7BE] text-white text-sm font-bold flex items-center justify-center gap-2 hover:shadow-md hover:shadow-[#007AFF]/20 active:scale-98 transition-all group/btn"
              >
                Mở Trên Trình Duyệt
                <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </a>

              {/* Convenience Notice */}
              <div className="mt-5 w-full p-3 rounded-xl bg-[#007AFF]/5 border border-[#007AFF]/10 flex items-start gap-2.5">
                <Globe className="w-4.5 h-4.5 text-[#007AFF] shrink-0 mt-0.5" />
                <div className="text-left space-y-0.5">
                  <span className="text-[11px] font-bold text-[#007AFF] block">Tiện lợi & Nhanh chóng:</span>
                  <p className="text-[10px] text-[#8E8E93] leading-relaxed">
                    Phiên bản Web có đầy đủ tính năng quẹt và lắc món ăn mà không cần tốn dung lượng cài đặt thiết bị.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
