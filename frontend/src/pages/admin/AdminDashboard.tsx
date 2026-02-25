import React from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
  Home,
  Users,
  Briefcase,
  BookMarked,
  DollarSign,
  UserCheck,
  BarChart3,
  Building2,
  Bell,
  ClipboardList,
  Settings,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCallerUserProfile, useGetAllStudents, useGetCourses, useGetFeeTypes, useGetAllAdmissionApplications } from '../../hooks/useQueries';

const adminNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: Home },
  { label: 'Manage Students', to: '/admin/students', icon: Users },
  { label: 'Manage Staff', to: '/admin/staff', icon: Briefcase },
  { label: 'Courses & Programmes', to: '/admin/programmes', icon: BookMarked },
  { label: 'Fee Management', to: '/admin/fees', icon: DollarSign },
  { label: 'Admissions', to: '/admin/admissions', icon: UserCheck },
  { label: 'Results Management', to: '/admin/results', icon: BarChart3 },
  { label: 'Hostel Applications', to: '/admin/hostel', icon: Building2 },
  { label: 'Announcements', to: '/admin/messaging', icon: Bell },
  { label: 'Exams & Records', to: '/admin/exams', icon: ClipboardList },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: profile } = useGetCallerUserProfile();
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const { data: courses = [], isLoading: coursesLoading } = useGetCourses();
  const { data: feeTypes = [], isLoading: feesLoading } = useGetFeeTypes();
  const { data: admissions = [], isLoading: admissionsLoading } = useGetAllAdmissionApplications();

  const pendingAdmissions = admissions.filter((a) => a.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</p>
          <p className="text-sm font-medium text-foreground mt-1 truncate">{profile?.name ?? 'Administrator'}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
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
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome back, {profile?.name ?? 'Administrator'}. Manage all university operations here.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {studentsLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  ) : (
                    <Users className="h-7 w-7 text-primary" />
                  )}
                  <div>
                    <p className="text-xl font-bold">{students.length}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {coursesLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-green-600" />
                  ) : (
                    <BookMarked className="h-7 w-7 text-green-600" />
                  )}
                  <div>
                    <p className="text-xl font-bold">{courses.length}</p>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {feesLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
                  ) : (
                    <DollarSign className="h-7 w-7 text-amber-600" />
                  )}
                  <div>
                    <p className="text-xl font-bold">{feeTypes.length}</p>
                    <p className="text-xs text-muted-foreground">Fee Types</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {admissionsLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin text-red-500" />
                  ) : (
                    <UserCheck className="h-7 w-7 text-red-500" />
                  )}
                  <div>
                    <p className="text-xl font-bold">{pendingAdmissions}</p>
                    <p className="text-xs text-muted-foreground">Pending Admissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Services Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Admin Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {adminNavItems.slice(1).map((item) => {
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
        </div>
      </main>
    </div>
  );
}
