import fs from 'node:fs';
import path from 'node:path';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { toSlug } from '../common/slug.util';
import { Food, FoodSchema } from '../foods/food.schema';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../../.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
  api_key: process.env['CLOUDINARY_API_KEY'],
  api_secret: process.env['CLOUDINARY_API_SECRET'],
});

type BackfillFoodDoc = {
  _id: mongoose.Types.ObjectId;
  name?: { vi: string; en: string };
  nameSlug?: string;
  images?: string[];
  thumbnailImage?: string;
};

type DdgImageResult = {
  title: string;
  image: string;
  thumbnail: string;
  width: number;
  height: number;
  source: string;
};

const BROKEN_IMAGE_URL_PREFIXES = ['https://res.cloudinary.com/demo/image/upload/lac-lac/'];

const isHttpUrl = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }
  return /^https?:\/\//i.test(value.trim());
};

const sanitizeImageUrl = (value: string | null | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  if (BROKEN_IMAGE_URL_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return undefined;
  }
  return normalized;
};

const isFallbackDataImage = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }
  return value.startsWith('data:image/svg+xml,');
};

const isImageValid = (food: BackfillFoodDoc): boolean => {
  const currentImage =
    sanitizeImageUrl(food.thumbnailImage) ??
    (food.images ?? []).map((value) => sanitizeImageUrl(value)).find((value) => !!value);

  if (!currentImage) {
    return false;
  }
  if (isFallbackDataImage(currentImage)) {
    return false;
  }
  return isHttpUrl(currentImage);
};

// Hàm lấy token vqd từ DuckDuckGo để thực hiện search ảnh
async function getVqdToken(query: string): Promise<string | null> {
  try {
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const vqdRegex = /vqd=["']([^"']+)["']/i;
    const match = html.match(vqdRegex);
    if (match && match[1]) {
      return match[1];
    }
    const vqdRegex2 = /vqd=([^&'"\s]+)/i;
    const match2 = html.match(vqdRegex2);
    return (match2 && match2[1]) ? match2[1] : null;
  } catch {
    return null;
  }
}

// Hàm tìm kiếm ảnh trên DuckDuckGo
async function searchDdgImages(query: string): Promise<DdgImageResult[]> {
  const vqd = await getVqdToken(query);
  if (!vqd) {
    return [];
  }
  try {
    const apiUrl = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/',
      },
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { results?: DdgImageResult[] };
    return data.results || [];
  } catch {
    return [];
  }
}

// Lọc các ảnh phù hợp
function isSuitableImage(img: DdgImageResult): boolean {
  const url = img.image.toLowerCase();
  const title = img.title.toLowerCase();

  // Yêu cầu: Không sử dụng ảnh từ Wikipedia hoặc Wikimedia Commons
  if (url.includes('wikipedia.org') || url.includes('wikimedia.org')) {
    return false;
  }

  // Loại bỏ các logo, banner quảng cáo, ảnh minh họa không liên quan, menu/bảng giá
  const badKeywords = [
    'logo',
    'banner',
    'icon',
    'placeholder',
    'avatar',
    'advertisement',
    'ads',
    'watermark',
    'preview',
    'thumb',
    'card',
    'sticker',
    'vector',
    'cartoon',
    'clipart',
    'illustration',
    'draw',
    'doodle',
    'chibi',
    'sign',
    'symbol',
    'giá',
    'bảng giá',
    'menu',
    'thực đơn',
    'khuyến mãi',
    'voucher',
    'discount',
  ];
  if (badKeywords.some((keyword) => url.includes(keyword) || title.includes(keyword))) {
    return false;
  }

  const width = Number(img.width);
  const height = Number(img.height);
  if (isNaN(width) || isNaN(height)) {
    return false;
  }

  // Ưu tiên ảnh chất lượng cao và độ phân giải tốt (rộng >= 500, cao >= 400)
  if (width < 500 || height < 400) {
    return false;
  }

  // Tránh ảnh quá dẹt hoặc quá đứng
  const ratio = width / height;
  if (ratio < 0.7 || ratio > 1.8) {
    return false;
  }

  return true;
}

// Tải ảnh về dưới dạng Buffer
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 giây timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.startsWith('image/')) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 10240) {
      // Bỏ qua nếu ảnh quá nhỏ (dưới 10KB)
      return null;
    }
    return buffer;
  } catch {
    return null;
  }
}

// Upload ảnh lên Cloudinary
async function uploadToCloudinary(buffer: Buffer, nameSlug: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'lac-lac/foods',
        public_id: nameSlug,
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result && result.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Cloudinary upload returned empty secure_url'));
        }
      },
    );
    uploadStream.end(buffer);
  });
}

async function runBackfill() {
  const mongoUri = process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/lac_lac';
  const dryRun = process.env['DRY_RUN'] === 'true';

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB.`);

  const FoodModel = mongoose.model(Food.name, FoodSchema);
  const foods = (await FoodModel.find({})
    .select('_id name nameSlug images thumbnailImage')
    .lean()
    .exec()) as unknown as BackfillFoodDoc[];

  console.log(`Total foods found: ${foods.length}`);

  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const food of foods) {
    scanned += 1;

    const dishName = (food.name?.vi ?? '').trim();
    if (!dishName) {
      console.log(`[BỎ QUA] Món ăn số ${scanned}: Tên tiếng Việt bị trống.`);
      skipped += 1;
      continue;
    }

    // 1. Chỉ xử lý các món chưa có ảnh hợp lệ
    if (isImageValid(food)) {
      console.log(`[BỎ QUA] Món ăn "${dishName}": Đã có ảnh hợp lệ.`);
      skipped += 1;
      continue;
    }

    const nameSlug = (food.nameSlug ?? '').trim() || toSlug(dishName);
    console.log(`[TÌM KIẾM] Món ăn "${dishName}" (slug: ${nameSlug})...`);

    // Thực hiện tìm kiếm trên DuckDuckGo
    const searchResults = await searchDdgImages(`${dishName} món ăn`);
    const suitableResults = searchResults.filter(isSuitableImage);

    if (suitableResults.length === 0) {
      console.log(`[THẤT BẠI] Món ăn "${dishName}": Không tìm thấy ảnh phù hợp từ kết quả tìm kiếm.`);
      failed += 1;
      continue;
    }

    let uploadedUrl: string | null = null;
    let chosenOriginalUrl = '';

    // Lần lượt thử tải các ảnh từ trên xuống dưới
    for (const result of suitableResults) {
      console.log(`  -> Đang thử tải ảnh từ: ${result.image}`);
      const buffer = await downloadImage(result.image);
      if (buffer) {
        chosenOriginalUrl = result.image;
        if (dryRun) {
          console.log(`  -> [DRY RUN] Tải thành công ảnh kích thước ${buffer.length} bytes.`);
          uploadedUrl = `mock-cloudinary-url-for-${nameSlug}`;
          break;
        } else {
          try {
            console.log(`  -> Đang upload lên Cloudinary...`);
            uploadedUrl = await uploadToCloudinary(buffer, nameSlug);
            console.log(`  -> Upload thành công: ${uploadedUrl}`);
            break;
          } catch (err) {
            console.error(`  -> Lỗi upload Cloudinary:`, err);
          }
        }
      }
    }

    if (uploadedUrl) {
      if (!dryRun) {
        await FoodModel.updateOne(
          { _id: food._id },
          {
            $set: {
              nameSlug,
              images: [uploadedUrl],
              thumbnailImage: uploadedUrl,
            },
          },
        ).exec();
      }
      console.log(`[THÀNH CÔNG] Món ăn "${dishName}": Đã cập nhật ảnh từ nguồn ${chosenOriginalUrl}`);
      updated += 1;
    } else {
      console.log(`[THẤT BẠI] Món ăn "${dishName}": Không thể tải/upload bất kỳ ảnh nào trong danh sách ảnh phù hợp.`);
      failed += 1;
    }
  }

  console.log(
    `\n=== KẾT QUẢ BACKFILL ===\n` +
      `Tổng số món đã quét: ${scanned}\n` +
      `Đã cập nhật ảnh: ${updated}\n` +
      `Đã bỏ qua (đã có ảnh hợp lệ): ${skipped}\n` +
      `Thất bại (cần xử lý thủ công): ${failed}\n` +
      `Chế độ DryRun: ${dryRun}`
  );

  await mongoose.connection.close();
}

runBackfill().catch(async (error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Backfill failed', error);
  await mongoose.connection.close();
  process.exit(1);
});
