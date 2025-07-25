import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    CreditCard,
    DollarSign,
    Calendar,
    Users,
    CheckCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { plansBreadcrumbs } from '@/lib/breadcrumbs';

interface Membership {
    id: number;
    start_date: string;
    end_date: string;
    status: string;
    client: {
        id: number;
        name: string;
        email: string | null;
    };
}

interface Plan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    price_usd: number;
    renewal_period_days: number;
    status: string;
    features: string[] | null;
    created_at: string;
    updated_at: string;
    memberships?: Membership[];
    active_memberships?: Membership[];
}

interface Props {
    plan: Plan;
}

export default function ShowPlan({ plan }: Props) {
    const formatPrice = (price: number, currency: 'USD' | 'VES' = 'VES') => {
        const formatter = new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-VE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        });
        return formatter.format(price);
    };

    const getDiscountPercentage = () => {
        if (plan.price <= 0) return 0;
        return Math.round(((plan.price - plan.price_usd) / plan.price) * 100);
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

    return (
        <AppLayout breadcrumbs={plansBreadcrumbs.show(plan.id, plan.name)}>
            <Head title={`Plan - ${plan.name}`} />
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
                              <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
                              <p className="text-muted-foreground">
                                  Información detallada del plan
                              </p>
                          </div>
                      </div>
                      <Link href={`/plans/${plan.id}/edit`}>
                          <Button>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar Plan
                          </Button>
                      </Link>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                      {/* Información Principal */}
                      <div className="md:col-span-2 space-y-6">
                          {/* Información del Plan */}
                          <Card>
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                      <CreditCard className="h-5 w-5" />
                                      Información del Plan
                                  </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                          <h3 className="text-xl font-semibold">{plan.name}</h3>
                                          <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                              {plan.status === 'active' ? 'Activo' : 'Inactivo'}
                                          </Badge>
                                      </div>
                                      {plan.description && (
                                          <p className="text-muted-foreground">
                                              {plan.description}
                                          </p>
                                      )}
                                  </div>

                                  <div className="grid gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center space-x-2">
                                          <Calendar className="h-4 w-4" />
                                          <span>Creado: {formatDate(plan.created_at)}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Calendar className="h-4 w-4" />
                                          <span>Actualizado: {formatDate(plan.updated_at)}</span>
                                      </div>
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
                              <CardContent>
                                  <div className="grid gap-4 md:grid-cols-2">
                                      <div className="p-4 border rounded-lg">
                                          <div className="flex items-center space-x-2 mb-2">
                                              <DollarSign className="h-5 w-5 text-green-600" />
                                              <h4 className="font-semibold">Precio en USD</h4>
                                          </div>
                                          <div className="text-2xl font-bold text-green-600">
                                              {formatPrice(plan.price_usd, 'USD')}
                                          </div>
                                      </div>
                                      <div className="p-4 border rounded-lg">
                                          <div className="flex items-center space-x-2 mb-2">
                                              <CreditCard className="h-5 w-5 text-blue-600" />
                                              <h4 className="font-semibold">Precio en USD (si paga en bolívares)</h4>
                                          </div>
                                          <div className="text-2xl font-bold text-blue-600">
                                              {formatPrice(plan.price, 'USD')}
                                          </div>
                                          {plan.price > plan.price_usd && (
                                              <Badge variant="outline" className="mt-2">
                                                  {getDiscountPercentage()}% descuento
                                              </Badge>
                                          )}
                                      </div>
                                  </div>
                                  <div className="mt-4 p-3 bg-muted rounded-lg">
                                      <div className="flex items-center space-x-2">
                                          <Calendar className="h-4 w-4" />
                                          <span className="font-medium">Período de renovación: {plan.renewal_period_days} días</span>
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>

                          {/* Características */}
                          {plan.features && plan.features.length > 0 && (
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                          <CheckCircle className="h-5 w-5" />
                                          Características del Plan
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="flex flex-wrap gap-2">
                                          {plan.features.map((feature, index) => (
                                              <Badge key={index} variant="outline" className="text-sm">
                                                  {feature}
                                              </Badge>
                                          ))}
                                      </div>
                                  </CardContent>
                              </Card>
                          )}

                          {/* Membresías */}
                          {plan.memberships && plan.memberships.length > 0 && (
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                          <Users className="h-5 w-5" />
                                          Membresías con este Plan ({plan.memberships.length})
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="space-y-3">
                                          {plan.memberships.map((membership) => (
                                              <div key={membership.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                  <div className="space-y-1">
                                                      <div className="flex items-center space-x-2">
                                                          <h4 className="font-medium">{membership.client.name}</h4>
                                                          <Badge variant={membership.status === 'active' ? 'default' : 'secondary'}>
                                                              {membership.status}
                                                          </Badge>
                                                      </div>
                                                      {membership.client.email && (
                                                          <p className="text-sm text-muted-foreground">
                                                              {membership.client.email}
                                                          </p>
                                                      )}
                                                      <p className="text-sm text-muted-foreground">
                                                          {formatDate(membership.start_date)} - {formatDate(membership.end_date)}
                                                      </p>
                                                  </div>
                                                  <Link href={`/clients/${membership.client.id}`}>
                                                      <Button variant="outline" size="sm">
                                                          Ver Cliente
                                                      </Button>
                                                  </Link>
                                              </div>
                                          ))}
                                      </div>
                                  </CardContent>
                              </Card>
                          )}
                      </div>

                      {/* Sidebar */}
                      <div className="space-y-6">
                          {/* Estado del Plan */}
                          <Card>
                              <CardHeader>
                                  <CardTitle className="text-sm">Estado del Plan</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <div className="text-center space-y-2">
                                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                                          {plan.status === 'active' ? 'Activo' : 'Inactivo'}
                                      </Badge>
                                      <p className="text-xs text-muted-foreground">
                                          {plan.status === 'active'
                                              ? 'El plan está disponible para nuevas membresías'
                                              : 'El plan no está disponible para nuevas membresías'
                                          }
                                      </p>
                                  </div>
                              </CardContent>
                          </Card>

                          {/* Estadísticas */}
                          <Card>
                              <CardHeader>
                                  <CardTitle className="text-sm">Estadísticas</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                  <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Total membresías:</span>
                                      <span className="text-sm font-medium">{plan.memberships?.length || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Membresías activas:</span>
                                      <span className="text-sm font-medium">{plan.active_memberships?.length || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Plan desde:</span>
                                      <span className="text-sm font-medium">{new Date(plan.created_at).toLocaleDateString('es-ES')}</span>
                                  </div>
                              </CardContent>
                          </Card>

                          {/* Acciones Rápidas */}
                          <Card>
                              <CardHeader>
                                  <CardTitle className="text-sm">Acciones</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                  <Link href={`/plans/${plan.id}/edit`}>
                                      <Button variant="outline" className="w-full justify-start">
                                          <Edit className="mr-2 h-4 w-4" />
                                          Editar Plan
                                      </Button>
                                  </Link>
                              </CardContent>
                          </Card>
                      </div>
                  </div>
              </div>
            </div>
        </AppLayout>
    );
}
