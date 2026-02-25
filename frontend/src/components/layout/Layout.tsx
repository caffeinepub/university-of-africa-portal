import React from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import { UserRole } from '../../backend';

interface LayoutProps {
  children: React.ReactNode;
}

function getRoleFromPath(pathname: string): UserRole | undefined {
  const match = pathname.match(/^\/login\/(student|staff|admin|parent)/);
  if (!match) return undefined;
  const roleStr = match[1];
  switch (roleStr) {
    case 'student': return UserRole.student;
    case 'staff': return UserRole.staff;
    case 'admin': return UserRole.admin;
    case 'parent': return UserRole.parent;
    default: return undefined;
  }
}

export default function Layout({ children }: LayoutProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const defaultRole = getRoleFromPath(pathname);
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {children}
      <ProfileSetupModal open={showProfileSetup} defaultRole={defaultRole} />
    </>
  );
}
