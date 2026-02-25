import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, XCircle, Eye, Users, ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useGetPortalAccessApplications, useApprovePortalAccessApplication, useRejectPortalAccessApplication } from '../../hooks/useQueries';
import { Variant_pending_approved_rejected } from '../../backend';

interface GeneratedCredentials {
  generatedId: string;
  password: string;
  applicantName: string;
  role: string;
}

export default function AccessApplicationsPage() {
  const navigate = useNavigate();
  const { data: applications = [], isLoading, error } = useGetPortalAccessApplications();
  const approveMutation = useApprovePortalAccessApplication();
  const rejectMutation = useRejectPortalAccessApplication();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const handleApprove = async (appId: string, applicantName: string, role: string) => {
    setProcessingId(appId);
    try {
      const result = await approveMutation.mutateAsync(appId);
      if (result.__kind__ === 'ok') {
        setCredentials({
          generatedId: result.ok.generatedId,
          password: result.ok.password,
          applicantName,
          role,
        });
        setShowCredentialsModal(true);
        toast.success(`Application approved for ${applicantName}`);
      } else {
        toast.error(result.err || 'Failed to approve application');
      }
    } catch (err) {
      toast.error('Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (appId: string, applicantName: string) => {
    setProcessingId(appId);
    try {
      await rejectMutation.mutateAsync(appId);
      toast.success(`Application rejected for ${applicantName}`);
    } catch {
      toast.error('Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: Variant_pending_approved_rejected) => {
    switch (status) {
      case Variant_pending_approved_rejected.pending:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
      case Variant_pending_approved_rejected.approved:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case Variant_pending_approved_rejected.rejected:
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleLabel = (role: any) => {
    if (!role) return 'Unknown';
    const kind = role.__kind__ ?? role;
    const map: Record<string, string> = {
      student: 'Student',
      staff: 'Staff',
      parent: 'Parent',
      admin: 'Admin',
    };
    return map[kind] ?? kind;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img
            src="/assets/generated/university-crest.dim_256x256.png"
            alt="University Crest"
            className="w-10 h-10 object-contain"
          />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-primary-foreground/70">Portal Access Applications</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate({ to: '/admin' })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Access Applications</h2>
            <p className="text-sm text-muted-foreground">
              Review and manage portal access requests
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load applications. You may not have admin access.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                All Applications ({applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {applications.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No applications yet</p>
                  <p className="text-sm">Applications will appear here once submitted</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Applicant Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Programme / Dept</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app, idx) => {
                        const appId = app.submittedAt.toString() + idx;
                        const isPending = app.status === Variant_pending_approved_rejected.pending;
                        const isProcessing = processingId === appId;
                        return (
                          <TableRow key={appId} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{app.applicantName}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{app.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {getRoleLabel(app.role)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {app.programmeOrDepartment ?? '—'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(app.submittedAt)}
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="text-right">
                              {isPending ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs"
                                    disabled={isProcessing}
                                    onClick={() => handleApprove(appId, app.applicantName, getRoleLabel(app.role))}
                                  >
                                    {isProcessing ? (
                                      <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 px-3 text-xs"
                                    disabled={isProcessing}
                                    onClick={() => handleReject(appId, app.applicantName)}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              ) : app.status === Variant_pending_approved_rejected.approved && app.generatedId ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-3 text-xs"
                                  onClick={() => {
                                    setCredentials({
                                      generatedId: app.generatedId!,
                                      password: '(hidden)',
                                      applicantName: app.applicantName,
                                      role: getRoleLabel(app.role),
                                    });
                                    setShowCredentialsModal(true);
                                  }}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View ID
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
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

      {/* Credentials Modal */}
      <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Access Credentials Generated
            </DialogTitle>
            <DialogDescription>
              Share these credentials with <strong>{credentials?.applicantName}</strong> ({credentials?.role}).
              The password will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                  {credentials?.role} ID
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-background border border-border rounded px-3 py-2 text-foreground">
                    {credentials?.generatedId}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={() => copyToClipboard(credentials?.generatedId ?? '', 'ID')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {credentials?.password !== '(hidden)' && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                    Password
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm bg-background border border-border rounded px-3 py-2 text-foreground">
                      {credentials?.password}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 shrink-0"
                      onClick={() => copyToClipboard(credentials?.password ?? '', 'Password')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                Please communicate these credentials to the applicant securely. The password cannot be retrieved after this dialog is closed.
              </AlertDescription>
            </Alert>

            <Button
              className="w-full"
              onClick={() => setShowCredentialsModal(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
