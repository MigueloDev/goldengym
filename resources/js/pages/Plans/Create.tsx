import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
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
    CreditCard,
    DollarSign,
    Calendar,
    Plus,
    X,
    AlertCircle
} from 'lucide-react';
import { plansBreadcrumbs } from '@/lib/breadcrumbs';
import AppLayout from '@/layouts/app-layout';

export default function CreatePlan() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        price_usd: '',
        renewal_period_days: '',
        status: 'active',
        features: [] as string[],
    });

    const [newFeature, setNewFeature] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/plans');
    };

    const addFeature = () => {
        if (newFeature.trim() && !data.features.includes(newFeature.trim())) {
            setData('features', [...data.features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setData('features', data.features.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    };

    return (
        <AppLayout breadcrumbs={plansBreadcrumbs.create()}>
            <Head title="Nuevo Plan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/plans">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Nuevo Plan</h1>
                            <p className="text-muted-foreground">
                                Crea un nuevo plan de membresía
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información del Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Información del Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del plan *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                        placeholder="Ej: Plan Básico, Plan Premium..."
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
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    placeholder="Descripción del plan..."
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

                    {/* Precios */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Precios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="price_usd">Precio en USD *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="price_usd"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price_usd}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('price_usd', e.target.value)}
                                            placeholder="0.00"
                                            className={`pl-10 ${errors.price_usd ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.price_usd && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.price_usd}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Precio en USD (Si paga en Bolivares) *</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.price}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('price', e.target.value)}
                                            placeholder="0.00"
                                            className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="renewal_period_days">Período de renovación (días) *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="renewal_period_days"
                                            type="number"
                                            min="1"
                                            value={data.renewal_period_days}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('renewal_period_days', e.target.value)}
                                            placeholder="30"
                                            className={`pl-10 ${errors.renewal_period_days ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.renewal_period_days && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.renewal_period_days}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Características */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Características (Opcional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Agregar característica</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={newFeature}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFeature(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ej: Acceso a todas las clases, Entrenador personal..."
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addFeature} disabled={!newFeature.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {data.features.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Características del plan</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {data.features.map((feature, index) => (
                                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="ml-1 hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end space-x-4">
                        <Link href="/plans">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : 'Guardar Plan'}
                        </Button>
                    </div>
                </form>
            </div>
          </div>
        </AppLayout>
    );
}
