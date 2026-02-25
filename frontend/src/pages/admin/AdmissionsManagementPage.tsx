import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  useGetAdmissionApplications,
  useAdmitApplicant,
  useRejectAdmissionApplicant,
} from '../../hooks/useQueries';
import RoleGuard from '../../components/auth/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { useActor } from '../../hooks/useActor';

function AdmissionsManagementContent() {
  const navigate = useNavigate();
  const { isFetching: actorFetching } = useActor();
  const { data: applications = [], isLoading } = useGetAdmissionApplications();
  const admitMutation = useAdmitApplicant();
  const rejectMutation = useRejectAdmissionApplicant();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleAdmit = async (id: number, name: string) => {
    setProcessingId(id);
    try {
      await admitMutation.mutateAsync(id);
      toast.success(`${name} has been admitted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to admit applicant');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number, name: string) => {
    setProcessingId(id);
    try {
      await rejectMutation.mutateAsync(id);
      toast.success(`${name}'s application has been rejected`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject applicant');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: any) => {
    const s = status?.__kind__ ?? status;
    if (s === 'admitted') return <Badge className="bg-green-100 text-green-800">Admitted</Badge>;
    if (s === 'rejected') return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Admissions Management</h1>
            <p className="text-xs text-primary-foreground/70">Review and process admission applications</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Admission Applications</h2>
            <p className="text-sm text-muted-foreground">Manage all admission applications</p>
          </div>
        </div>

        {(isLoading || actorFetching) && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && !actorFetching && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Applications ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {applications.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No applications yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>JAMB Number</TableHead>
                        <TableHead>Programme</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app: any) => {
                        const isPending = (app.status?.__kind__ ?? app.status) === 'pending';
                        const isProcessing = processingId === app.id;
                        return (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.name}</TableCell>
                            <TableCell>{app.jambNumber}</TableCell>
                            <TableCell>{app.programmeChoice}</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="text-right">
                              {isPending && (
                                <div className="flex items-center justify-end gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs" disabled={isProcessing} onClick={() => handleAdmit(app.id, app.name)}>
                                    {isProcessing ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" />Admit</>}
                                  </Button>
                                  <Button size="sm" variant="destructive" className="h-7 px-3 text-xs" disabled={isProcessing} onClick={() => handleReject(app.id, app.name)}>
                                    <XCircle className="w-3 h-3 mr-1" />Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function AdmissionsManagementPage() {
  return (
    <RoleGuard requiredRole="admin">
      <AdmissionsManagementContent />
    </RoleGuard>
  );
}
