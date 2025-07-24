import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/components/ui/toast';

export function useInertiaErrors() {
  const { props } = usePage();
  const { addToast } = useToast();

  useEffect(() => {
    // Capturar errores de validación
    if (props.errors && Object.keys(props.errors).length > 0) {
      const errorMessages = Object.values(props.errors).flat();
      addToast({
        type: 'error',
        title: 'Errores de validación',
        message: errorMessages.join(', '),
      });
    }

    // Capturar mensajes de error generales
    if (props.error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: props.error as string,
      });
    }

    // Capturar mensajes de éxito
    if (props.success) {
      addToast({
        type: 'success',
        title: 'Éxito',
        message: props.success as string,
      });
    }

    // Capturar mensajes de advertencia
    if (props.warning) {
      addToast({
        type: 'warning',
        title: 'Advertencia',
        message: props.warning as string,
      });
    }

    // Capturar mensajes informativos
    if (props.info) {
      addToast({
        type: 'info',
        title: 'Información',
        message: props.info as string,
      });
    }
  }, [props.errors, props.error, props.success, props.warning, props.info, addToast]);
}
