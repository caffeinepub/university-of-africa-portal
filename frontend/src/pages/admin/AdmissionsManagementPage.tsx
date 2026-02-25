import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole, AdmissionStatus } from '../../backend';
import { useGetAllAdmissionApplications, useUpdateAdmissionStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Search, FileText, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function AdmissionsManagementContent() {
  const { data: applications, isLoading } = useGetAllAdmissionApplications();
  const updateStatus = useUpdateAdmissionStatus();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = (applications || []).filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.jambNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.programmeChoice.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (appId: bigint, status: AdmissionStatus) => {
    setUpdatingId(appId.toString());
    try {
      await updateStatus.mutateAsync({ appId, status });
      toast.success(`Application ${status} successfully!`);
    } catch (err) {
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'admitted') return <Badge className="bg-success/10 text-success border-success/30 text-xs">Admitted</Badge>;
    if (status === 'rejected') return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
    return <Badge variant="outline" className="text-xs border-gold/40 text-gold">Pending</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin"><ChevronLeft className="w-4 h-4 mr-1" /> Admin Panel</Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy">Admissions Management</h1>
            <p className="text-muted-foreground text-sm">{(applications || []).length} total applications</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {(applications || []).filter((a) => a.status === 'pending').length} Pending
            </Badge>
            <Badge className="bg-success/10 text-success border-success/30">
              {(applications || []).filter((a) => a.status === 'admitted').length} Admitted
            </Badge>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, JAMB number, or programme..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="admitted">Admitted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-navy flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              Applications ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No applications found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((app) => (
                  <div key={app.id.toString()} className="p-4 rounded-lg border border-border hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-navy">{app.name}</span>
                          {statusBadge(app.status)}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <span>JAMB: <span className="font-mono font-semibold text-navy">{app.jambNumber}</span></span>
                          <span>Programme: <span className="font-semibold text-navy">{app.programmeChoice}</span></span>
                          <span>App ID: <span className="font-semibold text-navy">#{app.id.toString()}</span></span>
                        </div>
                        {app.oLevelResults.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {app.oLevelResults.slice(0, 5).map((r, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(app.id, AdmissionStatus.admitted)}
                            disabled={updatingId === app.id.toString()}
                            className="bg-success/10 text-success border border-success/30 hover:bg-success/20"
                            variant="outline"
                          >
                            {updatingId === app.id.toString() ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" /> Admit</>}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(app.id, AdmissionStatus.rejected)}
                            disabled={updatingId === app.id.toString()}
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            {updatingId === app.id.toString() ? <Loader2 className="w-3 h-3 animate-spin" /> : <><XCircle className="w-3 h-3 mr-1" /> Reject</>}
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

export default function AdmissionsManagementPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <AdmissionsManagementContent />
    </RoleGuard>
  );
}
