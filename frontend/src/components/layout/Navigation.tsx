import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '../../backend';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  GraduationCap,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  CreditCard,
  FileText,
  Home,
  Users,
  Bell,
  ClipboardList,
  Building2,
  Grid3X3,
} from 'lucide-react';

const studentLinks = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'Courses', href: '/student/courses', icon: BookOpen },
  { label: 'Results', href: '/student/results', icon: FileText },
  { label: 'Fee Statement', href: '/student/fees', icon: CreditCard },
  { label: 'Payment History', href: '/student/payments', icon: CreditCard },
  { label: 'Hostel', href: '/student/hostel', icon: Home },
  { label: 'Transcript', href: '/student/transcript', icon: FileText },
] as const;

const adminLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Programmes', href: '/admin/programmes', icon: BookOpen },
  { label: 'Fees', href: '/admin/fees', icon: CreditCard },
  { label: 'Admissions', href: '/admin/admissions', icon: ClipboardList },
  { label: 'Hostel', href: '/admin/hostel', icon: Building2 },
  { label: 'Messaging', href: '/admin/messaging', icon: Bell },
  { label: 'Results', href: '/admin/results', icon: FileText },
] as const;

const staffLinks = [
  { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { label: 'Students', href: '/staff/students', icon: Users },
  { label: 'Results', href: '/staff/results', icon: FileText },
  { label: 'Courses', href: '/staff/courses', icon: BookOpen },
] as const;

const parentLinks = [
  { label: 'Dashboard', href: '/parent', icon: LayoutDashboard },
] as const;

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const getRoleLinks = () => {
    if (!userProfile) return [];
    switch (userProfile.role) {
      case UserRole.admin: return adminLinks;
      case UserRole.student: return studentLinks;
      case UserRole.staff: return staffLinks;
      case UserRole.parent: return parentLinks;
      default: return [];
    }
  };

  const getDashboardPath = () => {
    if (!userProfile) return '/';
    switch (userProfile.role) {
      case UserRole.admin: return '/admin';
      case UserRole.student: return '/student';
      case UserRole.staff: return '/staff';
      case UserRole.parent: return '/parent';
      default: return '/';
    }
  };

  const roleLinks = getRoleLinks();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate({ to: isAuthenticated && userProfile ? getDashboardPath() : '/' })}
          className="flex items-center gap-2 font-bold text-lg text-primary hover:opacity-80 transition-opacity"
        >
          <GraduationCap className="h-6 w-6" />
          <span className="hidden sm:inline">UniPortal</span>
        </button>

        {/* Nav links for authenticated users */}
        {isAuthenticated && userProfile && (
          <nav className="hidden md:flex items-center gap-1">
            {roleLinks.slice(0, 5).map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => navigate({ to: link.href })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Public nav links for unauthenticated users */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate({ to: '/' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate({ to: '/admissions' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith('/admissions')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              Admissions
            </button>
            <button
              onClick={() => navigate({ to: '/portal' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/portal' || location.pathname.startsWith('/login/')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              Portals
            </button>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            profileLoading ? (
              // Show skeleton while profile is loading
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                      {userProfile.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{userProfile.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{userProfile.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: getDashboardPath() })}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  {roleLinks.slice(1).map((link) => {
                    const Icon = link.icon;
                    return (
                      <DropdownMenuItem key={link.href} onClick={() => navigate({ to: link.href })}>
                        <Icon className="h-4 w-4 mr-2" />
                        {link.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Authenticated but no profile — show logout button
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/portal' })}
                className="hidden sm:flex border-navy text-navy hover:bg-navy/5"
              >
                <Grid3X3 className="h-4 w-4 mr-1.5" />
                Portals
              </Button>
              <Button
                size="sm"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="bg-navy text-white hover:bg-navy/90"
              >
                {isLoggingIn ? 'Logging in...' : (
                  <>
                    <User className="h-4 w-4 mr-1.5" />
                    Login
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
