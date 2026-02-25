import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubmitPortalAccessApplication } from '../hooks/useQueries';

type RoleOption = 'student' | 'staff' | 'parent' | 'admin';

const roleLabels: Record<RoleOption, string> = {
  student: 'Student',
  staff: 'Staff',
  parent: 'Parent',
  admin: 'Admin',
};

const programmeDeptLabel: Record<RoleOption, string> = {
  student: 'Programme',
  staff: 'Department',
  parent: "Ward's Programme",
  admin: 'Department',
};

export default function PortalAccessApplicationPage() {
  const navigate = useNavigate();
  const submitMutation = useSubmitPortalAccessApplication();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleOption>('student');
  const [programmeDept, setProgrammeDept] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ref = await submitMutation.mutateAsync({
        applicantName: fullName,
        email,
        role,
        programmeOrDepartment: programmeDept || null,
      });
      setRefId(ref);
      setSubmitted(true);
    } catch {
      // error handled via mutation state
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center shadow-xl border-border">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your application has been submitted. You will receive your login credentials once
                your access is approved by the administrator.
              </p>
            </div>
            <div className="bg-muted rounded-lg px-6 py-3 w-full">
              <p className="text-xs text-muted-foreground mb-1">Reference ID</p>
              <p className="font-mono text-sm font-semibold text-primary break-all">{refId}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: '/' })}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={() => navigate({ to: '/id-login' })}
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <img
            src="/assets/generated/university-crest.dim_256x256.png"
            alt="University Crest"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold leading-tight">University Portal</h1>
            <p className="text-xs text-primary-foreground/70">Portal Access Application</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Back link */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <Card className="shadow-xl border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Apply for Portal Access</CardTitle>
                <CardDescription>
                  Fill in your details to request access to your portal
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
                <Select value={role} onValueChange={(v) => setRole(v as RoleOption)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(roleLabels) as RoleOption[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabels[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Programme / Department */}
              <div className="space-y-1.5">
                <Label htmlFor="programmeDept">
                  {programmeDeptLabel[role]}
                </Label>
                <Input
                  id="programmeDept"
                  placeholder={`Enter your ${programmeDeptLabel[role].toLowerCase()}`}
                  value={programmeDept}
                  onChange={(e) => setProgrammeDept(e.target.value)}
                />
              </div>

              {/* Error */}
              {submitMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {submitMutation.error instanceof Error
                      ? submitMutation.error.message
                      : 'Failed to submit application. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Already have credentials?{' '}
                <button
                  type="button"
                  onClick={() => navigate({ to: '/id-login' })}
                  className="text-primary hover:underline font-medium"
                >
                  Login with your ID
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
