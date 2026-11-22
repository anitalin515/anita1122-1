import React from 'react';
import { Gender } from '../types/game';

export const ChildAvatarIcon: React.FC<{ gender: Gender; className?: string }> = ({
  gender,
  className = 'w-12 h-12',
}) => {
  if (gender === 'boy') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        {/* Pom-pom */}
        <circle cx="32" cy="10" r="5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.5" />
        {/* Blue beanie */}
        <path
          d="M16 28 C16 15, 48 15, 48 28 Z"
          fill="#1E40AF"
          stroke="#0F172A"
          strokeWidth="2.5"
        />
        <rect
          x="14"
          y="24"
          width="36"
          height="7"
          rx="3.5"
          fill="#DBEAFE"
          stroke="#0F172A"
          strokeWidth="2.2"
        />
        {/* Face */}
        <circle cx="32" cy="39" r="14" fill="#FDE6C4" stroke="#0F172A" strokeWidth="2.5" />
        {/* Hair fringe */}
        <path d="M22 31 Q27 35 32 31 Q37 35 42 31" fill="#451A03" />
        {/* Cheeks */}
        <circle cx="23" cy="42" r="3" fill="#FDA4AF" opacity="0.7" />
        <circle cx="41" cy="42" r="3" fill="#FDA4AF" opacity="0.7" />
        {/* Eyes */}
        <circle cx="27" cy="39" r="2.2" fill="#0F172A" />
        <circle cx="37" cy="39" r="2.2" fill="#0F172A" />
        {/* Smile */}
        <path
          d="M28 44 Q32 48 36 44"
          fill="none"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Red scarf */}
        <rect
          x="19"
          y="51"
          width="26"
          height="8"
          rx="4"
          fill="#DC2626"
          stroke="#0F172A"
          strokeWidth="2.2"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Braids */}
      <circle cx="15" cy="41" r="5" fill="#5C2D16" stroke="#0F172A" strokeWidth="2.2" />
      <circle cx="49" cy="41" r="5" fill="#5C2D16" stroke="#0F172A" strokeWidth="2.2" />
      <circle cx="14" cy="48" r="4" fill="#5C2D16" stroke="#0F172A" strokeWidth="2.2" />
      <circle cx="50" cy="48" r="4" fill="#5C2D16" stroke="#0F172A" strokeWidth="2.2" />
      {/* Face */}
      <circle cx="32" cy="38" r="14" fill="#FDE6C4" stroke="#0F172A" strokeWidth="2.5" />
      {/* Bangs */}
      <path d="M18 34 Q25 26 32 30 Q39 26 46 34 L44 26 L20 26 Z" fill="#5C2D16" />
      {/* Berry beret */}
      <ellipse
        cx="32"
        cy="22"
        rx="18"
        ry="8.5"
        transform="rotate(-6 32 22)"
        fill="#E11D48"
        stroke="#0F172A"
        strokeWidth="2.5"
      />
      {/* Cream bow */}
      <circle cx="21" cy="21" r="3.2" fill="#FEF3C7" stroke="#0F172A" strokeWidth="1.5" />
      <circle cx="27" cy="20" r="3.2" fill="#FEF3C7" stroke="#0F172A" strokeWidth="1.5" />
      {/* Cheeks */}
      <circle cx="23" cy="41" r="3" fill="#FDA4AF" opacity="0.7" />
      <circle cx="41" cy="41" r="3" fill="#FDA4AF" opacity="0.7" />
      {/* Eyes */}
      <circle cx="27" cy="38" r="2.2" fill="#0F172A" />
      <circle cx="37" cy="38" r="2.2" fill="#0F172A" />
      {/* Smile */}
      <path
        d="M28 43 Q32 47 36 43"
        fill="none"
        stroke="#0F172A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Cream scarf */}
      <rect
        x="19"
        y="50"
        width="26"
        height="8"
        rx="4"
        fill="#FEF3C7"
        stroke="#0F172A"
        strokeWidth="2.2"
      />
    </svg>
  );
};

export const ItemBadgeIcon: React.FC<{
  type: 'coin' | 'gift' | 'candy' | 'bomb';
  className?: string;
}> = ({ type, className = 'w-6 h-6' }) => {
  if (type === 'coin') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
        <circle cx="16" cy="16" r="9.5" fill="#FDE047" />
        <path
          d="M16 9 L17.9 13.3 L22.5 13.8 L19 16.9 L20 21.5 L16 19.1 L12 21.5 L13 16.9 L9.5 13.8 L14.1 13.3 Z"
          fill="#B45309"
        />
      </svg>
    );
  }
  if (type === 'gift') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
        <rect
          x="5"
          y="10"
          width="22"
          height="18"
          rx="3"
          fill="#DC2626"
          stroke="#0F172A"
          strokeWidth="2"
        />
        <rect
          x="4"
          y="8"
          width="24"
          height="6"
          rx="2"
          fill="#EF4444"
          stroke="#0F172A"
          strokeWidth="2"
        />
        <rect x="13.5" y="8" width="5" height="20" fill="#FBBF24" />
        <rect x="5" y="16" width="22" height="4.5" fill="#FBBF24" />
        <ellipse cx="12" cy="6" rx="4" ry="2.5" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.5" />
        <ellipse cx="20" cy="6" rx="4" ry="2.5" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.5" />
      </svg>
    );
  }
  if (type === 'candy') {
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
        <path d="M8 16 L3 10 L4 22 Z" fill="#F472B6" stroke="#0F172A" strokeWidth="1.8" />
        <path d="M24 16 L29 10 L28 22 Z" fill="#F472B6" stroke="#0F172A" strokeWidth="1.8" />
        <circle cx="16" cy="16" r="9" fill="#FFF1F2" stroke="#0F172A" strokeWidth="2" />
        <path d="M16 16 L16 8 A8 8 0 0 1 22 11 Z" fill="#E11D48" />
        <path d="M16 16 L24 17 A8 8 0 0 1 19 23 Z" fill="#E11D48" />
        <path d="M16 16 L9 20 A8 8 0 0 1 10 11 Z" fill="#E11D48" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 8 Q20 3 25 6" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="26" cy="6" r="3" fill="#FEF08A" />
      <circle cx="26" cy="6" r="1.5" fill="#EF4444" />
      <circle cx="15" cy="18" r="11" fill="#1E293B" stroke="#020617" strokeWidth="2" />
      <text x="15" y="22.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#F87171">
        !
      </text>
    </svg>
  );
};
