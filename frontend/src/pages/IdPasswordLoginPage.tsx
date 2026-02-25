import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLoginWithIdAndPassword } from '../hooks/useQueries';

type RoleOption = 'student' | 'staff' | 'parent' | 'admin';

const idPlaceholders: Record<RoleOption, string> = {
  student: 'Enter Matriculation Number',
  staff: 'Enter Staff ID',
  parent: 'Enter Parent ID',
  admin: 'Enter Admin ID',
};

const roleLabels: Record<RoleOption, string> = {
  student: 'Student',
  staff: 'Staff',
  parent: 'Parent',
  admin: 'Admin',
};

const dashboardRoutes: Record<string, string> = {
  student: '/student',
  staff: '/staff',
  admin: '/admin',
  parent: '/parent',
};

export default function IdPasswordLoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginWithIdAndPassword();

  const [role, setRole] = useState<RoleOption>('student');
  const [roleId, setRoleId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const profile = await loginMutation.mutateAsync({ roleId, password });
      const route = dashboardRoutes[profile.role as string] ?? '/';
      navigate({ to: route });
    } catch {
      setLoginError('Invalid ID or password. Please check your credentials or contact the administrator.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <p className="text-xs text-primary-foreground/70">Secure Portal Login</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Back link */}
          <button
            onClick={() => navigate({ to: '/portal' })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal Selection
          </button>

          <Card className="shadow-xl border-border">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-primary/20">
                  <img
                    src="/assets/generated/university-crest.dim_256x256.png"
                    alt="University Crest"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Portal Login</CardTitle>
              <CardDescription>
                Sign in with your assigned ID and password
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selector */}
                <div className="space-y-1.5">
                  <Label htmlFor="role">Select Role</Label>
                  <Select
                    value={role}
                    onValueChange={(v) => {
                      setRole(v as RoleOption);
                      setRoleId('');
                    }}
                  >
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

                {/* ID Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="roleId">
                    {role === 'student' ? 'Matriculation Number' :
                     role === 'staff' ? 'Staff ID' :
                     role === 'parent' ? 'Parent ID' : 'Admin ID'}
                  </Label>
                  <Input
                    id="roleId"
                    placeholder={idPlaceholders[role]}
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </span>
                  )}
                </Button>

                <div className="text-center space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Don't have access yet?{' '}
                    <button
                      type="button"
                      onClick={() => navigate({ to: '/apply' })}
                      className="text-primary hover:underline font-medium"
                    >
                      Apply for Portal Access
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Login with Internet Identity?{' '}
                    <button
                      type="button"
                      onClick={() => navigate({ to: '/portal' })}
                      className="text-primary hover:underline font-medium"
                    >
                      Go to Portal Selection
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        <p>
          © {new Date().getFullYear()} University Portal. Built with{' '}
          <span className="text-destructive">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
