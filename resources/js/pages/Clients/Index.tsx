import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Plus,
    Search,
    Filter,
    Users,
    UserCheck,
    Clock,
    AlertTriangle,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    Calendar,
    MapPin,
    FileText
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import GenerateDocumentModal from '@/components/generate-document-modal';

interface Client {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    birth_date: string | null;
    gender: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    active_membership?: {
        id: number;
        end_date: string;
        plan: {
            name: string;
        };
    };
    pathologies: Array<{
        id: number;
        name: string;
        pivot: {
            notes: string | null;
        };
    }>;
    memberships_count: number;
}

interface DocumentTemplate {
    id: number;
    name: string;
    description: string | null;
    status: 'active' | 'inactive';
}

interface Props {
    clients: {
        data: Client[];
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
        status?: string;
        membership_status?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    stats: {
        total: number;
        active: number;
        with_membership: number;
        expiring_soon: number;
    };
    documentTemplates: DocumentTemplate[];
}

export default function ClientsIndex({ clients, filters, stats, documentTemplates }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [membershipStatus, setMembershipStatus] = useState(filters.membership_status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.sort_direction || 'desc');

    const handleSearch = () => {
        router.get('/clients', {
            search,
            status,
            membership_status: membershipStatus,
            sort_by: sortBy,
            sort_direction: sortDirection,
        }, { preserveState: true });
    };

    const handleDelete = (clientId: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            router.delete(`/clients/${clientId}`);
        }
    };

    const getMembershipStatusColor = (client: Client): 'secondary' | 'destructive' | 'warning' | 'success' => {
        if (!client.active_membership) return 'secondary';
        const endDate = new Date(client.active_membership.end_date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'destructive';
        if (daysUntilExpiry <= 3) return 'warning';
        return 'success';
    };

    const getMembershipStatusText = (client: Client) => {
        if (!client.active_membership) return 'Sin membresía';
        const endDate = new Date(client.active_membership.end_date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'Expirada';
        if (daysUntilExpiry <= 3) return 'Expira pronto';
        return 'Activa';
    };

    const getAge = (birthDate: string | null) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <>
            <Head title="Clientes" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                        <p className="text-muted-foreground">
                            Gestiona todos los clientes del gimnasio
                        </p>
                    </div>
                    <Link href="/clients/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Con Membresía</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.with_membership}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expiran Pronto</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.expiring_soon}</div>
                        </CardContent>
                    </Card>
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
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Buscar</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Nombre, email o teléfono..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos</SelectItem>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="inactive">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Membresía</label>
                                <Select value={membershipStatus} onValueChange={setMembershipStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las membresías" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas</SelectItem>
                                        <SelectItem value="active">Activa</SelectItem>
                                        <SelectItem value="expired">Expirada</SelectItem>
                                        <SelectItem value="expiring_soon">Expira pronto</SelectItem>
                                        <SelectItem value="no_membership">Sin membresía</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ordenar por</label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">Fecha de registro</SelectItem>
                                        <SelectItem value="name">Nombre</SelectItem>
                                        <SelectItem value="status">Estado</SelectItem>
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
                                        <SelectItem value="desc">Descendente</SelectItem>
                                        <SelectItem value="asc">Ascendente</SelectItem>
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

                {/* Clients List */}
                <div className="grid gap-4">
                    {clients.data.map((client) => (
                        <Card key={client.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback>
                                                {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-semibold">{client.name}</h3>
                                                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                                    {client.status === 'active' ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                                <Badge variant={getMembershipStatusColor(client)}>
                                                    {getMembershipStatusText(client)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                {client.email && (
                                                    <div className="flex items-center space-x-1">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{client.email}</span>
                                                    </div>
                                                )}
                                                {client.phone && (
                                                    <div className="flex items-center space-x-1">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                )}
                                                {client.birth_date && (
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{getAge(client.birth_date)} años</span>
                                                    </div>
                                                )}
                                                {client.address && (
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{client.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {client.pathologies.length > 0 && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium">Patologías:</span>
                                                    <div className="flex space-x-1">
                                                        {client.pathologies.slice(0, 3).map((pathology) => (
                                                            <Badge key={pathology.id} variant="outline" className="text-xs">
                                                                {pathology.name}
                                                            </Badge>
                                                        ))}
                                                        {client.pathologies.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{client.pathologies.length - 3} más
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <GenerateDocumentModal
                                            clientId={client.id}
                                            clientName={client.name}
                                            templates={documentTemplates}
                                            trigger={
                                                <Button variant="outline" size="sm">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                        <Link href={`/clients/${client.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/clients/${client.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(client.id)}
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
                {clients.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination
                            currentPage={clients.current_page}
                            totalPages={clients.last_page}
                            onPageChange={(page: number) => {
                                router.get('/clients', {
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
