import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus,
    Search,
    Filter,
    AlertTriangle,
    Eye,
    Edit,
    Trash2,
    Users
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';

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

export default function PathologiesIndex({ pathologies, filters, stats }: Props) {
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

    return (
        <>
            <Head title="Patologías" />

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

                {/* Stats Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patologías</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            Patologías registradas en el sistema
                        </p>
                    </CardContent>
                </Card>

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

                {/* Pathologies List */}
                <div className="grid gap-4">
                    {pathologies.data.map((pathology) => (
                        <Card key={pathology.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-semibold">{pathology.name}</h3>
                                            <Badge variant="outline">
                                                <Users className="mr-1 h-3 w-3" />
                                                {pathology.clients_count || 0} clientes
                                            </Badge>
                                        </div>
                                        {pathology.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {pathology.description}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                            <span>Creada: {new Date(pathology.created_at).toLocaleDateString('es-ES')}</span>
                                            <span>Actualizada: {new Date(pathology.updated_at).toLocaleDateString('es-ES')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
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
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

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
        </>
    );
}
