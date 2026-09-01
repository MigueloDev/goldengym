import React from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export interface RestorableClient {
  id: number;
  name: string;
  email: string | null;
  identification_number: string | null;
  deleted_at: string | null;
  summary: {
    memberships: number;
    payments: number;
    documents: number;
    pathologies: number;
  };
  from_membership?: boolean;
}

interface Props {
  client: RestorableClient;
  /** Se envía a restore() para que devuelva el cliente al formulario de membresía */
  fromMembership?: boolean;
  onRestored?: (client: { id: number; name: string; email: string }) => void;
}

export default function RestorableClientAlert({ client, fromMembership = false, onRestored }: Props) {
  const [processing, setProcessing] = React.useState(false);

  const handleRestore = () => {
    setProcessing(true);
    router.post(`/clients/${client.id}/restore`, { fromMembership }, {
      preserveScroll: true,
      onSuccess: (response) => {
        /* @ts-expect-error Inertia response type */
        const restored = response.props.flash?.client;
        if (onRestored && restored) {
          onRestored(restored as { id: number; name: string; email: string });
        }
      },
      onFinish: () => setProcessing(false),
    });
  };

  const deletedAt = client.deleted_at
    ? new Date(client.deleted_at.replace(' ', 'T')).toLocaleDateString('es-VE')
    : null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Este cliente ya existe, pero está eliminado</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>
            <strong>{client.name}</strong>
            {client.identification_number ? ` · ${client.identification_number}` : ''}
            {client.email ? ` · ${client.email}` : ''}
            {deletedAt ? ` · eliminado el ${deletedAt}` : ''}
          </p>
          <p>
            Al reactivarlo recuperas su historial: {client.summary.memberships} membresía(s),{' '}
            {client.summary.payments} pago(s), {client.summary.documents} documento(s) y{' '}
            {client.summary.pathologies} patología(s).
          </p>
          <Button type="button" size="sm" onClick={handleRestore} disabled={processing}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {processing ? 'Reactivando...' : 'Reactivar este cliente'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
