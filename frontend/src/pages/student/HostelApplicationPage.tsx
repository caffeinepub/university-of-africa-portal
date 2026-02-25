import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetMyHostelApplication, useApplyForHostel, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, ChevronLeft, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room', desc: 'Private room for one student' },
  { value: 'double', label: 'Double Room', desc: 'Shared room for two students' },
  { value: 'shared', label: 'Shared Room', desc: 'Shared room for four students' },
];

const SESSIONS = ['2024/2025', '2025/2026'];

export default function HostelApplicationPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const studentId = userProfile?.idNumber ?? '';

  const { data: existingApp, isLoading } = useGetMyHostelApplication(studentId);
  const applyForHostel = useApplyForHostel();

  const [roomType, setRoomType] = useState('');
  const [session, setSession] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomType || !session) return;
    try {
      await applyForHostel.mutateAsync({ studentId, roomType, session });
      toast.success('Hostel application submitted successfully!');
    } catch {
      toast.error('Failed to submit hostel application. Please try again.');
    }
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-300',
      label: 'Under Review',
    },
    approved: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-300',
      label: 'Approved',
    },
    rejected: {
      icon: XCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10 border-destructive/30',
      label: 'Rejected',
    },
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/student">
              <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Hostel Application</h1>
          <p className="text-muted-foreground text-sm">Apply for on-campus accommodation</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : existingApp ? (
          <div>
            {(() => {
              const appStatus = (existingApp as any).status;
              const statusKey = (appStatus?.__kind__ ?? appStatus ?? 'pending') as keyof typeof statusConfig;
              const config = statusConfig[statusKey] ?? statusConfig.pending;
              const Icon = config.icon;
              return (
                <Card className={`border-2 mb-6 ${config.bg}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Icon className={`w-10 h-10 ${config.color} flex-shrink-0`} />
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          Application {config.label}
                        </h3>
                        {statusKey === 'approved' && (
                          <p className="text-green-600 font-semibold mb-2">
                            Congratulations! Your hostel application has been approved.
                          </p>
                        )}
                        {statusKey === 'rejected' && (
                          <p className="text-destructive mb-2">
                            Unfortunately, your hostel application was not successful.
                          </p>
                        )}
                        {statusKey === 'pending' && (
                          <p className="text-muted-foreground mb-2">
                            Your application is being reviewed. Please check back later.
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Room Type</p>
                            <p className="font-semibold capitalize">{(existingApp as any).roomType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Session</p>
                            <p className="font-semibold">{(existingApp as any).session}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge
                              variant={
                                statusKey === 'approved'
                                  ? 'secondary'
                                  : statusKey === 'rejected'
                                  ? 'destructive'
                                  : 'outline'
                              }
                              className="capitalize"
                            >
                              {statusKey}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Hostel Application Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="mb-2 block">Room Type Preference *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ROOM_TYPES.map(({ value, label, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRoomType(value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          roomType === value
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold text-sm">{label}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="session">Academic Session *</Label>
                  <Select value={session} onValueChange={setSession}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={!roomType || !session || applyForHostel.isPending}
                  className="w-full font-semibold"
                >
                  {applyForHostel.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
