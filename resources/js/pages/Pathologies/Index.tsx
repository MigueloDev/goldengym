import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Users
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { pathologiesBreadcrumbs } from '@/lib/breadcrumbs';

interface Pathology {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    clients_count?: number;
}

interface Props {
    pathologies: {
        data: Pathology[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    stats: {
        total: number;
    };
}

export default function PathologiesIndex({ pathologies, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'asc');

    const handleSearch = () => {
        router.get('/pathologies', {
            search,
            sort_by: sortBy,
            sort_direction: sortDirection,
        }, { preserveState: true });
    };

    const handleDelete = (pathologyId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta patología?')) {
            router.delete(`/pathologies/${pathologyId}`);
        }
    };

    const breadcrumbs = pathologiesBreadcrumbs.index();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patologías" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Patologías</h1>
                            <p className="text-muted-foreground">
                                Gestiona las patologías disponibles para los clientes
                            </p>
                        </div>
                        <Link href="/pathologies/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Patología
                            </Button>
                        </Link>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filtros
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Buscar</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar patología..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ordenar por</label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Nombre</SelectItem>
                                            <SelectItem value="created_at">Fecha de creación</SelectItem>
                                            <SelectItem value="updated_at">Fecha de actualización</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Dirección</label>
                                    <Select value={sortDirection} onValueChange={setSortDirection}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asc">Ascendente</SelectItem>
                                            <SelectItem value="desc">Descendente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Button onClick={handleSearch}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Aplicar Filtros
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pathologies Table */}
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Clientes</TableHead>
                                        <TableHead>Creada</TableHead>
                                        <TableHead>Actualizada</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pathologies.data.map((pathology) => (
                                        <TableRow key={pathology.id}>
                                            <TableCell className="font-medium">
                                                {pathology.name}
                                            </TableCell>
                                            <TableCell>
                                                {pathology.description ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        {pathology.description}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">
                                                        Sin descripción
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    <Users className="mr-1 h-3 w-3" />
                                                    {pathology.clients_count || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(pathology.created_at).toLocaleDateString('es-ES')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(pathology.updated_at).toLocaleDateString('es-ES')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link href={`/pathologies/${pathology.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/pathologies/${pathology.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(pathology.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {pathologies.last_page > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                currentPage={pathologies.current_page}
                                totalPages={pathologies.last_page}
                                onPageChange={(page: number) => {
                                    router.get('/pathologies', {
                                        ...filters,
                                        page,
                                    }, { preserveState: true });
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
