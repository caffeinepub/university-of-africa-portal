import React from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  BookOpen,
  CreditCard,
  Award,
  ScrollText,
  Building2,
  Receipt,
  Bell,
  Home,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile, useGetResults, useCheckUnpaidFees, useGetRegisteredCourses } from '../../hooks/useQueries';

const studentNavItems = [
  { label: 'Dashboard', to: '/student/dashboard', icon: Home },
  { label: 'Course Registration', to: '/student/courses', icon: BookOpen },
  { label: 'Fee Statement', to: '/student/fees', icon: CreditCard },
  { label: 'Payment History', to: '/student/payment-history', icon: Receipt },
  { label: 'My Results', to: '/student/results', icon: Award },
  { label: 'Transcript', to: '/student/transcript', icon: ScrollText },
  { label: 'Hostel Application', to: '/student/hostel', icon: Building2 },
  { label: 'Announcements', to: '/student/announcements', icon: Bell },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: profile } = useGetCallerUserProfile();
  const { data: results = [] } = useGetResults();
  const { data: unpaidFees = [] } = useCheckUnpaidFees();
  const { data: registeredCourses = [] } = useGetRegisteredCourses();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Portal</p>
          <p className="text-sm font-medium text-foreground mt-1 truncate">{profile?.name ?? 'Student'}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.to || currentPath.startsWith(item.to + '/');
            return (
              <button
                key={item.to}
                onClick={() => navigate({ to: item.to })}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">ID: {profile?.idNumber ?? '—'}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {profile?.name?.split(' ')[0] ?? 'Student'}!
            </h1>
            <p className="text-muted-foreground">Here's an overview of your academic status.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{registeredCourses.length}</p>
                    <p className="text-sm text-muted-foreground">Registered Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{results.length}</p>
                    <p className="text-sm text-muted-foreground">Results Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{unpaidFees.length}</p>
                    <p className="text-sm text-muted-foreground">Unpaid Fees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3">My Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {studentNavItems.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.to}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => navigate({ to: item.to })}
                  >
                    <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2 text-center">
                      <Icon className="h-6 w-6 text-primary" />
                      <p className="text-xs font-medium leading-tight">{item.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Unpaid fees alert */}
          {unpaidFees.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-red-700 dark:text-red-400 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Outstanding Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  You have {unpaidFees.length} unpaid fee(s). Please clear your fees to avoid restrictions.
                </p>
                <Button size="sm" asChild>
                  <Link to="/student/fees">View Fee Statement</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
