import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Home,
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  ClipboardList,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RoleGuard from '../../components/auth/RoleGuard';
import AdminSetupCard from '../../components/admin/AdminSetupCard';
import AdminProfileCard from '../../components/admin/AdminProfileCard';
import { useGetCallerUserProfile } from '../../hooks/useQueries';

const adminNavItems = [
  { label: 'Student Management', icon: Users, path: '/admin/students' },
  { label: 'Programme Management', icon: BookOpen, path: '/admin/programmes' },
  { label: 'Admissions', icon: GraduationCap, path: '/admin/admissions' },
  { label: 'Fee Management', icon: DollarSign, path: '/admin/fees' },
  { label: 'Hostel Management', icon: Home, path: '/admin/hostel' },
  { label: 'Results Management', icon: BarChart3, path: '/admin/results' },
  { label: 'Messaging', icon: MessageSquare, path: '/admin/messaging' },
  { label: 'Access Applications', icon: UserCheck, path: '/admin/access-applications' },
] as const;

function AdminDashboardContent() {
  const navigate = useNavigate();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();

  const noProfile = !isLoading && isFetched && !userProfile;

  if (noProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center mb-6">
            <img
              src="/assets/generated/university-crest.dim_256x256.png"
              alt="University Crest"
              className="w-20 h-20 object-contain mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold text-foreground">Admin Setup</h1>
            <p className="text-muted-foreground text-sm">
              No admin profile found. Set up the admin account to continue.
            </p>
          </div>
          <AdminSetupCard />
          <AdminProfileCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img
            src="/assets/generated/university-crest.dim_256x256.png"
            alt="University Crest"
            className="w-10 h-10 object-contain"
          />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
            <p className="text-xs text-primary-foreground/70">
              Welcome back, {userProfile?.name ?? 'Administrator'}
            </p>
          </div>
          <AdminProfileCard />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">Administration Panel</h2>
          <p className="text-sm text-muted-foreground">Manage all university portal operations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {adminNavItems.map((item) => (
            <Card
              key={item.path}
              className="cursor-pointer hover:shadow-md transition-shadow border-border hover:border-primary/30 group"
              onClick={() => navigate({ to: item.path })}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">Manage</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Access Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate({ to: '/admin/access-applications' })}
              >
                Review Applications
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Admissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate({ to: '/admin/admissions' })}
              >
                Review Admissions
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="w-4 h-4" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate({ to: '/admin/setup' })}
              >
                Configure System
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminDashboardContent />
    </RoleGuard>
  );
}
