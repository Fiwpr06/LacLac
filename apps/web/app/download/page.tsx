import { Metadata } from 'next';
import PhonePreview from '../../src/components/download/PhonePreview';
import DownloadCard from '../../src/components/download/DownloadCard';
import { Sparkles, Compass, Flame, BookOpen, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tải Ứng Dụng Lắc Lắc | Lắc Một Cái, Ra Món Ngay',
  description: 'Dừng việc suy nghĩ hôm nay ăn gì. Tải ngay ứng dụng Lắc Lắc cho Android hoặc trải nghiệm trực tiếp trên Web App với thao tác quẹt và lắc món cực mượt.',
  openGraph: {
    title: 'Tải Ứng Dụng Lắc Lắc',
    description: 'Ứng dụng tìm món ăn ngẫu nhiên thông minh và thú vị.',
    type: 'website',
  },
};

export default function DownloadPage() {
  const apkUrl = process.env['NEXT_PUBLIC_APK_URL'];

  const features = [
    {
      icon: <Layers className="w-6 h-6 text-[#FF3B30]" />,
      title: 'Quẹt Trực Quan',
      description: 'Trải nghiệm quẹt trái bỏ qua, quẹt phải lưu món ăn yêu thích cực kỳ gây nghiện và mượt mà.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#FF9500]" />,
      title: 'Lắc Ngẫu Nhiên',
      description: 'Chỉ cần lắc nhẹ điện thoại hoặc bấm nút để nhận ngay gợi ý món ngon ngẫu nhiên dựa theo khẩu vị.',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#34C759]" />,
      title: 'Công Thức Chi Tiết',
      description: 'Cung cấp các bước hướng dẫn chuẩn bị và chế biến chi tiết cho hơn 400+ món ăn đặc sản hấp dẫn.',
    },
    {
      icon: <Flame className="w-6 h-6 text-[#007AFF]" />,
      title: 'Dinh Dưỡng & Calo',
      description: 'Theo dõi chỉ số Calories, chất đạm, chất béo và tinh bột của từng món ăn để bảo vệ sức khỏe.',
    },
  ];

  return (
    <div className="w-full flex flex-col pt-0 pb-16 relative overflow-hidden bg-[#FAFAFA]">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />
      
      {/* Background decoration - Radial Glow Blobs */}
      <div className="absolute top-0 inset-x-0 h-screen bg-gradient-to-b from-[#FF3B30]/5 via-transparent to-transparent -z-10" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#FF3B30]/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/3 -left-40 w-[600px] h-[600px] bg-[#007AFF]/8 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-[#34C759]/5 rounded-full blur-[100px] -z-10" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full px-6 lg:px-8 relative z-10 space-y-28">
        
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-12 items-center justify-between">
          
          {/* LEFT: Copywriting & Download Card */}
          <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] font-semibold text-xs uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
              Lắc Lắc v1.2.0 - Sẵn sàng tải về
            </div>
            
            <h1 className="text-5xl md:text-6xl font-heading font-black text-[#1A1A1A] tracking-tight leading-[1.15] mb-6">
              Hôm nay <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] via-orange-500 to-[#FF9500] filter drop-shadow-sm">
                ăn gì đây?
              </span>
            </h1>
            
            <p className="text-lg text-[#8E8E93] leading-relaxed max-w-lg mb-5">
              Dừng việc suy nghĩ đắn đo mỗi ngày. Hãy để Lắc Lắc chọn giúp bạn món ngon ưng ý chỉ với một cái lắc tay hoặc một cú quẹt thẻ trực quan.
            </p>

            {/* Action Card (Download Options) */}
            <div className="w-full max-w-[450px] flex justify-center lg:justify-start z-20 -translate-y-2.5">
              <DownloadCard apkUrl={apkUrl} />
            </div>
          </div>

          {/* RIGHT: Phone Mockup (Graphic) */}
          <div className="w-full lg:w-auto shrink-0 flex justify-center z-20">
            <PhonePreview />
          </div>

        </div>

        {/* FEATURES GRID SECTION */}
        <div className="w-full pt-12 border-t border-gray-200/60 relative">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-[#1A1A1A] tracking-tight">
              Tính năng nổi bật trên Lắc Lắc
            </h2>
            <p className="text-[#8E8E93] leading-relaxed">
              Trải nghiệm ăn uống được đơn giản hóa tối đa với các tính năng hướng tới sự nhanh gọn và thú vị.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group relative bg-white/70 backdrop-blur-md border border-gray-200/50 hover:border-[#FF3B30]/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col space-y-4 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#FF3B30]/5 group-hover:border-[#FF3B30]/10 transition-colors shrink-0">
                  {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#FF3B30] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#8E8E93] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
