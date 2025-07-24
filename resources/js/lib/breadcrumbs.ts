import { type BreadcrumbItem } from '@/types';

// Breadcrumb principal
export const dashboardBreadcrumb: BreadcrumbItem = {
    title: 'Principal',
    href: '/dashboard',
};

// Breadcrumbs base para módulos principales
export const clientsBreadcrumbs = {
    index: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Clientes',
            href: '/clients',
        },
    ],
    create: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Clientes',
            href: '/clients',
        },
        {
            title: 'Nuevo Cliente',
            href: '/clients/create',
        },
    ],
    show: (clientId: number, clientName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Clientes',
            href: '/clients',
        },
        {
            title: clientName,
            href: `/clients/${clientId}`,
        },
    ],
    edit: (clientId: number, clientName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Clientes',
            href: '/clients',
        },
        {
            title: clientName,
            href: `/clients/${clientId}`,
        },
        {
            title: 'Editar',
            href: `/clients/${clientId}/edit`,
        },
    ],
};

export const pathologiesBreadcrumbs = {
    index: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Patologías',
            href: '/pathologies',
        },
    ],
    create: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Patologías',
            href: '/pathologies',
        },
        {
            title: 'Nueva Patología',
            href: '/pathologies/create',
        },
    ],
    show: (pathologyId: number, pathologyName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Patologías',
            href: '/pathologies',
        },
        {
            title: pathologyName,
            href: `/pathologies/${pathologyId}`,
        },
    ],
    edit: (pathologyId: number, pathologyName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Patologías',
            href: '/pathologies',
        },
        {
            title: pathologyName,
            href: `/pathologies/${pathologyId}`,
        },
        {
            title: 'Editar',
            href: `/pathologies/${pathologyId}/edit`,
        },
    ],
};

export const plansBreadcrumbs = {
    index: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Planes',
            href: '/plans',
        },
    ],
    create: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Planes',
            href: '/plans',
        },
        {
            title: 'Nuevo Plan',
            href: '/plans/create',
        },
    ],
    show: (planId: number, planName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Planes',
            href: '/plans',
        },
        {
            title: planName,
            href: `/plans/${planId}`,
        },
    ],
    edit: (planId: number, planName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Planes',
            href: '/plans',
        },
        {
            title: planName,
            href: `/plans/${planId}`,
        },
        {
            title: 'Editar',
            href: `/plans/${planId}/edit`,
        },
    ],
};

export const membershipsBreadcrumbs = {
    index: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Membresías',
            href: '/memberships',
        },
    ],
    create: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Membresías',
            href: '/memberships',
        },
        {
            title: 'Nueva Membresía',
            href: '/memberships/create',
        },
    ],
    show: (membershipId: number, clientName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Membresías',
            href: '/memberships',
        },
        {
            title: `Membresía de ${clientName}`,
            href: `/memberships/${membershipId}`,
        },
    ],
    edit: (membershipId: number, clientName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Membresías',
            href: '/memberships',
        },
        {
            title: `Membresía de ${clientName}`,
            href: `/memberships/${membershipId}`,
        },
        {
            title: 'Editar',
            href: `/memberships/${membershipId}/edit`,
        },
    ],
};

export const paymentsBreadcrumbs = {
    index: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Pagos',
            href: '/payments',
        },
    ],
    create: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Pagos',
            href: '/payments',
        },
        {
            title: 'Nuevo Pago',
            href: '/payments/create',
        },
    ],
    show: (paymentId: number): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Pagos',
            href: '/payments',
        },
        {
            title: `Pago #${paymentId}`,
            href: `/payments/${paymentId}`,
        },
    ],
    edit: (paymentId: number): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Pagos',
            href: '/payments',
        },
        {
            title: `Pago #${paymentId}`,
            href: `/payments/${paymentId}`,
        },
        {
            title: 'Editar',
            href: `/payments/${paymentId}/edit`,
        },
    ],
  }

export const documentTemplatesBreadcrumbs = {
    index: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Documentos',
            href: '/document-templates',
        },
    ],
    create: (): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Documentos',
            href: '/document-templates',
        },
        {
            title: 'Nueva Plantilla',
            href: '/document-templates/create',
        },
    ],
    show: (templateId: number, templateName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Documentos',
            href: '/document-templates',
        },
        {
            title: templateName,
            href: `/document-templates/${templateId}`,
        },
    ],
    edit: (templateId: number, templateName: string): BreadcrumbItem[] => [
        dashboardBreadcrumb,
        {
            title: 'Documentos',
            href: '/document-templates',
        },
        {
            title: templateName,
            href: `/document-templates/${templateId}`,
        },
        {
            title: 'Editar',
            href: `/document-templates/${templateId}/edit`,
        },
    ],
};