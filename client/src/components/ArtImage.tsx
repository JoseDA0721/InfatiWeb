import {
  Bandage,
  Bed,
  CloudRain,
  Dices,
  EarOff,
  Eraser,
  Heart,
  HeartHandshake,
  House,
  Lightbulb,
  MessageCircleHeart,
  Moon,
  PartyPopper,
  Puzzle,
  School,
  ShieldCheck,
  Undo2,
  Users,
  Utensils,
  Volleyball,
  type LucideIcon,
} from 'lucide-react';
import { asset } from '../lib/assets';

/** Íconos para las razones de «Expreso lo que siento»: un dibujo claro por idea. */
const ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  icono_escuela: { icon: School, bg: '#E1F1FF' },
  icono_casa: { icon: House, bg: '#FFD6D1' },
  icono_amigos: { icon: Users, bg: '#FFF2D8' },
  icono_cansado: { icon: Bed, bg: '#E8DEFF' },
  icono_compania: { icon: HeartHandshake, bg: '#FDE7EF' },
  icono_seguro: { icon: ShieldCheck, bg: '#DDF6EE' },
  icono_querido: { icon: Heart, bg: '#FDE7EF' },
  icono_solo: { icon: Moon, bg: '#E8DEFF' },
  icono_aprender: { icon: Lightbulb, bg: '#FFF2D8' },
  icono_recreo: { icon: Volleyball, bg: '#E1F1FF' },
  icono_error: { icon: Undo2, bg: '#FFF1E0' },
  icono_extranar: { icon: MessageCircleHeart, bg: '#FDE7EF' },
  icono_jugar: { icon: Puzzle, bg: '#DDF6EE' },
  icono_comer: { icon: Utensils, bg: '#FFD6D1' },
  icono_celebrar: { icon: PartyPopper, bg: '#FFF2D8' },
  icono_ignorado: { icon: EarOff, bg: '#F1F1F4' },
  icono_equivocar: { icon: Eraser, bg: '#FFF1E0' },
  icono_roto: { icon: Bandage, bg: '#FFD6D1' },
  icono_lluvia: { icon: CloudRain, bg: '#E1F1FF' },
  icono_perder: { icon: Dices, bg: '#E8DEFF' },
};

interface ArtImageProps {
  name: string | null | undefined;
  alt?: string;
  className?: string;
}

/** Muestra una ilustración por nombre, o un ícono dibujado si el nombre es un «icono_*». */
export function ArtImage({ name, alt = '', className = '' }: ArtImageProps) {
  if (name && ICONS[name]) {
    const { icon: Icon, bg } = ICONS[name];
    return (
      <span className={`art-icon ${className}`} style={{ background: bg }} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
        <Icon strokeWidth={2.2} />
      </span>
    );
  }
  const src = asset(name);
  if (!src) return null;
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
}
