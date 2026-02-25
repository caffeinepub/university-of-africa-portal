import React from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ChevronDown,
  LogOut,
  User,
  BookOpen,
  CreditCard,
  Home,
  Users,
  GraduationCap,
  ClipboardList,
  Bell,
  Building2,
  Receipt,
  BarChart3,
  Settings,
  UserCheck,
  Briefcase,
  ScrollText,
  DollarSign,
  BookMarked,
  Award,
} from 'lucide-react';

// Role-based service menu definitions
const studentServices = [
  { label: 'Dashboard', to: '/student' as const, icon: Home },
  { label: 'Course Registration', to: '/student/courses' as const, icon: BookOpen },
  { label: 'Fee Statement', to: '/student/fees' as const, icon: CreditCard },
  { label: 'Payment History', to: '/student/payments' as const, icon: Receipt },
  { label: 'My Results', to: '/student/results' as const, icon: Award },
  { label: 'Transcript', to: '/student/transcript' as const, icon: ScrollText },
  { label: 'Hostel Application', to: '/student/hostel' as const, icon: Building2 },
];

const staffServices = [
  { label: 'Dashboard', to: '/staff' as const, icon: Home },
];

const parentServices = [
  { label: 'Dashboard', to: '/parent' as const, icon: GraduationCap },
];

const adminServices = [
  { label: 'Dashboard', to: '/admin' as const, icon: Home },
  { label: 'Manage Students', to: '/admin/students' as const, icon: Users },
  { label: 'Manage Staff', to: '/admin/staff' as const, icon: Briefcase },
  { label: 'Courses & Programmes', to: '/admin/programmes' as const, icon: BookMarked },
  { label: 'Fee Management', to: '/admin/fees' as const, icon: DollarSign },
  { label: 'Admissions', to: '/admin/admissions' as const, icon: UserCheck },
  { label: 'Results Management', to: '/admin/results' as const, icon: BarChart3 },
  { label: 'Hostel Applications', to: '/admin/hostel' as const, icon: Building2 },
  { label: 'Announcements', to: '/admin/messaging' as const, icon: Bell },
];

type ServiceItem = {
  label: string;
  to: string;
  icon: React.ElementType;
};

function getServicesForRole(role: string | undefined): ServiceItem[] {
  switch (role) {
    case 'student': return studentServices;
    case 'staff': return staffServices;
    case 'parent': return parentServices;
    case 'admin': return adminServices;
    default: return [];
  }
}

function getRoleLabel(role: string | undefined) {
  switch (role) {
    case 'student': return 'Student Portal';
    case 'staff': return 'Staff Portal';
    case 'parent': return 'Parent Portal';
    case 'admin': return 'Admin Panel';
    default: return 'Portal';
  }
}

export default function Navigation() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: profile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const role = profile?.role as string | undefined;
  const services = getServicesForRole(role);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/generated/university-crest.dim_256x256.png"
            alt="University Crest"
            className="h-9 w-9 object-contain"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight text-foreground">University</p>
            <p className="text-xs text-muted-foreground leading-tight">Management System</p>
          </div>
        </Link>

        {/* Nav Links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admissions">Admissions</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admissions/check">Check Status</Link>
          </Button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                    {profile.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* Profile info */}
                <DropdownMenuLabel className="pb-1">
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">{profile.email}</p>
                  <p className="text-xs text-muted-foreground font-normal capitalize">
                    {getRoleLabel(role)}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Role-based services */}
                {services.length > 0 && (
                  <>
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider py-1">
                      My Services
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {services.map((service) => {
                        const Icon = service.icon;
                        const isActive =
                          currentPath === service.to ||
                          currentPath.startsWith(service.to + '/');
                        return (
                          <DropdownMenuItem
                            key={service.to}
                            onClick={() => navigate({ to: service.to as '/' })}
                            className={isActive ? 'bg-accent text-accent-foreground' : ''}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {service.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleAuth}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              className="gap-2"
            >
              {isLoggingIn ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Logging in...
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
