import { Undo2 } from 'lucide-react';
import { PICTURE_KEYS, PICTURE_LABEL, pictureAsset } from '../lib/assets';

interface PictureKeyProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
}

/** Clave con imágenes: se tocan 3 dibujos en orden. Alternativa a escribir. */
export function PictureKey({ value, onChange, length = 3 }: PictureKeyProps) {
  return (
    <div className="picture-key">
      <div className="picture-key__slots" aria-live="polite">
        {Array.from({ length }, (_, i) => {
          const key = value[i];
          return (
            <span key={i} className={`picture-key__slot ${key ? 'is-filled' : ''}`}>
              {key ? <img src={pictureAsset(key)} alt={PICTURE_LABEL[key]} /> : <span className="num">{i + 1}</span>}
            </span>
          );
        })}
        <button
          type="button"
          className="btn btn--ghost btn--md"
          onClick={() => onChange(value.slice(0, -1))}
          disabled={value.length === 0}
        >
          <Undo2 aria-hidden="true" className="btn__icon" />
          <span className="btn__label">Quitar</span>
        </button>
      </div>
      <div className="picture-key__grid" role="group" aria-label="Elige 3 imágenes en orden">
        {PICTURE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="picture-key__option"
            disabled={value.length >= length}
            onClick={() => onChange([...value, key])}
          >
            <img src={pictureAsset(key)} alt="" />
            <span>{PICTURE_LABEL[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
