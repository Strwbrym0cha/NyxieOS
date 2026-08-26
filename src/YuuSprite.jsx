import React from 'react';

export const YUU_STATES = Object.freeze({
  normal: { label: 'smug', hair: '#FFD36E', accent: '#F45BB2' },
  nagging: { label: 'nagging', hair: '#FFD36E', accent: '#D83F93' },
  proud: { label: 'proud', hair: '#FFD36E', accent: '#F45BB2' },
  sleepy: { label: 'sleepy', hair: '#F4C968', accent: '#E98DBA' },
  money: { label: 'money', hair: '#FFD36E', accent: '#C93686' },
  cosplay: { label: 'cosplay', hair: '#FFD36E', accent: '#E4489D' }
});

export function normalizeYuuState(value) {
  const key = String(value || 'normal').trim().toLowerCase();
  if (key === 'smug' || key === 'default') return 'normal';
  if (key === 'gentle' || key === 'low-energy' || key === 'low_energy') return 'sleepy';
  if (key === 'success' || key === 'encouraging') return 'proud';
  return Object.prototype.hasOwnProperty.call(YUU_STATES, key) ? key : 'normal';
}

const SIZE_CLASS = { sm: 'yuu-sprite-sm', md: 'yuu-sprite-md', lg: 'yuu-sprite-lg' };

export default function YuuSprite({ state = 'normal', size = 'md', className = '' }) {
  const normalized = normalizeYuuState(state);
  const meta = YUU_STATES[normalized];
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;
  const sleepy = normalized === 'sleepy';
  const nagging = normalized === 'nagging';
  const proud = normalized === 'proud';
  const money = normalized === 'money';
  const cosplay = normalized === 'cosplay';

  return (
    <span
      className={['yuu-sprite', sizeClass, `yuu-sprite-${normalized}`, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={`Yuu-Kun, ${meta.label}`}
    >
      <svg viewBox="0 0 96 96" focusable="false" aria-hidden="true">
        <circle cx="48" cy="48" r="44" fill="#FFF0F8" stroke={meta.accent} strokeWidth="3" />
        <path d="M19 42 13 24l18 9c6-9 28-12 40-2l13-7-5 22c3 18-9 31-31 31S17 63 19 42Z" fill={meta.hair} stroke="#8B4B70" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M24 43c2-13 11-20 24-20 15 0 24 9 25 22v14c-7 9-15 13-25 13-11 0-19-4-25-13Z" fill="#FFF8FC" stroke="#8B4B70" strokeWidth="2" />
        <path d={sleepy ? "M31 49q4 3 8 0M57 49q4 3 8 0" : nagging ? "M30 48l9-3M57 45l9 3" : "M31 47q4-4 8 0M57 47q4-4 8 0"} fill="none" stroke="#432442" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="35" cy="52" r="2.2" fill={meta.accent} />
        <circle cx="61" cy="52" r="2.2" fill={meta.accent} />
        <path d={sleepy ? "M42 60q6 3 12 0" : proud ? "M40 59q8 8 16 0" : nagging ? "M42 62q6-4 12 0" : "M43 60q5 4 10 0"} fill="none" stroke="#8B4B70" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M37 72v8h22v-8" fill="#F45BB2" stroke="#8B4B70" strokeWidth="2" />
        <path d="M42 72v-5h12v5" fill="#FFD6EC" stroke="#8B4B70" strokeWidth="2" />
        {money && <g aria-hidden="true"><circle cx="75" cy="25" r="10" fill="#F45BB2" stroke="#8B4B70" strokeWidth="2" /><text x="75" y="29" textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFF8FC">$</text></g>}
        {cosplay && <path d="m74 20 2.2 5 5.3 1.1-4 3.5.8 5.4-4.3-2.7-4.8 2.4 1.2-5.2-3.6-3.8 5.3-.7Z" fill="#F45BB2" stroke="#8B4B70" strokeWidth="1.5" />}
        {proud && <path d="m20 21 1.5 3.5 3.5 1.5-3.5 1.5L20 31l-1.5-4.5L15 26l3.5-1.5Z" fill="#F45BB2" />}
      </svg>
    </span>
  );
}
