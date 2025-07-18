import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowLeft,
    Save,
    AlertTriangle,
    AlertCircle
} from 'lucide-react';

interface Pathology {
    id: number;
    name: string;
    description: string | null;
}

interface Props {
    pathology: Pathology;
}

export default function EditPathology({ pathology }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: pathology.name,
        description: pathology.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/pathologies/${pathology.id}`);
    };

    return (
        <>
            <Head title={`Editar Patología - ${pathology.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/pathologies">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Editar Patología</h1>
                            <p className="text-muted-foreground">
                                Actualiza la información de la patología
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información de la Patología */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Información de la Patología
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre de la patología *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                    placeholder="Ej: Diabetes, Hipertensión, Artritis..."
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción (Opcional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    placeholder="Descripción adicional sobre la patología..."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end space-x-4">
                        <Link href="/pathologies">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : 'Actualizar Patología'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
