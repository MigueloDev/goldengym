import React from 'react';

interface CalendarProps {
  mode: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
}

export function Calendar({ selected, onSelect }: CalendarProps) {
  // Minimal calendar: native input date with local formatting
  const value = selected ? toInputValue(selected) : '';
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value; // yyyy-MM-dd
    if (!iso) return onSelect?.(undefined);
    const [y, m, d] = iso.split('-');
    onSelect?.(new Date(Number(y), Number(m) - 1, Number(d)));
  };
  return (
    <input
      type="date"
      value={value}
      onChange={handleChange}
      className="p-2"
    />
  );
}

function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}


