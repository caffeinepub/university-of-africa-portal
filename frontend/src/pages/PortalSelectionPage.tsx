import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  GraduationCap,
  Briefcase,
  Users,
  Shield,
  ArrowRight,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const portals = [
  {
    role: 'student',
    title: 'Student Portal',
    description: 'Access your academic records, course registration, results, and more.',
    icon: GraduationCap,
    features: ['Course Registration', 'View Results', 'Fee Payment', 'Hostel Application'],
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    role: 'staff',
    title: 'Staff Portal',
    description: 'Manage courses, post results, and access staff resources.',
    icon: Briefcase,
    features: ['Post Results', 'Manage Courses', 'View Students', 'Announcements'],
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    role: 'admin',
    title: 'Admin Portal',
    description: 'Full administrative control over the university portal system.',
    icon: Shield,
    features: ['User Management', 'Admissions', 'Fee Management', 'System Settings'],
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    role: 'parent',
    title: 'Parent Portal',
    description: "Monitor your ward's academic progress and stay informed.",
    icon: Users,
    features: ["View Ward's Results", 'Academic Progress', 'Fee Status', 'Announcements'],
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
];

export default function PortalSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-5 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <img
            src="/assets/generated/university-crest.dim_256x256.png"
            alt="University Crest"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold">University Portal</h1>
            <p className="text-xs text-primary-foreground/70">Select your portal to continue</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">Choose Your Portal</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select the portal that matches your role to access your personalized dashboard and services.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {portals.map((portal) => (
            <Card
              key={portal.role}
              className={`cursor-pointer hover:shadow-lg transition-all border-2 ${portal.border} hover:scale-[1.02] group`}
              onClick={() => navigate({ to: `/login/${portal.role}` })}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-xl ${portal.bg} flex items-center justify-center mb-3`}>
                  <portal.icon className={`w-6 h-6 ${portal.color}`} />
                </div>
                <CardTitle className="text-base">{portal.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {portal.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 mb-4">
                  {portal.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${portal.bg} border ${portal.border}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant="outline"
                >
                  Login with II
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Alternative Access Section */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground font-medium">
            Alternative Access Options
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-all border-border hover:border-primary/40 w-full sm:w-auto"
              onClick={() => navigate({ to: '/apply' })}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">Apply for Portal Access</p>
                  <p className="text-xs text-muted-foreground">New user? Submit an application</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-all border-border hover:border-primary/40 w-full sm:w-auto"
              onClick={() => navigate({ to: '/id-login' })}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-foreground">Login with ID & Password</p>
                  <p className="text-xs text-muted-foreground">Use your assigned credentials</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border mt-8">
        <p>
          © {new Date().getFullYear()} University Portal. Built with{' '}
          <span className="text-destructive">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
