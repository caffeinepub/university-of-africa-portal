import React, { useState } from 'react';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';
import {
  useGetAllAdmissionApplications,
  useUpdateAdmissionStatus,
  extractErrorMessage,
} from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, Search, GraduationCap, CheckCircle, XCircle } from 'lucide-react';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole, AdmissionStatus } from '../../backend';

function AdmissionsManagementContent() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: applications = [], isLoading } = useGetAllAdmissionApplications();
  const updateStatus = useUpdateAdmissionStatus();

  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<bigint | null>(null);

  const isActorReady = !!actor && !actorFetching;

  const filtered = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.jambNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.programmeChoice.toLowerCase().includes(search.toLowerCase()),
  );

  const handleUpdateStatus = async (appId: bigint, status: AdmissionStatus) => {
    if (!isActorReady) {
      toast.error('Please wait — connecting to the server...');
      return;
    }
    setProcessingId(appId);
    try {
      await updateStatus.mutateAsync({ appId, status });
      toast.success(
        `Application ${status === AdmissionStatus.admitted ? 'admitted' : 'rejected'} successfully!`,
      );
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case AdmissionStatus.admitted:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Admitted</Badge>;
      case AdmissionStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admissions Management</h1>
          <p className="text-muted-foreground">Review and process admission applications</p>
        </div>
      </div>

      {!isActorReady && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting to server — please wait...</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Admission Applications ({applications.length})</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, JAMB number, or programme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {search ? 'No applications match your search.' : 'No admission applications yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>JAMB Number</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app) => {
                  const isProcessing = processingId === app.id;
                  const isPending = app.status === AdmissionStatus.pending;
                  return (
                    <TableRow key={app.id.toString()}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell className="font-mono">{app.jambNumber}</TableCell>
                      <TableCell>{app.programmeChoice}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        {isPending ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50"
                              disabled={!isActorReady || isProcessing}
                              onClick={() => handleUpdateStatus(app.id, AdmissionStatus.admitted)}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Admit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-700 border-red-300 hover:bg-red-50"
                              disabled={!isActorReady || isProcessing}
                              onClick={() => handleUpdateStatus(app.id, AdmissionStatus.rejected)}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No action needed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdmissionsManagementPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <AdmissionsManagementContent />
    </RoleGuard>
  );
}
