import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, GraduationCap, Building2, Users, Heart, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

type PortalRole = 'student' | 'staff' | 'admin' | 'parent';

interface RoleLoginPageProps {
  role: PortalRole;
}

const ROLE_CONFIG: Record<PortalRole, {
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  dashboardPath: string;
  userRole: UserRole;
  features: string[];
  idLabel: string;
}> = {
  student: {
    label: 'Student Portal',
    description: 'Access your academic records, register for courses, pay fees, apply for hostel, and track your progress.',
    icon: GraduationCap,
    gradient: 'from-blue-600 to-blue-900',
    dashboardPath: '/student',
    userRole: UserRole.student,
    features: ['Course Registration', 'Academic Results', 'Fee Payments', 'Hostel Application', 'Transcript Download'],
    idLabel: 'Matric Number / Student ID',
  },
  staff: {
    label: 'Staff Portal',
    description: 'Manage your courses, post student results, view announcements, and access all staff resources.',
    icon: Users,
    gradient: 'from-emerald-600 to-emerald-900',
    dashboardPath: '/staff',
    userRole: UserRole.staff,
    features: ['Course Management', 'Post Results', 'Student Records', 'Announcements', 'Academic Calendar'],
    idLabel: 'Staff ID Number',
  },
  admin: {
    label: 'Admin Portal',
    description: 'Full administrative control — manage students, staff, fees, admissions, and all university operations.',
    icon: Building2,
    gradient: 'from-amber-600 to-amber-900',
    dashboardPath: '/admin',
    userRole: UserRole.admin,
    features: ['Student Management', 'Fee Management', 'Admissions Control', 'Hostel Management', 'System Messaging'],
    idLabel: 'Admin ID Number',
  },
  parent: {
    label: 'Parent Portal',
    description: "Monitor your child's academic journey, view results, and stay connected with the university community.",
    icon: Heart,
    gradient: 'from-purple-600 to-purple-900',
    dashboardPath: '/parent',
    userRole: UserRole.parent,
    features: ["View Child's Results", 'Academic Progress', 'Link Student Account', 'University Notices'],
    idLabel: 'Parent / Guardian ID',
  },
};

export default function RoleLoginPage({ role }: RoleLoginPageProps) {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  // After login + profile loaded: redirect to correct dashboard
  useEffect(() => {
    if (!isAuthenticated || !isFetched || profileLoading) return;
    if (userProfile && userProfile.role === config.userRole) {
      navigate({ to: config.dashboardPath });
    }
  }, [isAuthenticated, isFetched, profileLoading, userProfile, config.userRole, config.dashboardPath, navigate]);

  const getActualDashboardPath = () => {
    if (!userProfile) return '/';
    switch (userProfile.role) {
      case UserRole.admin: return '/admin';
      case UserRole.student: return '/student';
      case UserRole.staff: return '/staff';
      case UserRole.parent: return '/parent';
      default: return '/';
    }
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case UserRole.admin: return 'Administrator';
      case UserRole.student: return 'Student';
      case UserRole.staff: return 'Staff';
      case UserRole.parent: return 'Parent';
      default: return 'User';
    }
  };

  const hasMismatchedRole = isAuthenticated && isFetched && userProfile && userProfile.role !== config.userRole;
  const isLoadingAfterLogin = isAuthenticated && (profileLoading || !isFetched);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Panel — Branding */}
      <div className={`bg-gradient-to-br ${config.gradient} lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between text-white`}>
        <div>
          <button
            onClick={() => navigate({ to: '/portal' })}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal Selection
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/40">
              <img
                src="/assets/generated/university-crest.dim_256x256.png"
                alt="University Crest"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-serif font-bold text-sm">University of Africa</div>
              <div className="text-white/60 text-xs">Toru-Orua</div>
            </div>
          </div>

          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <Icon className="w-8 h-8 text-white" />
          </div>

          <Badge className="bg-white/20 text-white border-white/30 text-xs mb-4">
            {config.label}
          </Badge>

          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            Welcome to the<br />{config.label}
          </h1>

          <p className="text-white/75 text-base leading-relaxed mb-8">
            {config.description}
          </p>

          <div className="space-y-2.5">
            {config.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-white/80">
                <ShieldCheck className="w-4 h-4 text-white/60 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-white/40 text-xs">
          © {new Date().getFullYear()} University of Africa, Toru-Orua. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Login */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-navy mb-2">
              Sign In
            </h2>
            <p className="text-muted-foreground text-sm">
              Use your Internet Identity to securely access the {config.label}.
            </p>
          </div>

          {/* Mismatched role warning */}
          {hasMismatchedRole && (
            <Card className="border-amber-200 bg-amber-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">
                      Different Role Detected
                    </p>
                    <p className="text-xs text-amber-700 mb-3">
                      You are already registered as a <strong>{getRoleLabel(userProfile!.role)}</strong>. 
                      This is the {config.label}, which is for {getRoleLabel(config.userRole)}s only.
                    </p>
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                      onClick={() => navigate({ to: getActualDashboardPath() })}
                    >
                      Go to My Dashboard ({getRoleLabel(userProfile!.role)})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading state after login */}
          {isLoadingAfterLogin && (
            <Card className="border-blue-200 bg-blue-50 mb-6">
              <CardContent className="p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                <p className="text-sm text-blue-700">Loading your profile, please wait...</p>
              </CardContent>
            </Card>
          )}

          {/* Login Card */}
          {!isAuthenticated && (
            <Card className="border-2 border-border shadow-sm">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-navy text-lg">{config.label}</h3>
                  <p className="text-muted-foreground text-xs mt-1">Secure login via Internet Identity</p>
                </div>

                <Button
                  className="w-full bg-navy text-white hover:bg-navy/90 font-semibold py-6 text-base"
                  onClick={login}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      Login with Internet Identity
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
                  By logging in, you agree to the university's terms of service and privacy policy.
                  Your identity is secured by the Internet Computer blockchain.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Already authenticated but no profile yet — modal will open from Layout */}
          {isAuthenticated && !profileLoading && isFetched && !userProfile && !hasMismatchedRole && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <ShieldCheck className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Identity Verified!</h3>
                <p className="text-sm text-green-700">
                  Please complete your profile setup in the dialog that has appeared to finish registering as a {getRoleLabel(config.userRole)}.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Wrong portal?{' '}
              <button
                onClick={() => navigate({ to: '/portal' })}
                className="text-navy font-semibold hover:text-gold transition-colors underline underline-offset-2"
              >
                Choose a different portal
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
