import React, { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ArrowLeft,
    Upload,
    Download,
    Trash2,
    FileText,
    FileImage,
    File,
    Plus,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { clientsBreadcrumbs } from '@/lib/breadcrumbs';

interface File {
    id: number;
    name: string;
    path: string;
    mime_type: string;
    size: number;
    type: string;
    created_at: string;
    url: string;
}

interface Client {
    id: number;
    name: string;
    email: string | null;
}

interface DocumentCounts {
    total: number;
    generated: number;
    custom: number;
    documents: number;
}

interface Props {
    client: Client;
    documents: File[];
    documentCounts: DocumentCounts;
}

export default function ClientDocumentsIndex({ client, documents, documentCounts }: Props) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        document: null as File | null,
        name: '',
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setData('document', file);
            setData('name', file.name.replace(/\.[^/.]+$/, '')); // Remover extensión
        }
    };

    const handleUpload = () => {
        if (!data.document) return;

        post(route('clients.documents.store', client.id), {
            onSuccess: () => {
                setIsUploadModalOpen(false);
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleDelete = (document: File) => {
        setDocumentToDelete(document);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!documentToDelete) return;

        router.delete(route('clients.documents.destroy', [client.id, documentToDelete.id]), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDocumentToDelete(null);
            },
        });
    };

    const handleDownload = (document: File) => {
        window.open(route('clients.documents.download', [client.id, document.id]), '_blank');
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return <FileImage className="h-4 w-4" />;
        }
        if (mimeType === 'application/pdf') {
            return <FileText className="h-4 w-4" />;
        }
        return <File className="h-4 w-4" />;
    };

    const getDocumentTypeLabel = (type: string) => {
        switch (type) {
            case 'generated_document':
                return { label: 'Generado', variant: 'default' as const };
            case 'custom_document':
                return { label: 'Personalizado', variant: 'secondary' as const };
            case 'document':
                return { label: 'Documento', variant: 'outline' as const };
            default:
                return { label: 'Otro', variant: 'outline' as const };
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const breadcrumbs = [
        ...clientsBreadcrumbs.index(),
        {
            title: client.name,
            href: `/clients/${client.id}`,
        },
        {
            title: 'Documentos',
            href: `/clients/${client.id}/documents`,
        },
    ];

    const canUpload = documentCounts.total < 10;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Documentos - ${client.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={`/clients/${client.id}`}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Documentos de {client.name}</h1>
                                <p className="text-muted-foreground">
                                    Gestiona los documentos del cliente
                                </p>
                            </div>
                        </div>
                        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                            <DialogTrigger asChild>
                                <Button disabled={!canUpload}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Subir Documento
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Subir Documento</DialogTitle>
                                    <DialogDescription>
                                        Sube un nuevo documento para {client.name}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="document">Archivo</Label>
                                        <Input
                                            ref={fileInputRef}
                                            id="document"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                            onChange={handleFileSelect}
                                            className="cursor-pointer"
                                        />
                                        {errors.document && (
                                            <p className="text-sm text-destructive">{errors.document}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre del documento</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Nombre del documento"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name}</p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleUpload} disabled={processing || !data.document}>
                                        {processing ? 'Subiendo...' : 'Subir Documento'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Total</p>
                                        <p className="text-2xl font-bold">{documentCounts.total}/10</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">Generados</p>
                                        <p className="text-2xl font-bold">{documentCounts.generated}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium">Personalizados</p>
                                        <p className="text-2xl font-bold">{documentCounts.custom}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    {canUpload ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">Estado</p>
                                        <p className="text-sm font-medium">
                                            {canUpload ? 'Puede subir' : 'Límite alcanzado'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerta de límite */}
                    {!canUpload && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                El cliente ya tiene el máximo de 10 documentos permitidos.
                                Elimina algunos documentos antes de subir nuevos.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Lista de documentos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos ({documents.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {documents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay documentos para mostrar</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {documents.map((document) => {
                                        const typeInfo = getDocumentTypeLabel(document.type);
                                        return (
                                            <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    {getFileIcon(document.mime_type)}
                                                    <div>
                                                        <p className="font-medium">{document.name}</p>
                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                            <span>{formatFileSize(document.size)}</span>
                                                            <span>•</span>
                                                            <span>{formatDate(document.created_at)}</span>
                                                            <span>•</span>
                                                            <Badge variant={typeInfo.variant}>
                                                                {typeInfo.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownload(document)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(document)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Modal de confirmación de eliminación */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Eliminar Documento</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que quieres eliminar "{documentToDelete?.name}"?
                                Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
