import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap, BookOpen, Users, Building2, Award, ChevronRight,
  Bell, FileText, CreditCard, Home, ArrowRight, Heart
} from 'lucide-react';

const PROGRAMMES = [
  { name: 'Computer Science', faculty: 'Science & Technology', duration: '4 years', code: 'CSC' },
  { name: 'Medicine & Surgery', faculty: 'Medical Sciences', duration: '6 years', code: 'MED' },
  { name: 'Law', faculty: 'Law', duration: '5 years', code: 'LAW' },
  { name: 'Business Administration', faculty: 'Management Sciences', duration: '4 years', code: 'BUS' },
  { name: 'Civil Engineering', faculty: 'Engineering', duration: '5 years', code: 'CVE' },
  { name: 'Nursing Science', faculty: 'Medical Sciences', duration: '5 years', code: 'NRS' },
  { name: 'Accounting', faculty: 'Management Sciences', duration: '4 years', code: 'ACC' },
  { name: 'Mass Communication', faculty: 'Arts & Social Sciences', duration: '4 years', code: 'MCM' },
];

const ADMISSION_NOTICES = [
  { title: '2024/2025 Post-UTME Screening', date: 'March 15, 2025', type: 'Urgent', desc: 'Post-UTME screening exercise for all candidates who scored 180 and above in UTME.' },
  { title: 'Acceptance Fee Payment Deadline', date: 'April 1, 2025', type: 'Notice', desc: 'All admitted candidates must pay acceptance fee before the deadline to secure their admission.' },
  { title: 'Document Verification Exercise', date: 'April 10, 2025', type: 'Info', desc: 'Newly admitted students are required to present original documents for verification.' },
];

const STATS = [
  { label: 'Students Enrolled', value: '15,000+', icon: Users },
  { label: 'Academic Programmes', value: '80+', icon: BookOpen },
  { label: 'Faculty Members', value: '500+', icon: GraduationCap },
  { label: 'Years of Excellence', value: '25+', icon: Award },
];

function Briefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const getDashboardPath = () => {
    if (!userProfile) return '/student';
    switch (userProfile.role) {
      case UserRole.admin: return '/admin';
      case UserRole.student: return '/student';
      case UserRole.staff: return '/staff';
      case UserRole.parent: return '/parent';
      default: return '/student';
    }
  };

  // For portal cards: authenticated users with matching role go to dashboard,
  // otherwise go to role-specific login page
  const getPortalPath = (role: 'student' | 'staff' | 'admin' | 'parent') => {
    if (isAuthenticated && userProfile) {
      const roleMap: Record<string, string> = {
        student: '/student',
        staff: '/staff',
        admin: '/admin',
        parent: '/parent',
      };
      return roleMap[role];
    }
    return `/login/${role}`;
  };

  const PORTAL_CARDS = [
    { role: 'student' as const, label: 'Student', icon: GraduationCap, desc: 'Course registration, results, fees, and more', color: 'bg-blue-50 border-blue-200' },
    { role: 'staff' as const, label: 'Staff', icon: Briefcase, desc: 'View courses, students, and announcements', color: 'bg-green-50 border-green-200' },
    { role: 'parent' as const, label: 'Parent', icon: Heart, desc: "Track your child's academic progress", color: 'bg-purple-50 border-purple-200' },
    { role: 'admin' as const, label: 'Admin', icon: Building2, desc: 'Manage the entire university portal', color: 'bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-banner.dim_1400x500.png"
            alt="University Campus"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/60" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <Badge className="bg-gold/20 text-gold border-gold/30 mb-4 text-xs font-semibold uppercase tracking-wider">
              Accredited University
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              University of Africa,{' '}
              <span className="text-gold">Toru-Orua</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl">
              Empowering the next generation of African leaders through world-class education, research, and innovation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-gold text-navy font-bold hover:bg-gold-light shadow-gold">
                <Link to="/admissions/apply">
                  Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link to="/admissions/check">Check Admission Status</Link>
              </Button>
              {isAuthenticated && userProfile ? (
                <Button asChild size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/20">
                  <Link to={getDashboardPath()}>
                    Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-white/10 text-white hover:bg-white/20 border border-white/20">
                  <Link to="/portal">
                    Access Portal <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gold py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-6 h-6 text-navy mx-auto mb-2" />
                <div className="font-serif text-2xl md:text-3xl font-bold text-navy">{value}</div>
                <div className="text-navy/70 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Access */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">Portal Access</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Access your dedicated portal based on your role in the university community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PORTAL_CARDS.map(({ role, label, icon: Icon, desc, color }) => (
              <button
                key={role}
                onClick={() => navigate({ to: getPortalPath(role) })}
                className="text-left w-full"
              >
                <Card className={`border-2 hover:shadow-navy transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full ${color}`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-gold" />
                    </div>
                    <h3 className="font-serif font-bold text-navy text-lg mb-2">{label} Portal</h3>
                    <p className="text-muted-foreground text-sm">{desc}</p>
                    <div className="mt-4 flex items-center justify-center gap-1 text-navy font-semibold text-sm">
                      {isAuthenticated && userProfile ? 'Open Dashboard' : 'Login & Access'} <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
          {!isAuthenticated && (
            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                Not sure which portal to use?{' '}
                <button
                  onClick={() => navigate({ to: '/portal' })}
                  className="text-navy font-semibold hover:text-gold transition-colors underline underline-offset-2"
                >
                  View all portals
                </button>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Admissions Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-gold/20 text-gold-dark border-gold/30 mb-4 text-xs font-semibold uppercase tracking-wider">
                Admissions 2024/2025
              </Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">
                Begin Your Academic Journey
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Applications are open for the 2024/2025 academic session. Join thousands of students pursuing excellence at the University of Africa, Toru-Orua.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Obtain JAMB UTME form and sit for the examination',
                  'Score minimum of 180 in UTME for most programmes',
                  'Apply for Post-UTME screening on this portal',
                  "Upload O'Level results and required documents",
                  'Check admission status and pay acceptance fee',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-navy text-xs font-bold">{i + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{step}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button asChild className="bg-navy text-white hover:bg-navy/90">
                  <Link to="/admissions/apply">Start Application</Link>
                </Button>
                <Button asChild variant="outline" className="border-navy text-navy hover:bg-navy/5">
                  <Link to="/admissions/check">Check Status</Link>
                </Button>
              </div>
            </div>
            <div>
              <img
                src="/assets/generated/admissions-illustration.dim_800x400.png"
                alt="Admissions"
                className="w-full rounded-2xl shadow-navy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Admission Notices */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-navy">Admission Notices</h2>
              <p className="text-muted-foreground mt-1">Stay updated with the latest announcements</p>
            </div>
            <Bell className="w-8 h-8 text-gold" />
          </div>
          <div className="space-y-4">
            {ADMISSION_NOTICES.map((notice, i) => (
              <Card key={i} className="border-l-4 border-l-gold hover:shadow-xs transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={notice.type === 'Urgent' ? 'destructive' : 'secondary'} className="text-xs">
                          {notice.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{notice.date}</span>
                      </div>
                      <h3 className="font-semibold text-navy mb-1">{notice.title}</h3>
                      <p className="text-sm text-muted-foreground">{notice.desc}</p>
                    </div>
                    <FileText className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="py-16 bg-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
              Academic <span className="text-gold">Programmes</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Choose from a wide range of undergraduate and postgraduate programmes across multiple faculties.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROGRAMMES.map((prog) => (
              <Card key={prog.code} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="p-5">
                  <div className="text-gold text-xs font-bold uppercase tracking-wider mb-2">{prog.code}</div>
                  <h3 className="font-semibold text-white mb-1">{prog.name}</h3>
                  <p className="text-white/50 text-xs mb-2">{prog.faculty}</p>
                  <Badge variant="outline" className="border-gold/30 text-gold/80 text-xs">
                    {prog.duration}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10">
              <Link to="/admissions">View All Programmes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
