/** Logo de logo_infantiweb.svg con el texto como HTML real (Nunito) y sin fondo blanco. */
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`logo logo--${size}`}>
      <svg viewBox="16 16 88 88" aria-hidden="true" className="logo__mark">
        <circle cx="60" cy="60" r="38" fill="#FFD84D" stroke="#3B2F63" strokeWidth="6" />
        <circle cx="48" cy="52" r="6" fill="#3B2F63" />
        <circle cx="72" cy="52" r="6" fill="#3B2F63" />
        <path d="M42 70 Q60 88 78 70" fill="none" stroke="#3B2F63" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <span className="logo__text">
        Infanti<span className="logo__accent">Web</span>
      </span>
    </span>
  );
}
