import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2 } from 'lucide-react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { UserRole } from '../../backend';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  open: boolean;
  onComplete?: () => void;
  defaultRole?: UserRole;
}

export default function ProfileSetupModal({ open, onComplete, defaultRole }: ProfileSetupModalProps) {
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole ?? UserRole.student);
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');

  // Sync role when defaultRole changes (e.g., navigating between role login pages)
  useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error('Not authenticated. Please log in first.');
      return;
    }
    if (!name || !idNumber || !email) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await saveProfile.mutateAsync({
        principal: identity.getPrincipal(),
        name,
        role,
        idNumber,
        email,
      });
      toast.success('Profile created successfully!');
      onComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save profile: ${msg}`);
    }
  };

  const isRoleLocked = !!defaultRole;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            {isRoleLocked
              ? `You are registering as a ${role.charAt(0).toUpperCase() + role.slice(1)}. Please provide your details to set up your account.`
              : 'Please provide your details to set up your account.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="profileName">Full Name</Label>
            <Input
              id="profileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={saveProfile.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            {isRoleLocked ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted text-sm font-medium text-foreground">
                <span className="capitalize">{role}</span>
                <span className="ml-auto text-xs text-muted-foreground">(pre-selected)</span>
              </div>
            ) : (
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
                disabled={saveProfile.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.student}>Student</SelectItem>
                  <SelectItem value={UserRole.staff}>Staff</SelectItem>
                  <SelectItem value={UserRole.parent}>Parent</SelectItem>
                  <SelectItem value={UserRole.admin}>Administrator</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profileIdNumber">
              {role === UserRole.student
                ? 'Matric Number / Student ID'
                : role === UserRole.staff
                ? 'Staff ID'
                : role === UserRole.parent
                ? 'Parent ID'
                : 'Admin ID'}
            </Label>
            <Input
              id="profileIdNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter your ID number"
              disabled={saveProfile.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profileEmail">Email Address</Label>
            <Input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={saveProfile.isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving Profile...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
