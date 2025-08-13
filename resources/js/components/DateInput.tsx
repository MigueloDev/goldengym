import React from 'react';
import DatePicker from 'react-datepicker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import { CalendarIcon } from 'lucide-react';
import { formatDateToSpanish, isoToDate, dateToIso } from '@/helpers/date-formatter';

// Registrar el locale español
registerLocale('es', es);

interface DateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showFormattedDate?: boolean;
  format?: 'dd-mm-yyyy' | 'dd/mm/yyyy' | 'dd-mm-yy' | 'dd/mm/yy';
  placeholder?: string;
  dateFormat?: string;
  locale?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  showFormattedDate = true,
  format = 'dd-mm-yyyy',
  placeholder = 'Seleccionar fecha',
  dateFormat = 'dd/MM/yyyy',
  locale = 'es'
}) => {
  // Convertir string a Date para react-datepicker usando nuestra función de utilidad
  const selectedDate = isoToDate(value);

  // Convertir Date a string para el formulario usando nuestra función de utilidad
  const handleDateChange = (date: Date | null) => {
    onChange(dateToIso(date));
  };

      // Usar nuestra función de utilidad para formatear la fecha
  const formatDate = (dateString: string): string => {
    return formatDateToSpanish(dateString, { monthInUpperCase: false });
  };

  // Componente personalizado para el input con icono
  const CustomInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
    ({ value, onClick, onChange, disabled, ...props }, ref) => (
      <div className="relative w-full">
        <Input
          ref={ref}
          value={value as string}
          onChange={onChange}
          onClick={onClick}
          disabled={disabled}
          className="pr-10"
          {...props}
        />
        <CalendarIcon
          className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500",
            disabled ? "opacity-50" : "cursor-pointer"
          )}
          onClick={!disabled ? onClick : undefined}
        />
      </div>
    )
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {label}
      </Label>
      <div className="space-y-1">
        <DatePicker
          id={id}
          selected={selectedDate}
          onChange={handleDateChange}
          disabled={disabled}
          placeholderText={placeholder}
          dateFormat={dateFormat}

          locale={locale}
          customInput={<CustomInput />}
          wrapperClassName="w-full"
          popperClassName="z-50"
          popperPlacement="bottom-start"
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          yearDropdownItemNumber={100}
          scrollableYearDropdown
          minDate={new Date(1970, 0, 1)}
          maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
          previousMonthButtonLabel=""
          nextMonthButtonLabel=""
          previousYearButtonLabel=""
          nextYearButtonLabel=""
          previousYearAriaLabel="Año anterior"
          nextYearAriaLabel="Año siguiente"
          previousMonthAriaLabel="Mes anterior"
          nextMonthAriaLabel="Mes siguiente"
                    renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled
          }) => (
            <div className="flex items-center justify-between px-2 py-2">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                type="button"
                className="p-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                aria-label="Mes anterior"
              >
                ←
              </button>

              <div className="flex space-x-2">
                <select
                  value={date.getMonth()}
                  onChange={({ target: { value } }) => changeMonth(parseInt(value))}
                  className="p-1 text-sm bg-white border rounded uppercase"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(1950, i, 1).toLocaleString(locale, { month: 'long' })}
                    </option>
                  ))}
                </select>

                <select
                  value={date.getFullYear()}
                  onChange={({ target: { value } }) => changeYear(parseInt(value))}
                  className="p-1 text-sm bg-white border rounded max-h-40 overflow-y-auto"
                >
                  {Array.from({ length: new Date().getFullYear() - 1970 + 2 }, (_, i) => {
                    const year = 1970 + i;
                    return (
                      <option key={i} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                type="button"
                className="p-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                aria-label="Mes siguiente"
              >
                →
              </button>
            </div>
          )}
        />
        {showFormattedDate && value && (
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {formatDate(value)}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default DateInput;
