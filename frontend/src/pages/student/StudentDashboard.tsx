import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetCourses, useGetResults, useCheckUnpaidFees } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import {
  BookOpen,
  FileText,
  CreditCard,
  Home,
  GraduationCap,
  AlertCircle,
  ChevronRight,
  ClipboardList,
  Printer,
  RefreshCw,
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', href: '/student', icon: GraduationCap },
  { label: 'My Courses', href: '/student/courses', icon: BookOpen },
  { label: 'Results', href: '/student/results', icon: FileText },
  { label: 'Fee Statement', href: '/student/fees', icon: CreditCard },
  { label: 'Payment History', href: '/student/payments', icon: CreditCard },
  { label: 'Hostel Application', href: '/student/hostel', icon: Home },
  { label: 'Transcript', href: '/student/transcript', icon: Printer },
] as const;

const serviceCards = [
  { label: 'My Courses', href: '/student/courses', icon: BookOpen, desc: 'View & register courses' },
  { label: 'Results', href: '/student/results', icon: FileText, desc: 'Check academic results' },
  { label: 'Fee Statement', href: '/student/fees', icon: CreditCard, desc: 'View & pay fees' },
  { label: 'Payment History', href: '/student/payments', icon: ClipboardList, desc: 'Transaction records' },
  { label: 'Hostel', href: '/student/hostel', icon: Home, desc: 'Apply for accommodation' },
  { label: 'Transcript', href: '/student/transcript', icon: Printer, desc: 'Print official transcript' },
] as const;

export default function StudentDashboard() {
  const navigate = useNavigate();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    error: profileError,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  const { data: courses = [] } = useGetCourses();
  const { data: results = [] } = useGetResults();
  const { data: unpaidFees = [] } = useCheckUnpaidFees();

  // Loading state
  if (profileLoading || !profileFetched) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar skeleton */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-2">
          <Skeleton className="h-6 w-32 mb-4" />
          {Array.from({ length: 7 }).map((_, i) => (
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
            {Array.from({ length: 6 }).map((_, i) => (
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
            There was an error loading your profile. Please try again.
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

  const registeredCount = courses.length;
  const resultsCount = results.length;
  const unpaidCount = unpaidFees.length;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Student Portal
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {userProfile.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Student ID: {userProfile.idNumber} · {userProfile.email}
          </p>
        </div>

        {/* Unpaid fees alert */}
        {unpaidCount > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Outstanding Fees</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>You have {unpaidCount} unpaid fee(s). Please clear them promptly.</span>
              <Button
                size="sm"
                variant="outline"
                className="ml-4 shrink-0"
                onClick={() => navigate({ to: '/student/fees' })}
              >
                Pay Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Registered Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{registeredCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Results Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{resultsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${unpaidCount > 0 ? 'text-destructive' : 'text-primary'}`}>
                {unpaidCount}
              </div>
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
