interface NubiProps {
  /** 1 nubecita · 2 nube feliz · 3 nube arcoíris (niveles 1, 3 y 5). */
  stage?: 1 | 2 | 3;
  size?: number | string;
  className?: string;
  /** Texto alternativo; vacío si es decorativa. */
  label?: string;
  float?: boolean;
}

/**
 * Nubi dibujada a partir de mascota_nubi.svg (mismo trazo y colores), sin el
 * fondo cuadrado, para que pueda flotar sobre cualquier superficie.
 */
export function Nubi({ stage = 1, size = 160, className = '', label = '', float = false }: NubiProps) {
  const decorative = !label;
  return (
    <svg
      viewBox="40 60 320 270"
      width={size}
      height={typeof size === 'number' ? (size * 270) / 320 : undefined}
      className={`nubi ${float ? 'nubi--float' : ''} ${className}`}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    >
      {stage === 3 && (
        <g fill="none" strokeWidth="14" strokeLinecap="round" opacity="0.95">
          <path d="M70 250 A130 130 0 0 1 330 250" stroke="#FF6B5E" />
          <path d="M86 250 A114 114 0 0 1 314 250" stroke="#FFA94D" />
          <path d="M102 250 A98 98 0 0 1 298 250" stroke="#FFD84D" />
          <path d="M118 250 A82 82 0 0 1 282 250" stroke="#6BB6FF" />
          <path d="M134 250 A66 66 0 0 1 266 250" stroke="#B58CFF" />
        </g>
      )}
      {stage >= 2 && (
        <g fill="#FFD84D" stroke="#3B2F63" strokeWidth="4" strokeLinejoin="round">
          <path d="M72 120 l7 15 15 7 -15 7 -7 15 -7 -15 -15 -7 15 -7z" />
          <path d="M322 108 l5 11 11 5 -11 5 -5 11 -5 -11 -11 -5 11 -5z" />
        </g>
      )}
      <path
        d="M110 270 Q60 270 65 225 Q70 185 115 190 Q125 130 190 135 Q250 120 280 170 Q340 170 340 225 Q340 270 290 270Z"
        fill="#FFFFFF"
        stroke="#3B2F63"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <circle cx="160" cy="210" r="13" fill="#3B2F63" />
      <circle cx="240" cy="210" r="13" fill="#3B2F63" />
      <circle cx="164" cy="205" r="4" fill="#fff" />
      <circle cx="244" cy="205" r="4" fill="#fff" />
      <path
        d={stage >= 2 ? 'M165 238 Q200 275 235 238' : 'M170 240 Q200 265 230 240'}
        fill="none"
        stroke="#3B2F63"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <ellipse cx="135" cy="238" rx="14" ry="8" fill="#FF9AA2" opacity=".7" />
      <ellipse cx="265" cy="238" rx="14" ry="8" fill="#FF9AA2" opacity=".7" />
      <path d="M200 135 L200 105 M200 105 L185 95 M200 105 L215 95" stroke="#FFB020" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M150 270 L150 310 M250 270 L250 310" stroke="#3B2F63" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
