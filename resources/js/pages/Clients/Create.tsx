import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    AlertCircle,
    X
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Pathology {
    id: number;
    name: string;
    description: string | null;
}

interface Props {
    pathologies: Pathology[];
}

export default function CreateClient({ pathologies }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        birth_date: '',
        gender: '',
        status: 'active',
        notes: '',
        pathologies: [] as Array<{
            id: number;
            notes: string;
        }>,
    });

    const [selectedPathologies, setSelectedPathologies] = useState<Array<{
        id: number;
        name: string;
        notes: string;
    }>>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/clients');
    };

    const addPathology = (pathologyId: number) => {
        const pathology = pathologies.find(p => p.id === pathologyId);
        if (pathology && !selectedPathologies.find(sp => sp.id === pathologyId)) {
            setSelectedPathologies([...selectedPathologies, {
                id: pathologyId,
                name: pathology.name,
                notes: ''
            }]);
        }
    };

    const removePathology = (pathologyId: number) => {
        setSelectedPathologies(selectedPathologies.filter(sp => sp.id !== pathologyId));
    };

    const updatePathologyNotes = (pathologyId: number, notes: string) => {
        setSelectedPathologies(selectedPathologies.map(sp =>
            sp.id === pathologyId ? { ...sp, notes } : sp
        ));
    };

    // Actualizar data.pathologies cuando cambien las patologías seleccionadas
    React.useEffect(() => {
        setData('pathologies', selectedPathologies.map(sp => ({
            id: sp.id,
            notes: sp.notes
        })));
    }, [selectedPathologies]);

    return (
        <>
            <Head title="Nuevo Cliente" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/clients">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
                            <p className="text-muted-foreground">
                                Registra un nuevo cliente en el gimnasio
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información Personal */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información Personal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre completo *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nombre y apellidos"
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
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+34 600 000 000"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={data.birth_date}
                                            onChange={(e) => setData('birth_date', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Género</Label>
                                    <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar género" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Masculino</SelectItem>
                                            <SelectItem value="female">Femenino</SelectItem>
                                            <SelectItem value="other">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Estado</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Activo</SelectItem>
                                            <SelectItem value="inactive">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Dirección completa"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                    placeholder="Información adicional sobre el cliente..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patologías */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Patologías (Opcional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Seleccionar patologías</Label>
                                <Select onValueChange={(value) => addPathology(parseInt(value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Buscar patología..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pathologies.map((pathology) => (
                                            <SelectItem key={pathology.id} value={pathology.id.toString()}>
                                                {pathology.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedPathologies.length > 0 && (
                                <div className="space-y-3">
                                    <Label>Patologías seleccionadas</Label>
                                    {selectedPathologies.map((pathology) => (
                                        <div key={pathology.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline">{pathology.name}</Badge>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removePathology(pathology.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-sm">Notas específicas</Label>
                                                    <Textarea
                                                        value={pathology.notes}
                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updatePathologyNotes(pathology.id, e.target.value)}
                                                        placeholder="Notas sobre esta patología..."
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end space-x-4">
                        <Link href="/clients">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : 'Guardar Cliente'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
