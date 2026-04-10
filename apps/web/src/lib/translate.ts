export const tPriceRange = (p?: string | null, isEn?: boolean) => {
  if (!p) return isEn ? 'N/A' : 'Không rõ';
  if (p === 'cheap') return isEn ? 'Cheap' : 'Tiết kiệm';
  if (p === 'medium') return isEn ? 'Medium' : 'Cân bằng';
  if (p === 'expensive') return isEn ? 'Expensive' : 'Thoải mái';
  return p;
};

export const tCookingStyle = (c?: string | null, isEn?: boolean) => {
  if (!c) return isEn ? 'N/A' : 'Không rõ';
  if (c === 'soup') return isEn ? 'Soup' : 'Nước/Súp';
  if (c === 'dry') return isEn ? 'Dry' : 'Khô';
  if (c === 'fried') return isEn ? 'Fried' : 'Chiên/Rán';
  if (c === 'grilled') return isEn ? 'Grilled' : 'Nướng';
  if (c === 'raw') return isEn ? 'Raw' : 'Sống/Gỏi';
  if (c === 'steamed') return isEn ? 'Steamed' : 'Hấp';
  return c;
};
