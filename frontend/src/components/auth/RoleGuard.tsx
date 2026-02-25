import React from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { Button } from '@/components/ui/button';
import { ShieldX, Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShieldX className="w-16 h-16 text-gold mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-navy mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access this section of the portal.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-navy text-white hover:bg-navy/90"
          >
            {isLoggingIn ? 'Logging in...' : 'Login to Continue'}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !isFetched) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!userProfile || userProfile.role !== requiredRole) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShieldX className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-navy mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this section. This area is restricted to{' '}
            <span className="font-semibold capitalize">{requiredRole}</span> users.
          </p>
          <Button asChild className="bg-navy text-white hover:bg-navy/90">
            <Link to="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
