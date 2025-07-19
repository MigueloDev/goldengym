import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Stethoscope, CreditCard, FileText, Calendar, DollarSign } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Principal',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Clientes',
        href: '/clients',
        icon: Users,
    },
    {
        title: 'Patologías',
        href: '/pathologies',
        icon: Stethoscope,
    },
    {
        title: 'Planes',
        href: '/plans',
        icon: CreditCard,
    },
    {
        title: 'Membresías',
        href: '/memberships',
        icon: Calendar,
    },
    {
        title: 'Pagos',
        href: '/payments',
        icon: DollarSign,
    },
    {
        title: 'Documentos',
        href: '/document-templates',
        icon: FileText,
    },
];

const footerNavItems: NavItem[] = [
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
