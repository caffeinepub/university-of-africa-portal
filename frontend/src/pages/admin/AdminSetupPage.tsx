import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSetupCard from '../../components/admin/AdminSetupCard';
import AdminProfileCard from '../../components/admin/AdminProfileCard';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const alreadyAdmin = isFetched && userProfile?.role === 'admin';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Admin Account Setup</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {alreadyAdmin
              ? 'Your admin account is already configured and active.'
              : 'This is a one-time setup for the first system administrator. Log in with Internet Identity and claim your admin account below.'}
          </p>
        </div>

        {/* University branding */}
        <div className="flex items-center justify-center gap-3 py-2">
          <img
            src="/assets/generated/university-crest.dim_256x256.png"
            alt="University Crest"
            className="h-12 w-12 object-contain"
          />
          <div className="text-left">
            <p className="font-semibold text-sm text-foreground">University Management System</p>
            <p className="text-xs text-muted-foreground">Secure · Decentralised · Reliable</p>
          </div>
        </div>

        {/* Already admin notice */}
        {alreadyAdmin ? (
          <div className="space-y-4">
            <AdminProfileCard />
            <div className="flex justify-center">
              <Button onClick={() => navigate({ to: '/admin' })}>
                Go to Admin Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Setup card */}
            {isAuthenticated && <AdminSetupCard />}

            {/* Profile card — shows principal even before setup */}
            {isAuthenticated && <AdminProfileCard />}

            {!isAuthenticated && (
              <div className="text-center p-6 rounded-xl border border-border bg-muted/30">
                <p className="text-muted-foreground text-sm">
                  Please log in using the button in the navigation bar to proceed with admin setup.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Back link */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
