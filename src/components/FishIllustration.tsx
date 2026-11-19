export function FishIllustration({
  speciesId,
  className = 'h-24 w-full',
}: {
  speciesId: string;
  className?: string;
}) {
  const configs: Record<
    string,
    {
      top: string;
      belly: string;
      fin: string;
      spots?: 'trout' | 'snapper' | 'rig' | 'salmon';
      band?: boolean;
      wingFin?: boolean;
      shark?: boolean;
      elephant?: boolean;
      kingyStripe?: boolean;
    }
  > = {
    kahawai: { top: '#1e6b52', belly: '#e2e8f0', fin: '#64748b' },
    'blue-cod': { top: '#0284c7', belly: '#bae6fd', fin: '#0369a1', spots: 'trout' },
    'red-cod': { top: '#be123c', belly: '#fecdd3', fin: '#9f1239' },
    rig: { top: '#64748b', belly: '#f1f5f9', fin: '#475569', spots: 'rig', shark: true },
    'elephant-fish': { top: '#94a3b8', belly: '#f8fafc', fin: '#64748b', elephant: true },
    'blue-moki': { top: '#3730a3', belly: '#c7d2fe', fin: '#312e81', band: true },
    snapper: { top: '#e11d48', belly: '#ffe4e6', fin: '#fb7185', spots: 'snapper' },
    kingfish: { top: '#0f766e', belly: '#f1f5f9', fin: '#eab308', kingyStripe: true },
    'brown-trout': { top: '#854d0e', belly: '#fef08a', fin: '#a16207', spots: 'trout' },
    'chinook-salmon': { top: '#0369a1', belly: '#e2e8f0', fin: '#475569', spots: 'salmon' },
    'red-gurnard': { top: '#dc2626', belly: '#fee2e2', fin: '#2563eb', wingFin: true },
    tarakihi: { top: '#64748b', belly: '#f8fafc', fin: '#475569', band: true },
  };

  const cfg = configs[speciesId] ?? configs.kahawai;
  const gradId = `fish-grad-${speciesId}`;

  return (
    <svg
      viewBox="0 0 260 110"
      className={className}
      role="img"
      aria-label={`${speciesId} illustration`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cfg.top} />
          <stop offset="55%" stopColor={cfg.top} stopOpacity="0.75" />
          <stop offset="100%" stopColor={cfg.belly} />
        </linearGradient>
      </defs>

      {/* Subtle Water Shimmer */}
      <ellipse cx="135" cy="94" rx="85" ry="6" fill="#22d3ee" opacity="0.12" />

      {/* Tail Fin */}
      {cfg.shark ? (
        <path d="M 48,55 L 14,26 L 26,55 L 16,74 Z" fill={cfg.fin} opacity="0.92" />
      ) : (
        <path d="M 54,55 L 16,28 L 30,55 L 16,82 Z" fill={cfg.fin} opacity="0.92" />
      )}

      {/* Dorsal Fin */}
      {cfg.shark ? (
        <path d="M 118,34 L 102,10 L 144,34 Z" fill={cfg.fin} />
      ) : (
        <path d="M 92,35 Q 130,10 170,36 L 154,40 L 96,40 Z" fill={cfg.fin} opacity="0.88" />
      )}

      {/* Anal & Pelvic Fins */}
      <path d="M 78,72 L 62,90 L 94,75 Z" fill={cfg.fin} opacity="0.8" />
      <path d="M 122,76 L 108,94 L 136,78 Z" fill={cfg.fin} opacity="0.8" />

      {/* Main Body */}
      {cfg.elephant ? (
        <path
          d="M 48,56 Q 85,26 165,30 Q 212,34 236,54 Q 246,62 232,68 Q 218,64 206,70 Q 150,86 48,56 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
        />
      ) : (
        <path
          d="M 48,55 Q 92,22 164,28 Q 216,34 238,55 Q 216,78 164,82 Q 92,86 48,55 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
        />
      )}

      {/* Tarakihi / Moki Dark Saddle Band */}
      {cfg.band && (
        <path
          d="M 172,30 Q 182,55 172,80 L 188,78 Q 196,55 188,32 Z"
          fill="#0f172a"
          opacity="0.55"
        />
      )}

      {/* Kingfish Yellow Lateral Stripe */}
      {cfg.kingyStripe && (
        <path
          d="M 58,55 Q 140,48 220,54"
          stroke="#facc15"
          strokeWidth="4"
          fill="none"
          opacity="0.9"
        />
      )}

      {/* Species Markings / Spots */}
      {cfg.spots === 'snapper' && (
        <g fill="#38bdf8" opacity="0.85">
          <circle cx="135" cy="44" r="1.8" />
          <circle cx="152" cy="40" r="1.8" />
          <circle cx="168" cy="46" r="1.8" />
          <circle cx="144" cy="50" r="1.6" />
          <circle cx="182" cy="42" r="1.6" />
          <circle cx="120" cy="48" r="1.5" />
        </g>
      )}
      {cfg.spots === 'trout' && (
        <g>
          <circle cx="115" cy="46" r="2.2" fill="#1e293b" />
          <circle cx="136" cy="42" r="2.2" fill="#dc2626" />
          <circle cx="155" cy="48" r="2.2" fill="#1e293b" />
          <circle cx="172" cy="44" r="2.2" fill="#dc2626" />
          <circle cx="128" cy="54" r="2" fill="#dc2626" />
          <circle cx="148" cy="56" r="2" fill="#1e293b" />
        </g>
      )}
      {cfg.spots === 'rig' && (
        <g fill="#ffffff" opacity="0.75">
          <circle cx="110" cy="46" r="1.8" />
          <circle cx="128" cy="42" r="1.8" />
          <circle cx="145" cy="45" r="1.8" />
          <circle cx="165" cy="44" r="1.8" />
          <circle cx="182" cy="48" r="1.8" />
        </g>
      )}
      {cfg.spots === 'salmon' && (
        <g fill="#0f172a" opacity="0.65">
          <circle cx="100" cy="42" r="1.5" />
          <circle cx="118" cy="39" r="1.5" />
          <circle cx="138" cy="41" r="1.5" />
          <circle cx="158" cy="43" r="1.5" />
          <circle cx="32" cy="46" r="1.4" />
          <circle cx="28" cy="60" r="1.4" />
        </g>
      )}

      {/* Gurnard Wing Pectoral Fin */}
      {cfg.wingFin ? (
        <path
          d="M 164,58 Q 130,54 114,76 Q 146,84 170,66 Z"
          fill="#2563eb"
          stroke="#38bdf8"
          strokeWidth="1.5"
          opacity="0.9"
        />
      ) : (
        <path d="M 168,58 L 142,72 L 166,70 Z" fill={cfg.fin} opacity="0.85" />
      )}

      {/* Gill Line & Eye */}
      <path d="M 184,39 Q 178,55 184,71" stroke="rgba(15,23,42,0.45)" strokeWidth="2" fill="none" />
      <circle cx="208" cy="49" r="4.5" fill="#ffffff" />
      <circle cx="209.5" cy="49" r="2.3" fill="#0f172a" />
      <circle cx="210.5" cy="48" r="0.8" fill="#ffffff" />
    </svg>
  );
}
