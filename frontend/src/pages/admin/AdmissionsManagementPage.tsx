import React, { useState } from 'react';
import {
  useGetAllAdmissionApplications,
  useUpdateAdmissionStatus,
  isAuthorizationError,
  ADMIN_AUTH_ERROR_MSG,
  extractErrorMessage,
} from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AdmissionStatus } from '../../backend';
import { toast } from 'sonner';
import { GraduationCap, Loader2, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AdmissionsManagementPage() {
  const { data: applications = [], isLoading } = useGetAllAdmissionApplications();
  const updateStatus = useUpdateAdmissionStatus();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'admitted' | 'rejected'>('all');
  const [authError, setAuthError] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.jambNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.programmeChoice.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && app.status === AdmissionStatus.pending) ||
      (filter === 'admitted' && app.status === AdmissionStatus.admitted) ||
      (filter === 'rejected' && app.status === AdmissionStatus.rejected);
    return matchesSearch && matchesFilter;
  });

  const handleUpdateStatus = async (appId: bigint, status: AdmissionStatus) => {
    setAuthError(null);
    try {
      await updateStatus.mutateAsync({ appId, status });
      toast.success(
        status === AdmissionStatus.admitted
          ? 'Applicant admitted successfully!'
          : 'Application rejected.'
      );
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      if (isAuthorizationError(error)) {
        setAuthError(ADMIN_AUTH_ERROR_MSG);
        toast.error(ADMIN_AUTH_ERROR_MSG);
      } else {
        toast.error(`Failed to update admission status: ${msg}`);
      }
    }
  };

  const statusBadge = (status: AdmissionStatus) => {
    if (status === AdmissionStatus.admitted)
      return <Badge className="bg-green-100 text-green-800 border-green-200">Admitted</Badge>;
    if (status === AdmissionStatus.rejected)
      return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Admissions Management</h1>
      </div>

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authorization Error</AlertTitle>
          <AlertDescription>
            {authError}
            <button className="ml-2 underline font-medium" onClick={() => setAuthError(null)}>
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Admission Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, JAMB number, or programme..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'admitted', 'rejected'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {search || filter !== 'all'
                ? 'No applications match your filters.'
                : 'No admission applications yet.'}
            </p>
          ) : (
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
                {filtered.map((app) => (
                  <TableRow key={String(app.id)}>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell className="font-mono text-sm">{app.jambNumber}</TableCell>
                    <TableCell>{app.programmeChoice}</TableCell>
                    <TableCell>{statusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      {app.status === AdmissionStatus.pending && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            disabled={updateStatus.isPending}
                            onClick={() => handleUpdateStatus(app.id, AdmissionStatus.admitted)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Admit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-700 border-red-300 hover:bg-red-50"
                            disabled={updateStatus.isPending}
                            onClick={() => handleUpdateStatus(app.id, AdmissionStatus.rejected)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
