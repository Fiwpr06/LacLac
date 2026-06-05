'use client';

import { motion } from 'framer-motion';
import { Heart, X, Sparkles, RefreshCw, Star, Flame, Clock } from 'lucide-react';

export default function PhonePreview() {
  // Sử dụng link ảnh Bún chả cá thật đã được upload thành công lên Cloudinary ở bước trước
  const foodImageUrl = 'https://res.cloudinary.com/dwob9c2dv/image/upload/v1780682481/lac-lac/foods/bun-cha-ca-suon-mang-long.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -15, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.2, type: 'spring', bounce: 0.3 }}
      className="relative w-[350px] h-[710px] rounded-[3.5rem] border-[14px] border-[#1A1A1A] bg-black shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col items-center z-10"
      style={{
        perspective: '1000px',
        boxShadow: '0 35px 70px -15px rgba(0,0,0,0.35), 0 0 60px rgba(255, 59, 48, 0.1)',
      }}
    >
      {/* Inner Bezel Glow */}
      <div className="absolute inset-0 border border-white/5 rounded-[2.8rem] pointer-events-none z-20"></div>

      {/* Screen Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F5] to-white z-0"></div>

      {/* Dynamic Island / Notch */}
      <div className="absolute top-3.5 w-[124px] h-[32px] bg-black rounded-full z-30 flex items-center justify-between px-4">
        <div className="w-[12px] h-[12px] rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0d0d0d]"></div>
        </div>
        <div className="w-4 h-4 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse"></div>
        </div>
      </div>

      {/* iOS Status Bar */}
      <div className="absolute top-2.5 inset-x-0 px-8 flex justify-between text-[12px] font-bold text-black z-25">
        <span>9:41</span>
        <div className="flex items-center gap-2">
          {/* Signal */}
          <div className="flex items-end gap-[1.5px] h-2">
            <div className="w-0.5 h-[3px] bg-black rounded-sm"></div>
            <div className="w-0.5 h-[5px] bg-black rounded-sm"></div>
            <div className="w-0.5 h-[7px] bg-black rounded-sm"></div>
            <div className="w-0.5 h-[9px] bg-black rounded-sm"></div>
          </div>
          {/* Battery */}
          <div className="w-5 h-2.5 border border-black rounded-[3px] p-[1px] flex items-center">
            <div className="h-full w-full bg-black rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Mockup Content */}
      <div className="relative z-10 flex flex-col w-full h-full p-5 pt-16 justify-between">
        
        {/* Header App */}
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#8E8E93] uppercase font-bold tracking-wider">Hôm nay ăn gì</span>
            <span className="text-xl font-black text-[#1A1A1A] font-heading leading-none">Lắc Lắc</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF3B30] to-orange-400 p-[1.5px] shadow-sm">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-black text-[#FF3B30]">
              L
            </div>
          </div>
        </div>

        {/* Main Food Card Mockup */}
        <div className="w-full h-[420px] bg-white rounded-[2rem] border border-gray-100 shadow-md relative overflow-hidden flex flex-col group/card">
          {/* Image */}
          <div className="w-full flex-1 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={foodImageUrl} 
              alt="Bún chả cá" 
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" 
            />
            {/* Tags overlay */}
            <div className="absolute top-4 left-4 flex gap-1.5 z-10">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                Món nước
              </span>
              <span className="px-3 py-1 rounded-full bg-[#FF3B30]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                Đặc sản
              </span>
            </div>
            
            {/* Bottom Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          </div>

          {/* Details */}
          <div className="p-5 bg-white space-y-3.5 relative z-10">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-black text-[#1A1A1A] line-clamp-1">
                Bún Chả Cá Đà Nẵng
              </h4>
              <div className="flex items-center gap-0.5 text-orange-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-black">4.8</span>
              </div>
            </div>

            {/* Info grid */}
            <div className="flex items-center gap-5 text-xs text-[#8E8E93]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF3B30]" />
                <span>450 kcal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>20 phút</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-green-500" />
                <span>Dễ làm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons inside Card context */}
        <div className="flex items-center justify-between w-full px-2 mb-2">
          {/* Dislike */}
          <button className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#8E8E93] hover:text-[#1A1A1A] hover:bg-gray-50 active:scale-95 transition-all">
            <X className="w-6 h-6" />
          </button>
          
          {/* Shake Trigger button (Lắc ngay) */}
          <button className="flex-1 mx-3 h-14 rounded-full bg-gradient-to-r from-[#FF3B30] to-orange-500 text-white flex items-center justify-center gap-2.5 font-bold text-xs shadow-md shadow-[#FF3B30]/30 hover:opacity-95 active:scale-98 transition-all uppercase tracking-wider">
            <RefreshCw className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '3s' }} />
            Lắc món khác
          </button>

          {/* Like/Fav */}
          <button className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-pink-500 hover:bg-pink-50 active:scale-95 transition-all">
            <Heart className="w-6 h-6 fill-current" />
          </button>
        </div>

      </div>
      
      {/* Home indicator */}
      <div className="absolute bottom-2.5 w-1/3 h-1.5 bg-gray-300 rounded-full z-30"></div>
    </motion.div>
  );
}
