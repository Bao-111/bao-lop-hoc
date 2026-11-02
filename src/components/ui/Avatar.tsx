import React from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  gender?: 'male' | 'female' | 'other' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  badge?: React.ReactNode;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl'
};

// Distinct, vibrant gradient palettes for avatars
const PALETTES = [
  'from-blue-600 to-indigo-700 text-white',
  'from-cyan-500 to-blue-600 text-slate-950 font-black',
  'from-purple-600 to-pink-600 text-white',
  'from-emerald-500 to-teal-700 text-white',
  'from-amber-500 to-orange-600 text-slate-950 font-black',
  'from-rose-500 to-red-700 text-white',
  'from-teal-500 to-emerald-600 text-slate-950 font-black',
  'from-indigo-500 to-purple-600 text-white'
];

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  gender,
  size = 'md',
  className = '',
  badge
}) => {
  // Extract initials (last word or first + last)
  const getInitials = (str: string) => {
    if (!str) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1];
    return last.charAt(0).toUpperCase();
  };

  // Deterministic palette pick based on name
  const getPalette = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % PALETTES.length;
    return PALETTES[idx];
  };

  const initials = getInitials(name);
  const palette = getPalette(name);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses} rounded-full object-cover ring-2 ring-cyan-500/30 shadow-sm`}
          onError={e => {
            // Fallback to initial display on image load failure
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-br ${palette} flex items-center justify-center font-bold tracking-tight shadow-md ring-2 ring-white/10`}
          title={name}
        >
          {initials}
        </div>
      )}

      {badge && (
        <div className="absolute -bottom-0.5 -right-0.5 pointer-events-none">
          {badge}
        </div>
      )}
    </div>
  );
};
