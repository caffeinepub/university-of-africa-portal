import React from 'react';
import { Copy, CheckCircle2, User, Mail, Hash, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { formatPrincipal } from '../../utils/principal';
import { useState } from 'react';

export default function AdminProfileCard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const [copied, setCopied] = useState(false);

  const principalStr = identity?.getPrincipal().toString() ?? '';

  const handleCopyPrincipal = () => {
    if (!principalStr) return;
    navigator.clipboard.writeText(principalStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Admin Profile</CardTitle>
          {userProfile && (
            <Badge variant="default" className="ml-auto text-xs">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Principal ID */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your Admin Principal
          </p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 truncate">
              {principalStr ? formatPrincipal(principalStr) : '—'}
            </code>
            {principalStr && (
              <button
                onClick={handleCopyPrincipal}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="Copy full principal"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {userProfile ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{userProfile.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{userProfile.idNumber}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Complete admin account setup to view your profile.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
