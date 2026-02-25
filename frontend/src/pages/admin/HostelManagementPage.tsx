import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  useGetHostelApplications,
  useApproveHostelApplication,
  useRejectHostelApplication,
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
import { ArrowLeft, Home, CheckCircle, XCircle } from 'lucide-react';

function HostelManagementContent() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useGetHostelApplications();
  const approveMutation = useApproveHostelApplication();
  const rejectMutation = useRejectHostelApplication();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await approveMutation.mutateAsync(id);
      toast.success('Hostel application approved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await rejectMutation.mutateAsync(id);
      toast.success('Hostel application rejected');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: any) => {
    const s = status?.__kind__ ?? status;
    if (s === 'approved') return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    if (s === 'rejected') return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Hostel Management</h1>
            <p className="text-xs text-primary-foreground/70">Manage hostel applications</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-4 h-4" />Hostel Applications ({applications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Home className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No hostel applications yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Session</TableHead>
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
                          <TableCell>{app.studentId}</TableCell>
                          <TableCell>{app.roomType}</TableCell>
                          <TableCell>{app.session}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="text-right">
                            {isPending && (
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs" disabled={isProcessing} onClick={() => handleApprove(app.id)}>
                                  {isProcessing ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" />Approve</>}
                                </Button>
                                <Button size="sm" variant="destructive" className="h-7 px-3 text-xs" disabled={isProcessing} onClick={() => handleReject(app.id)}>
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
      </main>
    </div>
  );
}

export default function HostelManagementPage() {
  return (
    <RoleGuard requiredRole="admin">
      <HostelManagementContent />
    </RoleGuard>
  );
}
