import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetCallerUserProfile,
  useGetAllStudents,
  useGetCourses,
  useGetAllResults,
} from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import {
  Users,
  BookOpen,
  FileText,
  LayoutDashboard,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', href: '/staff' as const, icon: LayoutDashboard },
  { label: 'Students', href: '/staff' as const, icon: Users },
  { label: 'Results', href: '/staff' as const, icon: FileText },
  { label: 'Courses', href: '/staff' as const, icon: BookOpen },
];

const serviceCards = [
  { label: 'Students', href: '/staff' as const, icon: Users, desc: 'View student records' },
  { label: 'Post Results', href: '/staff' as const, icon: FileText, desc: 'Enter student grades' },
  { label: 'Courses', href: '/staff' as const, icon: BookOpen, desc: 'View course catalogue' },
];

export default function StaffDashboard() {
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
  const { data: allResults = [] } = useGetAllResults();

  // Loading state
  if (profileLoading || !profileFetched) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-2">
          <Skeleton className="h-6 w-32 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </aside>
        <div className="flex-1 p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
            There was an error loading your staff profile. Please try again.
          </p>
          <Button onClick={() => refetchProfile()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
          Staff Portal
        </p>
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome, {userProfile.name} · {userProfile.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Students
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
                <FileText className="h-4 w-4" /> Results Posted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{allResults.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Services grid */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {serviceCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
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
