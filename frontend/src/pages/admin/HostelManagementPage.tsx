import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole, Variant_pending_approved_rejected } from '../../backend';
import { useGetAllHostelApplications, useUpdateHostelApplicationStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Home, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function HostelManagementContent() {
  const { data: applications, isLoading } = useGetAllHostelApplications();
  const updateStatus = useUpdateHostelApplicationStatus();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = (applications || []).filter((app) => {
    const matchesSearch =
      app.studentId.toLowerCase().includes(search.toLowerCase()) ||
      app.roomType.toLowerCase().includes(search.toLowerCase()) ||
      app.session.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdate = async (
    appId: bigint,
    status: Variant_pending_approved_rejected
  ) => {
    setUpdatingId(appId.toString());
    try {
      await updateStatus.mutateAsync({ appId, status });
      toast.success(`Application ${status} successfully!`);
    } catch {
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'approved')
      return (
        <Badge className="bg-success/10 text-success border-success/30 text-xs">Approved</Badge>
      );
    if (status === 'rejected')
      return (
        <Badge variant="destructive" className="text-xs">
          Rejected
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-xs border-gold/40 text-gold">
        Pending
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">
              <ChevronLeft className="w-4 h-4 mr-1" /> Admin Panel
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy">Hostel Management</h1>
            <p className="text-muted-foreground text-sm">
              {(applications || []).length} total hostel applications
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {(applications || []).filter((a) => a.status === 'pending').length} Pending
            </Badge>
            <Badge className="bg-success/10 text-success border-success/30">
              {(applications || []).filter((a) => a.status === 'approved').length} Approved
            </Badge>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student ID, room type, or session..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-navy flex items-center gap-2">
              <Home className="w-5 h-5 text-gold" />
              Hostel Applications ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Home className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No hostel applications found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((app) => (
                  <div
                    key={app.id.toString()}
                    className="p-4 rounded-lg border border-border hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-navy">
                            Student: {app.studentId}
                          </span>
                          {statusBadge(app.status)}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <span>
                            Room Type:{' '}
                            <span className="font-semibold text-navy capitalize">
                              {app.roomType}
                            </span>
                          </span>
                          <span>
                            Session:{' '}
                            <span className="font-semibold text-navy">{app.session}</span>
                          </span>
                          <span>
                            App ID:{' '}
                            <span className="font-semibold text-navy">#{app.id.toString()}</span>
                          </span>
                        </div>
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdate(app.id, Variant_pending_approved_rejected.approved)
                            }
                            disabled={updatingId === app.id.toString()}
                            variant="outline"
                            className="bg-success/10 text-success border border-success/30 hover:bg-success/20"
                          >
                            {updatingId === app.id.toString() ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdate(app.id, Variant_pending_approved_rejected.rejected)
                            }
                            disabled={updatingId === app.id.toString()}
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            {updatingId === app.id.toString() ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HostelManagementPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <HostelManagementContent />
    </RoleGuard>
  );
}
