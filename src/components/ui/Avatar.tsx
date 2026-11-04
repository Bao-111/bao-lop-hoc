import React, { useState } from 'react';
import { detectGenderFromName, hashString, GenderType } from '../../utils/avatarUtils';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  gender?: 'male' | 'female' | 'other' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  badge?: React.ReactNode;
  showGenderIcon?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl'
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  gender,
  size = 'md',
  className = '',
  badge,
  showGenderIcon = false
}) => {
  const [imgError, setImgError] = useState(false);

  // Detect gender based on prop or Vietnamese name
  const resolvedGender: GenderType = detectGenderFromName(name, gender);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const hash = hashString(name || 'user');
  const variant = hash % 3; // 3 subtle variations per gender

  // Color theme based on gender
  const isFemale = resolvedGender === 'female';
  const ringColor = isFemale ? 'ring-pink-400/40' : 'ring-cyan-400/40';

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses} rounded-full object-cover ring-2 ${ringColor} shadow-md`}
          onError={() => setImgError(true)}
        />
      ) : (
        /* Gender-Matched High-Definition Vector Avatar Illustration */
        <div
          className={`${sizeClasses} rounded-full overflow-hidden ring-2 ${ringColor} shadow-md flex items-center justify-center bg-[#070d1e]`}
          title={`${name} (${isFemale ? 'Nữ' : 'Nam'})`}
        >
          {isFemale ? (
            /* FEMALE AVATAR ILLUSTRATION (Nữ sinh / Cô giáo) */
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`femBg-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={variant === 0 ? '#ec4899' : variant === 1 ? '#a855f7' : '#f43f5e'} />
                  <stop offset="100%" stopColor="#4c0519" />
                </linearGradient>
                <linearGradient id={`femSkin-${hash}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffd8c2" />
                  <stop offset="100%" stopColor="#fca5a5" />
                </linearGradient>
                <linearGradient id={`femHair-${hash}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#291528" />
                  <stop offset="100%" stopColor="#120710" />
                </linearGradient>
              </defs>

              {/* Background */}
              <circle cx="50" cy="50" r="50" fill={`url(#femBg-${hash})`} />

              {/* Back Hair (Ponytail or Long Hair) */}
              <path
                d="M24 45 C20 65 24 85 36 96 C40 98 60 98 64 96 C76 85 80 65 76 45 Z"
                fill={`url(#femHair-${hash})`}
              />

              {/* School uniform / collar */}
              <path
                d="M26 100 L35 78 L50 88 L65 78 L74 100 Z"
                fill="#ffffff"
              />
              {/* Pink / Coral neck ribbon or vest */}
              <path
                d="M44 86 L50 96 L56 86 L50 82 Z"
                fill={variant === 0 ? '#f43f5e' : '#ec4899'}
              />

              {/* Neck */}
              <path d="M43 65 L43 80 L57 80 L57 65 Z" fill={`url(#femSkin-${hash})`} />

              {/* Head / Face */}
              <ellipse cx="50" cy="52" rx="20" ry="23" fill={`url(#femSkin-${hash})`} />

              {/* Blush */}
              <circle cx="38" cy="58" r="3.5" fill="#f43f5e" opacity="0.3" />
              <circle cx="62" cy="58" r="3.5" fill="#f43f5e" opacity="0.3" />

              {/* Eyes */}
              <circle cx="42" cy="52" r="2.2" fill="#1e1b4b" />
              <circle cx="43" cy="51" r="0.8" fill="#ffffff" />
              <circle cx="58" cy="52" r="2.2" fill="#1e1b4b" />
              <circle cx="59" cy="51" r="0.8" fill="#ffffff" />

              {/* Gentle smile */}
              <path
                d="M45 61 Q50 65 55 61"
                stroke="#e11d48"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Front Styled Hair (Bangs & sides) */}
              <path
                d="M30 45 C30 30 40 24 50 24 C60 24 70 30 70 45 C66 40 58 40 50 43 C42 40 34 40 30 45 Z"
                fill={`url(#femHair-${hash})`}
              />

              {/* Cute Hair Accessory / Ribbon clip */}
              <circle cx="68" cy="35" r="4" fill="#fb7185" />
              <circle cx="68" cy="35" r="1.5" fill="#ffffff" />
            </svg>
          ) : (
            /* MALE AVATAR ILLUSTRATION (Nam sinh / Thầy giáo) */
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`maleBg-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={variant === 0 ? '#0284c7' : variant === 1 ? '#2563eb' : '#0d9488'} />
                  <stop offset="100%" stopColor="#082f49" />
                </linearGradient>
                <linearGradient id={`maleSkin-${hash}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffdec9" />
                  <stop offset="100%" stopColor="#f6be98" />
                </linearGradient>
                <linearGradient id={`maleHair-${hash}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Background */}
              <circle cx="50" cy="50" r="50" fill={`url(#maleBg-${hash})`} />

              {/* School Shirt / Collar */}
              <path
                d="M24 100 L34 76 L50 87 L66 76 L76 100 Z"
                fill="#ffffff"
              />
              {/* Cyan / Blue School Tie */}
              <path
                d="M46 84 L54 84 L52 98 L50 100 L48 98 Z"
                fill={variant === 0 ? '#0284c7' : '#06b6d4'}
              />

              {/* Neck */}
              <path d="M43 65 L43 78 L57 78 L57 65 Z" fill={`url(#maleSkin-${hash})`} />

              {/* Head / Face */}
              <ellipse cx="50" cy="52" rx="20" ry="22" fill={`url(#maleSkin-${hash})`} />

              {/* Ears */}
              <circle cx="29" cy="52" r="3.5" fill={`url(#maleSkin-${hash})`} />
              <circle cx="71" cy="52" r="3.5" fill={`url(#maleSkin-${hash})`} />

              {/* Eyes */}
              <circle cx="43" cy="52" r="2.2" fill="#0f172a" />
              <circle cx="44" cy="51" r="0.8" fill="#ffffff" />
              <circle cx="57" cy="52" r="2.2" fill="#0f172a" />
              <circle cx="58" cy="51" r="0.8" fill="#ffffff" />

              {/* Eyebrows */}
              <path d="M39 46 Q43 44 47 46" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M53 46 Q57 44 61 46" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />

              {/* Friendly smile */}
              <path
                d="M45 61 Q50 65 55 61"
                stroke="#b91c1c"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Neat Styled Dark Hair */}
              <path
                d="M28 46 C28 28 38 23 50 23 C62 23 72 28 72 46 C70 38 64 34 50 35 C38 36 31 40 28 46 Z"
                fill={`url(#maleHair-${hash})`}
              />
            </svg>
          )}
        </div>
      )}

      {/* Optional gender indicator badge */}
      {showGenderIcon && (
        <span
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shadow-xs ring-1 ring-[#070d1e] ${
            isFemale
              ? 'bg-pink-500 text-white'
              : 'bg-cyan-500 text-slate-950'
          }`}
          title={isFemale ? 'Giới tính: Nữ' : 'Giới tính: Nam'}
        >
          {isFemale ? '♀' : '♂'}
        </span>
      )}

      {badge && (
        <div className="absolute -bottom-0.5 -right-0.5 pointer-events-none">
          {badge}
        </div>
      )}
    </div>
  );
};
