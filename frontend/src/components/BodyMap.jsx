import { useState, useEffect } from 'react';

const MUSCLE_GROUPS = [
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'chest',     label: 'Chest' },
  { id: 'arms',      label: 'Arms' },
  { id: 'back',      label: 'Back' },
  { id: 'abs',       label: 'Abs' },
  { id: 'glutes',    label: 'Glutes' },
  { id: 'legs',      label: 'Legs' },
];

// SVG path data for front-facing body muscle regions
// Coordinate space: 0-200 width, 0-340 height
const MUSCLE_PATHS = {
  shoulders: [
    // Left deltoid
    'M52,72 Q42,68 38,78 Q36,88 42,96 L58,92 L62,78 Z',
    // Right deltoid
    'M148,72 Q158,68 162,78 Q164,88 158,96 L142,92 L138,78 Z',
  ],
  chest: [
    // Left pec
    'M62,82 L90,80 L95,96 Q92,110 82,112 L58,108 L58,96 Q56,88 62,82 Z',
    // Right pec
    'M138,82 L110,80 L105,96 Q108,110 118,112 L142,108 L142,96 Q144,88 138,82 Z',
  ],
  arms: [
    // Left arm (bicep/tricep)
    'M38,100 Q32,100 30,112 L28,140 Q26,150 30,156 L38,156 Q42,150 40,140 L42,112 Q44,100 38,100 Z',
    // Right arm
    'M162,100 Q168,100 170,112 L172,140 Q174,150 170,156 L162,156 Q158,150 160,140 L158,112 Q156,100 162,100 Z',
  ],
  back: [
    // Left lat (visible from front as side torso)
    'M54,96 L58,96 L58,130 L52,136 Q46,128 46,112 Q46,100 54,96 Z',
    // Right lat
    'M146,96 L142,96 L142,130 L148,136 Q154,128 154,112 Q154,100 146,96 Z',
  ],
  abs: [
    // Abdominal area
    'M82,114 L118,114 L120,130 L122,150 L118,168 Q110,174 100,174 Q90,174 82,168 L78,150 L80,130 Z',
  ],
  glutes: [
    // Hip / glute area (front view - hip flexor region)
    'M78,168 Q76,176 72,184 L82,190 L100,192 L118,190 L128,184 Q124,176 122,168 Q110,176 100,176 Q90,176 78,168 Z',
  ],
  legs: [
    // Left quad
    'M72,188 L82,192 Q86,220 84,248 L80,272 Q78,282 74,284 L66,284 Q62,278 64,268 L62,240 Q60,216 66,192 Z',
    // Right quad
    'M128,188 L118,192 Q114,220 116,248 L120,272 Q122,282 126,284 L134,284 Q138,278 136,268 L138,240 Q140,216 134,192 Z',
  ],
};

// Body outline path
const BODY_OUTLINE = `
  M100,10
  Q92,10 88,16 Q84,22 84,30 L82,38
  Q78,44 72,48 L62,54
  Q48,58 38,68 Q30,76 28,88
  L24,110 Q22,130 24,148
  L28,156
  Q26,160 24,168 L22,180
  Q20,190 22,196
  L30,196 Q34,190 34,182
  L36,170 Q38,162 42,158
  L46,146 Q50,152 52,164
  L54,176 Q56,184 62,192
  L66,196
  Q62,220 60,248
  L58,272 Q56,286 56,296
  L54,318 Q54,326 58,330
  L74,332 Q78,330 78,324
  L80,304 Q82,294 84,286
  L90,266 Q96,258 100,258
  Q104,258 110,266
  L116,286 Q118,294 120,304
  L122,324 Q122,330 126,332
  L142,330 Q146,326 146,318
  L144,296 Q144,286 142,272
  L140,248 Q138,220 134,196
  L138,192 Q144,184 146,176
  L148,164 Q150,152 154,146
  L158,158 Q162,162 164,170
  L166,182 Q166,190 170,196
  L178,196 Q180,190 178,180
  L176,168 Q174,160 172,156
  L176,148 Q178,130 176,110
  L172,88 Q170,76 162,68
  Q152,58 138,54
  L128,48 Q122,44 118,38
  L116,30 Q116,22 112,16
  Q108,10 100,10 Z
`;

// Head outline
const HEAD_PATH = `
  M100,8
  Q86,8 82,18 Q78,28 82,38
  Q78,44 72,48 L80,52 Q88,56 100,56
  Q112,56 120,52 L128,48
  Q122,44 118,38 Q122,28 118,18
  Q114,8 100,8 Z
`;

const pulseKeyframes = `
  @keyframes muscleGlow {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
`;

export default function BodyMap({ selected = [], onToggle }) {
  const [justToggled, setJustToggled] = useState(null);

  useEffect(() => {
    if (justToggled) {
      const timer = setTimeout(() => setJustToggled(null), 600);
      return () => clearTimeout(timer);
    }
  }, [justToggled]);

  const handleToggle = (id) => {
    setJustToggled(id);
    onToggle?.(id);
  };

  const isSelected = (id) => selected.includes(id);

  const getMuscleStyle = (id) => {
    const sel = isSelected(id);
    return {
      fill: sel ? '#22c55e' : '#27272a',
      stroke: sel ? '#4ade80' : '#52525b',
      strokeWidth: 1.2,
      cursor: 'pointer',
      transition: 'fill 0.2s, stroke 0.2s',
      filter: sel ? 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' : 'none',
      animation: justToggled === id && sel ? 'muscleGlow 0.6s ease-in-out' : 'none',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <style>{pulseKeyframes}</style>

      {/* SVG Body */}
      <svg
        viewBox="0 0 200 340"
        width="280"
        height="280"
        style={{ maxWidth: '100%', overflow: 'visible' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Body outline */}
        <path d={BODY_OUTLINE} fill="none" stroke="#3f3f46" strokeWidth={1.5} />
        {/* Head */}
        <path d={HEAD_PATH} fill="none" stroke="#3f3f46" strokeWidth={1.5} />

        {/* Muscle regions */}
        {MUSCLE_GROUPS.map(({ id }) =>
          (MUSCLE_PATHS[id] || []).map((d, i) => (
            <path
              key={`${id}-${i}`}
              d={d}
              style={getMuscleStyle(id)}
              onClick={() => handleToggle(id)}
              role="button"
              tabIndex={0}
              aria-label={`${MUSCLE_GROUPS.find(m => m.id === id)?.label} - ${isSelected(id) ? 'selected' : 'not selected'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle(id);
                }
              }}
            />
          ))
        )}
      </svg>

      {/* Labels grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 16px',
          width: '100%',
          maxWidth: 300,
        }}
      >
        {MUSCLE_GROUPS.map(({ id, label }) => {
          const sel = isSelected(id);
          return (
            <button
              key={id}
              onClick={() => handleToggle(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${sel ? '#22c55e' : '#3f3f46'}`,
                background: sel ? 'rgba(34,197,94,0.1)' : 'rgba(39,39,42,0.5)',
                color: sel ? '#4ade80' : '#a1a1aa',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `2px solid ${sel ? '#22c55e' : '#52525b'}`,
                  background: sel ? '#22c55e' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 12,
                  color: '#0f0f0f',
                  fontWeight: 700,
                }}
              >
                {sel ? '\u2713' : ''}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
