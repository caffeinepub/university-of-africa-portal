import React from 'react';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useActor } from '../../hooks/useActor';
import { UserRole } from '../../backend';
import { Skeleton } from '../ui/skeleton';
import { ShieldX, LogIn } from 'lucide-react';
import { Button } from '../ui/button';

interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || actorFetching || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <LogIn className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Login Required</h2>
          <p className="text-muted-foreground">
            Please log in to access this page.
          </p>
          <Button onClick={() => window.location.href = '/'} variant="default">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (isFetched && (!userProfile || userProfile.role !== requiredRole)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <ShieldX className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">
            {!userProfile
              ? 'No profile found. Please complete your profile setup.'
              : `You need ${requiredRole} privileges to access this page. Your current role is: ${userProfile.role}.`}
          </p>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
