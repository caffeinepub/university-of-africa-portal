import React, { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { UserRole, UserProfile } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.student);
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) return;

    if (!name.trim() || !idNumber.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const profile: UserProfile = {
      principal: identity.getPrincipal(),
      name: name.trim(),
      role,
      idNumber: idNumber.trim(),
      email: email.trim(),
    };

    try {
      await saveProfile.mutateAsync(profile);
      toast.success('Profile created successfully! Welcome to the portal.');
    } catch (error: unknown) {
      console.error('Profile setup error:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your details to set up your account on the university portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.student}>Student</SelectItem>
                <SelectItem value={UserRole.staff}>Staff</SelectItem>
                <SelectItem value={UserRole.admin}>Admin</SelectItem>
                <SelectItem value={UserRole.parent}>Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="idNumber">
              {role === UserRole.student
                ? 'Matriculation Number'
                : role === UserRole.staff || role === UserRole.admin
                ? 'Staff ID'
                : 'ID Number'}
            </Label>
            <Input
              id="idNumber"
              placeholder={
                role === UserRole.student
                  ? 'e.g. MAT/2021/001'
                  : role === UserRole.staff || role === UserRole.admin
                  ? 'e.g. STAFF/001'
                  : 'e.g. PARENT/001'
              }
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Setting up...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
