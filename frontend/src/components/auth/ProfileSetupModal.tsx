import React, { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, Users, Briefcase, Heart } from 'lucide-react';

const ROLES = [
  { value: UserRole.student, label: 'Student', icon: GraduationCap, desc: 'Access courses, results, and fees' },
  { value: UserRole.staff, label: 'Staff', icon: Briefcase, desc: 'View assigned courses and students' },
  { value: UserRole.parent, label: 'Parent', icon: Heart, desc: 'Track your child\'s progress' },
  { value: UserRole.admin, label: 'Admin', icon: Users, desc: 'Manage the university portal' },
];

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !name.trim() || !identity) return;

    try {
      await saveProfile.mutateAsync({
        principal: identity.getPrincipal(),
        name: name.trim(),
        email: email.trim(),
        idNumber: idNumber.trim(),
        role,
      });
      toast.success('Profile created successfully! Welcome to the portal.');
    } catch (err) {
      toast.error('Failed to create profile. Please try again.');
    }
  };

  const idLabel = role === UserRole.student ? 'Student ID / Matric Number'
    : role === UserRole.staff ? 'Staff ID'
    : role === UserRole.parent ? 'Parent ID / NIN'
    : 'Admin ID';

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold">
              <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-full h-full object-cover" />
            </div>
            <div>
              <DialogTitle className="font-serif text-navy text-xl">Welcome to the Portal</DialogTitle>
              <DialogDescription>Complete your profile to get started</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <Label className="text-sm font-semibold text-foreground mb-3 block">I am a...</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    role === value
                      ? 'border-gold bg-gold/10 text-navy'
                      : 'border-border hover:border-gold/50 hover:bg-muted'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${role === value ? 'text-gold' : 'text-muted-foreground'}`} />
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="idNumber">{idLabel}</Label>
              <Input
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={role === UserRole.student ? 'e.g. UAT/2024/001' : 'Enter your ID'}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!role || !name.trim() || saveProfile.isPending}
            className="w-full bg-navy text-white hover:bg-navy/90 font-semibold"
          >
            {saveProfile.isPending ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
