import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetCallerUserProfile,
  useGetAllStudents,
  useGetCourses,
  useGetFeeTypes,
  useGetAllAdmissionApplications,
} from '../../hooks/useQueries';
import { AdmissionStatus } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import AdminSetupCard from '../../components/admin/AdminSetupCard';
import AdminProfileCard from '../../components/admin/AdminProfileCard';
import {
  Users,
  BookOpen,
  CreditCard,
  ClipboardList,
  Building2,
  Bell,
  FileText,
  LayoutDashboard,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Programmes', href: '/admin/programmes', icon: BookOpen },
  { label: 'Fees', href: '/admin/fees', icon: CreditCard },
  { label: 'Admissions', href: '/admin/admissions', icon: ClipboardList },
  { label: 'Hostel', href: '/admin/hostel', icon: Building2 },
  { label: 'Messaging', href: '/admin/messaging', icon: Bell },
  { label: 'Results', href: '/admin/results', icon: FileText },
] as const;

const serviceCards = [
  { label: 'Students', href: '/admin/students', icon: Users, desc: 'Manage student records' },
  { label: 'Programmes', href: '/admin/programmes', icon: BookOpen, desc: 'Manage courses' },
  { label: 'Fees', href: '/admin/fees', icon: CreditCard, desc: 'Configure fee types' },
  { label: 'Admissions', href: '/admin/admissions', icon: ClipboardList, desc: 'Review applications' },
  { label: 'Hostel', href: '/admin/hostel', icon: Building2, desc: 'Hostel applications' },
  { label: 'Messaging', href: '/admin/messaging', icon: Bell, desc: 'Send announcements' },
  { label: 'Results', href: '/admin/results', icon: FileText, desc: 'Post student results' },
] as const;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    error: profileError,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  const { data: students = [] } = useGetAllStudents();
  const { data: courses = [] } = useGetCourses();
  const { data: feeTypes = [] } = useGetFeeTypes();
  const { data: admissions = [] } = useGetAllAdmissionApplications();

  const pendingAdmissions = admissions.filter(
    (a) => String(a.status) === AdmissionStatus.pending
  ).length;

  // Determine if admin setup is needed (profile exists but role check)
  const needsSetup = profileFetched && !userProfile;

  // Loading state
  if (profileLoading || !profileFetched) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-2">
          <Skeleton className="h-6 w-32 mb-4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </aside>
        <div className="flex-1 p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load profile</h2>
          <p className="text-muted-foreground text-sm">
            There was an error loading your admin profile. Please try again.
          </p>
          <Button onClick={() => refetchProfile()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No profile yet — show setup UI
  if (needsSetup) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Admin Panel
          </p>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.href}
                onClick={() => navigate({ to: link.href })}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </button>
            );
          })}
        </aside>
        <div className="flex-1 p-6 space-y-6 overflow-auto max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Complete your admin account setup to get started.
            </p>
          </div>
          <AdminSetupCard />
          <AdminProfileCard />
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Admin Panel
        </p>
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => navigate({ to: link.href })}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </button>
          );
        })}
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Welcome, {userProfile.name} · {userProfile.email}
            </p>
          </div>
          {/* Compact profile card in header area */}
          <div className="sm:w-72 shrink-0">
            <AdminProfileCard />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{courses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Fee Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{feeTypes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Pending Admissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${pendingAdmissions > 0 ? 'text-amber-500' : 'text-primary'}`}>
                {pendingAdmissions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services grid */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Management Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {serviceCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.href}
                  onClick={() => navigate({ to: card.href })}
                  className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all text-left"
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{card.label}</p>
                    <p className="text-xs text-muted-foreground">{card.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground self-end mt-auto group-hover:text-primary transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
