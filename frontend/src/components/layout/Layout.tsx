import React from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';
import Navigation from './Navigation';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import { UserRole } from '../../backend';

function getRoleFromPath(pathname: string): UserRole | undefined {
  const match = pathname.match(/^\/login\/(student|staff|admin|parent)$/);
  if (!match) return undefined;
  const roleStr = match[1] as 'student' | 'staff' | 'admin' | 'parent';
  switch (roleStr) {
    case 'student': return UserRole.student;
    case 'staff': return UserRole.staff;
    case 'admin': return UserRole.admin;
    case 'parent': return UserRole.parent;
    default: return undefined;
  }
}

export default function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const location = useLocation();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  // Detect if we're on a role-specific login page and extract the target role
  const defaultRole = getRoleFromPath(location.pathname);

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
      <ProfileSetupModal open={showProfileSetup} defaultRole={defaultRole} />
    </div>
  );
}
