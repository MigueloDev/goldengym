/**
 * Utilidades para formatear fechas en español sin problemas de zona horaria
 */

/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD) a formato español (1 de enero de 2025)
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @param options - Opciones de formato
 * @returns Fecha formateada en español
 */
export function formatDateToSpanish(
  dateString: string | null | undefined,
  options: {
    monthInUpperCase?: boolean;
    includeDay?: boolean;
  } = {}
): string {
  if (!dateString) return '';

  try {
    // Parsear la fecha directamente sin conversión de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);

    if (!year || !month || !day) {
      return '';
    }

    // Array de nombres de meses en español
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    // Obtener el mes (0-indexed en el array)
    const monthName = options.monthInUpperCase
      ? monthNames[month - 1].toUpperCase()
      : monthNames[month - 1];

    // Formatear fecha en español: "15 de enero de 2025"
    return options.includeDay === false
      ? `${monthName} de ${year}`
      : `${day} de ${monthName} de ${year}`;
  } catch {
    return '';
  }
}

/**
 * Convierte una fecha en formato ISO (YYYY-MM-DD) a un objeto Date sin problemas de zona horaria
 * @param dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns Objeto Date o null si la fecha es inválida
 */
export function isoToDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  try {
    // Parsear la fecha directamente sin conversión de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    // Crear la fecha con el día correcto, estableciendo la hora a mediodía
    // para evitar problemas con cambios de horario
    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1); // Los meses en JS son 0-indexed
    date.setDate(day);
    date.setHours(12, 0, 0, 0); // Mediodía para evitar problemas con cambios de horario

    return date;
  } catch {
    return null;
  }
}

/**
 * Convierte un objeto Date a formato ISO (YYYY-MM-DD) sin problemas de zona horaria
 * @param date - Objeto Date
 * @returns Fecha en formato ISO (YYYY-MM-DD) o cadena vacía si la fecha es inválida
 */
export function dateToIso(date: Date | null): string {
  if (!date) return '';

  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}
