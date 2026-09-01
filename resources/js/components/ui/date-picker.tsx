import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface DatePickerProps {
  id?: string;
  name?: string;
  value: string; // ISO 'yyyy-MM-dd' or ''
  onChange: (value: string) => void; // ISO 'yyyy-MM-dd' or ''
  displayFormatString?: string; // e.g. 'dd-MM-yyyy' or 'dd/MM/yyyy'
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function DatePicker({
  id,
  name,
  value,
  onChange,
  displayFormatString = 'dd-MM-yyyy',
  placeholder = 'Selecciona una fecha',
  className,
  disabled,
}: DatePickerProps) {
  const selectedDate = React.useMemo(() => isoToLocalDate(value), [value]);
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange(localDateToIso(date));
    setOpen(false);
  };

  const label = selectedDate ? formatLocal(selectedDate, displayFormatString) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          name={name}
          type="button"
          variant="outline"
          className={`w-[240px] justify-start text-left font-normal ${className ?? ''}`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar

          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function isoToLocalDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-');
  const year = Number(y);
  const monthIndex = Number(m) - 1;
  const day = Number(d);
  if (!year || monthIndex < 0 || day < 1) return undefined;
  // Construct local date (no timezone shift issues)
  return new Date(year, monthIndex, day);
}

function localDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocal(date: Date, formatString: string): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const sep = formatString.includes('/') ? '/' : '-';
  // Only supports dd-MM-yyyy or dd/MM/yyyy
  return `${day}${sep}${month}${sep}${year}`;
}


