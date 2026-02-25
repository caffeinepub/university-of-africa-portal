import React, { useState } from 'react';
import {
  useGetAllHostelApplications,
  useUpdateHostelApplicationStatus,
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
import { Variant_pending_approved_rejected } from '../../backend';
import { toast } from 'sonner';
import { Home, Loader2, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function HostelManagementPage() {
  const { data: applications = [], isLoading } = useGetAllHostelApplications();
  const updateStatus = useUpdateHostelApplicationStatus();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [authError, setAuthError] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.studentId.toLowerCase().includes(search.toLowerCase()) ||
      app.roomType.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleUpdateStatus = async (
    appId: bigint,
    status: Variant_pending_approved_rejected
  ) => {
    setAuthError(null);
    try {
      await updateStatus.mutateAsync({ appId, status });
      toast.success(`Application ${status} successfully!`);
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      if (isAuthorizationError(error)) {
        setAuthError(ADMIN_AUTH_ERROR_MSG);
        toast.error(ADMIN_AUTH_ERROR_MSG);
      } else {
        toast.error(`Failed to update status: ${msg}`);
      }
    }
  };

  const statusBadge = (status: Variant_pending_approved_rejected) => {
    if (status === Variant_pending_approved_rejected.approved)
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    if (status === Variant_pending_approved_rejected.rejected)
      return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Home className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Hostel Management</h1>
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
          <CardTitle>Hostel Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student ID or room type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
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
              {search || filter !== 'all' ? 'No applications match your filters.' : 'No hostel applications yet.'}
            </p>
          ) : (
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
                {filtered.map((app) => (
                  <TableRow key={String(app.id)}>
                    <TableCell className="font-mono text-sm">{app.studentId}</TableCell>
                    <TableCell>{app.roomType}</TableCell>
                    <TableCell>{app.session}</TableCell>
                    <TableCell>{statusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      {app.status === Variant_pending_approved_rejected.pending && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              handleUpdateStatus(
                                app.id,
                                Variant_pending_approved_rejected.approved
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-700 border-red-300 hover:bg-red-50"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              handleUpdateStatus(
                                app.id,
                                Variant_pending_approved_rejected.rejected
                              )
                            }
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
