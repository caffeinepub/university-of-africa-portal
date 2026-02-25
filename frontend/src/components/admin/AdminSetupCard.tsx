import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBootstrapAdmin, extractErrorMessage } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function AdminSetupCard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const bootstrapAdmin = useBootstrapAdmin();

  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !idNumber.trim() || !email.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    try {
      await bootstrapAdmin.mutateAsync({ name: name.trim(), idNumber: idNumber.trim(), email: email.trim() });
      toast.success('Admin account successfully created');
      navigate({ to: '/admin' });
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrorMsg(msg);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-amber-500/40 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">You must be logged in to claim the admin account.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Claim Admin Account</CardTitle>
            <CardDescription className="text-sm mt-0.5">
              Set up the first administrator account for this system. This can only be done once.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Full Name</Label>
              <Input
                id="admin-name"
                placeholder="e.g. Dr. Amina Okafor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={bootstrapAdmin.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-id">Staff / Admin ID</Label>
              <Input
                id="admin-id"
                placeholder="e.g. ADM-001"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                disabled={bootstrapAdmin.isPending}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">Email Address</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="e.g. admin@university.edu.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={bootstrapAdmin.isPending}
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={bootstrapAdmin.isPending}
            className="w-full sm:w-auto"
          >
            {bootstrapAdmin.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Admin Account…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Claim Admin Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
