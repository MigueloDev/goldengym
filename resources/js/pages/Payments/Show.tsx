import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    Trash2,
    DollarSign,
    CreditCard,
    Calendar,
    User,
    Image,
    X,
    Download,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { paymentsBreadcrumbs } from '@/lib/breadcrumbs';

interface PaymentEvidence {
    id: number;
    name: string;
    path: string;
    mime_type: string;
    size: number;
    type: string;
    created_at: string;
    url: string;
}

interface Payment {
    id: number;
    membership: {
        id: number;
        client: {
            id: number;
            name: string;
            email: string | null;
        };
        plan: {
            id: number;
            name: string;
            price: number;
            price_usd: number;
        };
        start_date: string;
        end_date: string;
        status: string;
        amount_paid: number;
        currency: 'local' | 'usd';
    };
    amount: number;
    currency: 'local' | 'usd';
    payment_date: string;
    payment_method: 'cash' | 'card' | 'transfer' | 'other';
    reference: string | null;
    notes: string | null;
    registered_by: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    method_color: string;
    method_label: string;
    payment_evidences: PaymentEvidence[];
}

interface Props {
    payment: Payment;
}

export default function ShowPayment({ payment }: Props) {
    const [selectedImage, setSelectedImage] = useState<PaymentEvidence | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que quieres eliminar este pago?')) {
            // Implementar eliminación
        }
    };

    const openImageModal = (evidence: PaymentEvidence) => {
        setSelectedImage(evidence);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setIsImageModalOpen(false);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatCurrency = (amount: number, currency: 'local' | 'usd' = 'local') => {
        const symbol = currency === 'usd' ? '$' : 'Bs';
        return `${symbol}${amount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800',
            suspended: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={paymentsBreadcrumbs.show(payment.id)}>
            <Head title={`Pago - ${payment.payable.client.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/payments">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Detalle del Pago</h1>
                            <p className="text-muted-foreground">
                                Información completa del pago registrado
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/payments/${payment.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Información Principal */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Información del Pago */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Información del Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-2">Monto</h4>
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.currency.toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Método de Pago</h4>
                                        <div className="flex items-center gap-2">
                                            <Badge className={payment.method_color}>{payment.method_label}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-2">Fecha de Pago</h4>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatDate(payment.payment_date)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Referencia</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.reference || 'Sin referencia'}
                                        </p>
                                    </div>
                                </div>

                                {payment.notes && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Notas</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Evidencias de Pago */}
                        {payment.payment_evidences && payment.payment_evidences.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Image className="h-5 w-5" />
                                        Evidencias de Pago ({payment.payment_evidences.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {payment.payment_evidences.map((evidence) => (
                                            <div key={evidence.id} className="relative group">
                                                <div className="aspect-square w-1/2 h-1/2 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 hover:border-gray-400 transition-colors">
                                                    {evidence.mime_type.startsWith('image/') ? (
                                                        <img
                                                            src={evidence.url}
                                                            alt={evidence.name}
                                                            className="w-1/2 h-1/2 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => openImageModal(evidence)}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <div className="text-center">
                                                                <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                                <p className="text-xs text-gray-500">{evidence.name}</p>
                                                                <p className="text-xs text-gray-400">{formatFileSize(evidence.size)}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium truncate">{evidence.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatFileSize(evidence.size)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Información de la Membresía */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Pago de {payment.payable_type === 'App\\Models\\MembershipRenewal' ? 'Renovación' : 'Membresía'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-2">Cliente</h4>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{payment.payable.client.name}</span>
                                        </div>
                                        {payment.payable.client.email && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {payment.payable.client.email}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Plan</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.payable.plan.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Precio: {formatCurrency(payment.payable.plan.price, 'usd')}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <h4 className="font-semibold mb-2">Estado</h4>
                                        {getStatusBadge(payment.membership.status)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Fecha de Inicio</h4>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(payment.membership.start_date)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Fecha de Fin</h4>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(payment.membership.end_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-2">Monto Pagado</h4>
                                        <p className="text-lg font-medium">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Moneda</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.currency.toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Información del Registro */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Información del Registro</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Registrado por:</span>
                                    <span className="text-sm font-medium">{payment.registered_by.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Fecha de registro:</span>
                                    <span className="text-sm font-medium">{formatDate(payment.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Última actualización:</span>
                                    <span className="text-sm font-medium">{formatDate(payment.updated_at)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acciones Rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/payments/${payment.id}/edit`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Pago
                                    </Button>
                                </Link>
                                {
                                  payment.payable_type === 'App\Models\MembershipRenewal' && (
                                    <Link href={`/memberships/${payment.payable.membership.id}`}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Ver Membresía
                                        </Button>
                                    </Link>
                                  )
                                }
                                {
                                  payment.payable_type === 'App\Models\Membership' && (
                                    <Link href={`/memberships/${payment.payable.id}`}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Ver Membresía
                                        </Button>
                                    </Link>
                                  )
                                }
                                <Link href={`/clients/${payment.payable.client.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <User className="mr-2 h-4 w-4" />
                                        Ver Cliente
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>


            {/* Modal para zoom de imágenes */}
            {isImageModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.name}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
                            <p className="text-sm font-medium">{selectedImage.name}</p>
                            <p className="text-xs opacity-75">{formatFileSize(selectedImage.size)}</p>
                        </div>
                    </div>
                </div>
            )}
            </div>
          </div>
        </AppLayout>
    );
}
