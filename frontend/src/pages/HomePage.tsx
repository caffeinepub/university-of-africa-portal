import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  GraduationCap,
  Briefcase,
  Users,
  Shield,
  ArrowRight,
  BookOpen,
  Award,
  Globe,
  ClipboardList,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';

const portalCards = [
  {
    role: 'student',
    title: 'Student Portal',
    description: 'Access courses, results, and academic services.',
    icon: GraduationCap,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    role: 'staff',
    title: 'Staff Portal',
    description: 'Manage courses, post results, and more.',
    icon: Briefcase,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    role: 'admin',
    title: 'Admin Portal',
    description: 'Full administrative control and management.',
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    role: 'parent',
    title: 'Parent Portal',
    description: "Monitor your ward's academic progress.",
    icon: Users,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

const stats = [
  { label: 'Students Enrolled', value: '12,000+' },
  { label: 'Academic Programmes', value: '80+' },
  { label: 'Faculty Members', value: '500+' },
  { label: 'Years of Excellence', value: '50+' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  const handlePortalClick = (role: string) => {
    if (isAuthenticated && userProfile) {
      const routes: Record<string, string> = {
        student: '/student',
        staff: '/staff',
        admin: '/admin',
        parent: '/parent',
      };
      navigate({ to: routes[userProfile.role as string] ?? '/portal' });
    } else {
      navigate({ to: `/login/${role}` });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/university-crest.dim_256x256.png"
              alt="University Crest"
              className="w-10 h-10 object-contain"
            />
            <div>
              <span className="font-bold text-base">University Portal</span>
              <p className="text-xs text-primary-foreground/60 hidden sm:block">Academic Excellence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10 text-xs hidden sm:flex"
                  onClick={() => navigate({ to: '/apply' })}
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  Apply for Access
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/10 text-xs hidden sm:flex"
                  onClick={() => navigate({ to: '/id-login' })}
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  ID Login
                </Button>
              </>
            )}
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate({ to: isAuthenticated && userProfile ? `/${userProfile.role}` : '/portal' })}
            >
              {isAuthenticated ? 'My Dashboard' : 'Access Portal'}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="h-[420px] bg-cover bg-center relative"
          style={{ backgroundImage: 'url(/assets/generated/hero-banner.dim_1400x500.png)' }}
        >
          <div className="absolute inset-0 bg-primary/70" />
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
                Welcome to the University Portal
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Your gateway to academic excellence. Access all university services in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                  onClick={() => navigate({ to: isAuthenticated && userProfile ? `/${userProfile.role}` : '/portal' })}
                >
                  Access Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {!isAuthenticated && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => navigate({ to: '/apply' })}
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Apply for Access
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-accent text-accent-foreground py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-accent-foreground/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portal Cards */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Your Portal</h2>
          <p className="text-muted-foreground text-sm">
            Choose your role to access your personalized dashboard
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {portalCards.map((card) => (
            <Card
              key={card.role}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-border group"
              onClick={() => handlePortalClick(card.role)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mx-auto mb-4`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{card.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{card.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Enter Portal
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* New User CTA Banner */}
      {!isAuthenticated && (
        <section className="bg-primary/5 border-y border-primary/10 py-10">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">New to the University Portal?</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
              Apply for portal access to get your unique ID and password. Once approved by the administrator,
              you can log in to your personalized dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate({ to: '/apply' })}
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Apply for Portal Access
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => navigate({ to: '/id-login' })}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Already have credentials? Login with ID
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Why Our Portal?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Academic Management', desc: 'Seamlessly manage courses, results, and academic records.' },
            { icon: Award, title: 'Secure & Reliable', desc: 'Built on blockchain technology for maximum security and transparency.' },
            { icon: Globe, title: 'Always Accessible', desc: 'Access your portal anytime, anywhere from any device.' },
          ].map((f) => (
            <Card key={f.title} className="border-border text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/university-crest.dim_256x256.png"
                alt="University Crest"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-sm">University Portal</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-primary-foreground/60">
              <button onClick={() => navigate({ to: '/apply' })} className="hover:text-primary-foreground transition-colors">
                Apply for Access
              </button>
              <button onClick={() => navigate({ to: '/id-login' })} className="hover:text-primary-foreground transition-colors">
                ID Login
              </button>
              <button onClick={() => navigate({ to: '/portal' })} className="hover:text-primary-foreground transition-colors">
                All Portals
              </button>
            </div>
            <p className="text-xs text-primary-foreground/60">
              © {new Date().getFullYear()} Built with{' '}
              <span className="text-red-400">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
