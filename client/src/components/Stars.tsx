import { asset } from '../lib/assets';

interface StarsProps {
  count: number;
  total?: number;
  size?: 'sm' | 'md' | 'lg';
  /** Anima la aparición de cada estrella ganada. */
  animate?: boolean;
}

export function Stars({ count, total = 3, size = 'md', animate = false }: StarsProps) {
  const full = asset('estrella_llena');
  const empty = asset('estrella_vacia');
  return (
    <span className={`stars stars--${size}`} role="img" aria-label={`${count} de ${total} estrellas`}>
      {Array.from({ length: total }, (_, i) => (
        <img
          key={i}
          src={i < count ? full : empty}
          alt=""
          className={animate && i < count ? 'stars__pop' : undefined}
          style={animate ? { animationDelay: `${180 + i * 160}ms` } : undefined}
        />
      ))}
    </span>
  );
}
