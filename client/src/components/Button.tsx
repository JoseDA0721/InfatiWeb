import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { asset } from '../lib/assets';

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger';
type Size = 'md' | 'lg' | 'xl';

interface Common {
  variant?: Variant;
  size?: Size;
  /** Ícono dibujado (lucide) o nombre de un pictograma del equipo. */
  icon?: ReactNode;
  picto?: string;
  iconEnd?: ReactNode;
  block?: boolean;
  children: ReactNode;
}

const cls = ({ variant = 'secondary', size = 'md', block }: Pick<Common, 'variant' | 'size' | 'block'>, extra?: string) =>
  ['btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', extra ?? ''].filter(Boolean).join(' ');

function Inner({ icon, picto, iconEnd, children }: Pick<Common, 'icon' | 'picto' | 'iconEnd' | 'children'>) {
  return (
    <>
      {picto ? <img className="btn__picto" src={asset(picto)} alt="" /> : icon}
      <span className="btn__label">{children}</span>
      {iconEnd}
    </>
  );
}

export function Button({
  variant,
  size,
  icon,
  picto,
  iconEnd,
  block,
  children,
  className,
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cls({ variant, size, block }, className)} {...rest}>
      <Inner icon={icon} picto={picto} iconEnd={iconEnd}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  picto,
  iconEnd,
  block,
  children,
  className,
  ...rest
}: Common & LinkProps) {
  return (
    <Link className={cls({ variant, size, block }, className)} {...rest}>
      <Inner icon={icon} picto={picto} iconEnd={iconEnd}>
        {children}
      </Inner>
    </Link>
  );
}
