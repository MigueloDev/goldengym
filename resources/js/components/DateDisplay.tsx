import React from 'react';

interface DateDisplayProps {
  date: string | null | undefined;
  format?: 'dd-mm-yyyy' | 'dd/mm/yyyy' | 'dd-mm-yy' | 'dd/mm/yy';
  className?: string;
  fallback?: string;
}

const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = 'dd-mm-yyyy',
  className = '',
  fallback = '-'
}) => {
  if (!date) {
    return <span className={className}>{fallback}</span>;
  }

  const formatDate = (dateString: string): string => {
    try {
      const dateObj = new Date(dateString);

      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return fallback;
      }

      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const shortYear = year.toString().slice(-2);

      switch (format) {
        case 'dd-mm-yyyy':
          return `${day}-${month}-${year}`;
        case 'dd/mm/yyyy':
          return `${day}/${month}/${year}`;
        case 'dd-mm-yy':
          return `${day}-${month}-${shortYear}`;
        case 'dd/mm/yy':
          return `${day}/${month}/${shortYear}`;
        default:
          return `${day}-${month}-${year}`;
      }
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return fallback;
    }
  };

  return (
    <span className={className}>
      {formatDate(date)}
    </span>
  );
};

export default DateDisplay;
