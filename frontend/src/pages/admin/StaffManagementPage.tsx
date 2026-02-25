import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Briefcase, Users } from 'lucide-react';
import RoleGuard from '../../components/auth/RoleGuard';

// Staff management page - staff profiles are managed via Internet Identity
// This page shows a placeholder since getAllUserProfiles is not in the backend interface
function StaffManagementContent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Staff Management</h1>
            <p className="text-xs text-primary-foreground/70">Manage staff accounts</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />Staff Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Staff accounts are managed via Internet Identity</p>
              <p className="text-sm mt-1">Staff members log in using Internet Identity and set up their profiles on first login.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function StaffManagementPage() {
  return (
    <RoleGuard requiredRole="admin">
      <StaffManagementContent />
    </RoleGuard>
  );
}
