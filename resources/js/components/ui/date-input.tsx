import React from 'react';
import { Input } from '@/components/ui/input';

type DisplayFormat = 'dd-mm-yyyy' | 'yyyy-mm-dd';

interface DateInputProps {
  id?: string;
  name?: string;
  value: string; // Expected ISO format 'YYYY-MM-DD' or ''
  onChange: (value: string) => void; // Emits ISO 'YYYY-MM-DD' or ''
  displayFormat?: DisplayFormat;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function DateInput({
  id,
  name,
  value,
  onChange,
  displayFormat = 'dd-mm-yyyy',
  placeholder,
  className,
  disabled,
}: DateInputProps) {
  const [textValue, setTextValue] = React.useState<string>('');

  React.useEffect(() => {
    setTextValue(value ? isoToDisplay(value, displayFormat) : '');
  }, [value, displayFormat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskToFormat(e.target.value, displayFormat);
    setTextValue(masked);

    const iso = displayToIso(masked, displayFormat);
    if (iso) {
      onChange(iso);
    } else if (masked.trim() === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    const iso = displayToIso(textValue, displayFormat);
    if (iso) {
      // Normalize display
      setTextValue(isoToDisplay(iso, displayFormat));
    }
  };

  const pattern = displayFormat === 'dd-mm-yyyy' ? '\\d{2}-\\d{2}-\\d{4}' : '\\d{4}-\\d{2}-\\d{2}';

  return (
    <Input
      id={id}
      name={name}
      value={textValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={
        placeholder ?? (displayFormat === 'dd-mm-yyyy' ? 'dd-mm-aaaa' : 'aaaa-mm-dd')
      }
      inputMode="numeric"
      pattern={pattern}
      className={className}
      disabled={disabled}
    />
  );
}

function isoToDisplay(iso: string, format: DisplayFormat): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return format === 'dd-mm-yyyy' ? `${pad(d)}-${pad(m)}-${y}` : `${y}-${pad(m)}-${pad(d)}`;
}

function displayToIso(display: string, format: DisplayFormat): string | null {
  const digits = display.replace(/[^\d]/g, '');
  if (format === 'dd-mm-yyyy') {
    if (digits.length < 8) return null;
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    if (!isValidDateParts(year, month, day)) return null;
    return `${year}-${pad(month)}-${pad(day)}`;
  } else {
    if (digits.length < 8) return null;
    const year = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    const day = digits.slice(6, 8);
    if (!isValidDateParts(year, month, day)) return null;
    return `${year}-${pad(month)}-${pad(day)}`;
  }
}

function maskToFormat(raw: string, format: DisplayFormat): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (format === 'dd-mm-yyyy') {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    let out = dd;
    if (mm) out += `-${mm}`;
    if (yyyy) out += `-${yyyy}`;
    return out;
  } else {
    const yyyy = digits.slice(0, 4);
    const mm = digits.slice(4, 6);
    const dd = digits.slice(6, 8);
    let out = yyyy;
    if (mm) out += `-${mm}`;
    if (dd) out += `-${dd}`;
    return out;
  }
}

function pad(value: string | number): string {
  return String(value).padStart(2, '0');
}

function isValidDateParts(yearStr: string, monthStr: string, dayStr: string): boolean {
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return false;

  // Basic validation accounting for different month lengths and leap years
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}


