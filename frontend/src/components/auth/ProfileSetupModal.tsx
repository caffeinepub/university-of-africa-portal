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

const LEVEL_OPTIONS = [
  { value: '100', label: '100 Level' },
  { value: '200', label: '200 Level' },
  { value: '300', label: '300 Level' },
  { value: '400', label: '400 Level' },
  { value: '500', label: '500 Level' },
];

export default function ProfileSetupModal({ open, onComplete, defaultRole }: ProfileSetupModalProps) {
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole ?? UserRole.student);
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [studentLevel, setStudentLevel] = useState('100');

  // Sync role when defaultRole changes (e.g., navigating between role login pages)
  useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultRole]);

  const isStudent = role === UserRole.student;

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
    if (isStudent && !department) {
      toast.error('Please enter your department.');
      return;
    }
    try {
      await saveProfile.mutateAsync({
        principal: identity.getPrincipal(),
        name,
        role,
        idNumber,
        email,
        department: isStudent ? department : undefined,
        level: isStudent ? BigInt(studentLevel) : undefined,
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
          {/* Full Name */}
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

          {/* Role */}
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

          {/* ID Number */}
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

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="profileEmail">Email Address</Label>
            <Input
              id="profileEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={saveProfile.isPending}
            />
          </div>

          {/* Department — students only */}
          {isStudent && (
            <div className="space-y-2">
              <Label htmlFor="profileDepartment">Department</Label>
              <Input
                id="profileDepartment"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                disabled={saveProfile.isPending}
              />
            </div>
          )}

          {/* Level — students only */}
          {isStudent && (
            <div className="space-y-2">
              <Label htmlFor="profileLevel">Level</Label>
              <Select
                value={studentLevel}
                onValueChange={setStudentLevel}
                disabled={saveProfile.isPending}
              >
                <SelectTrigger id="profileLevel">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
          >
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
