import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ClipboardList, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';

export default function Navigation() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  const dashboardRoute = userProfile
    ? `/${userProfile.role as string}`
    : '/portal';

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <img
            src="/assets/generated/university-crest.dim_256x256.png"
            alt="University Crest"
            className="w-9 h-9 object-contain"
          />
          <div className="hidden sm:block">
            <span className="font-bold text-sm block leading-tight">University Portal</span>
            <span className="text-xs text-primary-foreground/60">Academic Excellence</span>
          </div>
        </button>

        {/* Nav Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10 text-xs hidden sm:flex items-center gap-1"
                onClick={() => navigate({ to: '/' })}
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10 text-xs hidden sm:flex items-center gap-1"
                onClick={() => navigate({ to: '/portal' })}
              >
                Portals
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10 text-xs hidden md:flex items-center gap-1"
                onClick={() => navigate({ to: '/apply' })}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Apply for Access
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10 text-xs hidden md:flex items-center gap-1"
                onClick={() => navigate({ to: '/id-login' })}
              >
                <LogIn className="w-3.5 h-3.5" />
                ID Login
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
                onClick={() => navigate({ to: '/portal' })}
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10 text-xs hidden sm:flex items-center gap-1"
                onClick={() => navigate({ to: dashboardRoute })}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Button>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
                onClick={() => navigate({ to: dashboardRoute })}
              >
                My Portal
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
