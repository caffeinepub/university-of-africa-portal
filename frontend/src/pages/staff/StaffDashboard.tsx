import React from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
  Home,
  User,
  BookOpen,
  Users,
  ClipboardList,
  Bell,
  Award,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile, useGetAllStudents, useGetCourses, useGetAllResults } from '../../hooks/useQueries';

const staffNavItems = [
  { label: 'Dashboard', to: '/staff/dashboard', icon: Home },
  { label: 'My Profile', to: '/staff/profile', icon: User },
  { label: 'Assigned Courses', to: '/staff/courses', icon: BookOpen },
  { label: 'Enrolled Students', to: '/staff/students', icon: Users },
  { label: 'Exams & Records', to: '/staff/exams', icon: ClipboardList },
  { label: 'Announcements', to: '/staff/announcements', icon: Bell },
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: profile } = useGetCallerUserProfile();
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const { data: courses = [], isLoading: coursesLoading } = useGetCourses();
  const { data: results = [], isLoading: resultsLoading } = useGetAllResults();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Staff Portal</p>
          <p className="text-sm font-medium text-foreground mt-1 truncate">{profile?.name ?? 'Staff'}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {staffNavItems.map((item) => {
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
              Welcome, {profile?.name?.split(' ')[0] ?? 'Staff'}!
            </h1>
            <p className="text-muted-foreground">Staff portal overview and quick access to services.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {studentsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <Users className="h-8 w-8 text-primary" />
                  )}
                  <div>
                    <p className="text-2xl font-bold">{students.length}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {coursesLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-green-600" />
                  )}
                  <div>
                    <p className="text-2xl font-bold">{courses.length}</p>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  {resultsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                  ) : (
                    <Award className="h-8 w-8 text-amber-600" />
                  )}
                  <div>
                    <p className="text-2xl font-bold">{results.length}</p>
                    <p className="text-sm text-muted-foreground">Results Posted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Staff Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {staffNavItems.slice(1).map((item) => {
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
