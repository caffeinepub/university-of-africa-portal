import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ShieldX, LogIn } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Still initializing auth or loading profile
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please log in to access this page.
          </p>
          <Button onClick={() => navigate({ to: '/portal' })} className="w-full">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated but no profile yet — wait for setup modal
  if (isFetched && !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Role check
  if (requiredRole && userProfile && (userProfile.role as string) !== requiredRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You don't have permission to access this page.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: `/${userProfile.role as string}` as any })}
            className="w-full"
          >
            Go to My Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
