import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { UserProfile, UserRole } from '../backend';
import { useNavigate } from '@tanstack/react-router';
import { Shield, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export default function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Still initializing auth or fetching profile
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Login Required</h2>
            <p className="mt-2 text-muted-foreground">
              You must be logged in to access this page. Please login to continue.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={async () => {
                try {
                  await login();
                } catch (error: any) {
                  if (error.message === 'User is already authenticated') {
                    await import('../hooks/useInternetIdentity').then(() => {});
                  }
                }
              }}
              disabled={isLoggingIn}
              className="gap-2"
            >
              {isLoggingIn ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</>
              ) : (
                <><LogIn className="h-4 w-4" /> Login</>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but profile not yet fetched
  if (!isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Logged in but no profile or wrong role
  if (!userProfile || userProfile.role !== requiredRole) {
    const roleLabel = requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="mt-2 text-muted-foreground">
              {!userProfile
                ? 'Your account profile has not been set up yet. Please complete your profile setup.'
                : `This page is only accessible to ${roleLabel} accounts. Your current role does not have permission to view this page.`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate({ to: '/' })}>
              Go to Homepage
            </Button>
            {userProfile && (
              <Button
                variant="outline"
                onClick={async () => {
                  const { useInternetIdentity: useII } = await import('../hooks/useInternetIdentity');
                }}
              >
                Switch Account
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated with correct role — render children
  return <>{children}</>;
}
