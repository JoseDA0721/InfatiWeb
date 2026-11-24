import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { PinPad } from './PinPad';
import { ProgressBar } from './ProgressBar';
import { Stars } from './Stars';
import { WeeklyGoal } from './WeeklyGoal';

describe('Stars', () => {
  it('anuncia las estrellas con texto, no solo con imágenes', () => {
    render(<Stars count={2} />);
    expect(screen.getByRole('img', { name: '2 de 3 estrellas' })).toBeInTheDocument();
  });
});

describe('ProgressBar', () => {
  it('expone valor y texto equivalente', () => {
    render(<ProgressBar value={68} label="Avance" valueText="68 de 100 XP" />);
    const bar = screen.getByRole('progressbar', { name: 'Avance' });
    expect(bar).toHaveAttribute('aria-valuenow', '68');
    expect(bar).toHaveAttribute('aria-valuetext', '68 de 100 XP');
  });
});

describe('WeeklyGoal', () => {
  it('muestra cuántas aventuras faltan sin presionar', () => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((label, i) => ({
      key: String(i),
      label,
      short: label[0],
      played: i < 2,
      isToday: i === 2,
    }));
    render(<WeeklyGoal weekly={{ goal: 5, completed: 4, reached: false, days }} />);
    expect(screen.getByText('Una aventura más y ganarás la insignia Constancia.')).toBeInTheDocument();
    expect(screen.getByLabelText('Lunes: jugaste')).toBeInTheDocument();
    expect(screen.getByLabelText('Miércoles: sin juego (hoy)')).toBeInTheDocument();
  });
});

describe('PinPad', () => {
  function Harness() {
    const [pin, setPin] = useState('');
    return (
      <>
        <PinPad value={pin} onChange={setPin} />
        <output data-testid="pin">{pin}</output>
      </>
    );
  }

  it('escribe con toques y con el teclado, y nunca muestra los números', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.keyDown(window, { key: '4' });
    expect(screen.getByTestId('pin').textContent).toBe('24');
    expect(screen.getByRole('img', { name: 'PIN de familia: 2 de 4 números escritos' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(screen.getByTestId('pin').textContent).toBe('2');
  });
});
