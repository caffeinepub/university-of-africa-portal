import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { GraduationCap, Building2, ChevronRight, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PORTALS = [
  {
    role: 'student' as const,
    label: 'Student Portal',
    description: 'Access course registration, academic results, fee statements, hostel applications, and more.',
    icon: GraduationCap,
    color: 'from-blue-600 to-blue-800',
    badgeLabel: 'Students',
    features: ['Course Registration', 'View Results', 'Fee Payments', 'Hostel Application'],
  },
  {
    role: 'staff' as const,
    label: 'Staff Portal',
    description: 'Manage courses, post student results, view announcements, and access staff resources.',
    icon: Users,
    color: 'from-emerald-600 to-emerald-800',
    badgeLabel: 'Academic Staff',
    features: ['Manage Courses', 'Post Results', 'View Students', 'Announcements'],
  },
  {
    role: 'admin' as const,
    label: 'Admin Portal',
    description: 'Full administrative control over the university portal — manage students, staff, fees, and more.',
    icon: Building2,
    color: 'from-amber-600 to-amber-800',
    badgeLabel: 'Administrators',
    features: ['Student Management', 'Fee Management', 'Admissions', 'System Settings'],
  },
  {
    role: 'parent' as const,
    label: 'Parent Portal',
    description: "Monitor your child's academic progress, view results, and stay connected with the university.",
    icon: Heart,
    color: 'from-purple-600 to-purple-800',
    badgeLabel: 'Parents & Guardians',
    features: ['View Results', 'Academic Progress', 'Link Student Account', 'Notifications'],
  },
];

export default function PortalSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-navy py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold/60">
              <img
                src="/assets/generated/university-crest.dim_256x256.png"
                alt="University Crest"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <Badge className="bg-gold/20 text-gold border-gold/30 mb-4 text-xs font-semibold uppercase tracking-wider">
            University of Africa, Toru-Orua
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
            Select Your <span className="text-gold">Portal</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Choose your access category to log in to your dedicated portal. Each portal is tailored to your role in the university community.
          </p>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PORTALS.map(({ role, label, description, icon: Icon, color, badgeLabel, features }) => (
            <Card
              key={role}
              className="group border-2 border-border hover:border-gold/50 hover:shadow-navy transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
              onClick={() => navigate({ to: `/login/${role}` })}
            >
              <div className={`bg-gradient-to-br ${color} p-6 text-white`}>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-xs mb-2">
                  {badgeLabel}
                </Badge>
                <h3 className="font-serif font-bold text-xl">{label}</h3>
              </div>
              <CardContent className="p-5">
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{description}</p>
                <ul className="space-y-1.5 mb-5">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-foreground/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-navy text-white hover:bg-navy/90 group-hover:bg-gold group-hover:text-navy transition-colors font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: `/login/${role}` });
                  }}
                >
                  Access Portal <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10 text-muted-foreground text-sm">
          <p>
            Not sure which portal to use?{' '}
            <button
              onClick={() => navigate({ to: '/' })}
              className="text-navy font-semibold hover:text-gold transition-colors underline underline-offset-2"
            >
              Return to Homepage
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
