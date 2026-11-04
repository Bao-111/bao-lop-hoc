/**
 * Avatar & Gender utilities for SmartClass Edu
 * Provides accurate gender detection and SVG avatars matching Vietnamese names and roles
 */

export type GenderType = 'male' | 'female';

/**
 * Accurately detects gender from Vietnamese name and optional honorific/role
 */
export function detectGenderFromName(name: string, fallbackGender?: string): GenderType {
  if (fallbackGender === 'male' || fallbackGender === 'female') {
    return fallbackGender as GenderType;
  }

  if (!name) return 'male';
  const clean = name.toLowerCase().trim();

  // 1. Honorifics / titles
  if (/\b(cô|mẹ|bà|chị|nữ|em gái|cháu gái)\b/i.test(clean)) return 'female';
  if (/\b(thầy|bố|ông|anh|nam|em trai|cháu trai)\b/i.test(clean)) return 'male';

  // 2. Strong Vietnamese female middle & first names
  const femalePatterns = [
    'thị', 'mai', 'lan', 'hoa', 'cúc', 'trúc', 'hương', 'linh', 'ngọc', 'thảo',
    'trang', 'hà', 'nhi', 'phương', 'quỳnh', 'vy', 'yến', 'như', 'châu', 'dung',
    'hằng', 'nga', 'thu', 'thùy', 'khánh', 'ánh', 'diệu', 'hoài', 'mỹ', 'tuyết',
    'loan', 'trâm', 'ngân', 'thúy', 'bích', 'liên', 'oanh', 'hạnh', 'vân', 'chi',
    'tâm', 'an', 'huyền', 'phượng', 'thư', 'nguyên', 'quuyên', 'hiền', 'đoan'
  ];

  // 3. Strong Vietnamese male middle & first names
  const malePatterns = [
    'văn', 'quốc', 'đức', 'minh', 'thành', 'gia', 'hải', 'thế', 'công', 'hữu',
    'bách', 'cường', 'dũng', 'đăng', 'huy', 'long', 'quân', 'sơn', 'thắng', 'tú',
    'việt', 'vũ', 'hoàng', 'tùng', 'kiên', 'trọng', 'phúc', 'bảo', 'trung', 'đạt',
    'khoa', 'nghĩa', 'phong', 'tuấn', 'hùng', 'nam', 'bình', 'thái', 'khải', 'lâm'
  ];

  const words = clean.split(/\s+/);
  const lastName = words[words.length - 1]; // Given name (tên gọi)
  const middleName = words.length > 2 ? words[words.length - 2] : ''; // Middle name (tên đệm)

  // Prioritize middle name "Thị" (Female) or "Văn" (Male)
  if (clean.includes(' thị ')) return 'female';
  if (clean.includes(' văn ')) return 'male';

  // Check last name first
  if (femalePatterns.includes(lastName)) return 'female';
  if (malePatterns.includes(lastName)) return 'male';

  // Check middle name
  if (femalePatterns.includes(middleName)) return 'female';
  if (malePatterns.includes(middleName)) return 'male';

  return 'male';
}

/**
 * Returns a deterministic integer hash from a string
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}
