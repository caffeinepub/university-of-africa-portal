import React from 'react';
import { Outlet } from '@tanstack/react-router';
import Navigation from './Navigation';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import ProfileSetupModal from '../auth/ProfileSetupModal';

export default function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  // Only show the modal when:
  // 1. User is authenticated
  // 2. Actor has finished initialising (profileLoading is false)
  // 3. The query has genuinely completed (isFetched is true)
  // 4. No profile was found (userProfile is null)
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <ProfileSetupModal open={showProfileSetup} />
    </div>
  );
}
