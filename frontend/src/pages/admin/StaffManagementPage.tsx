import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';
import { useGetAllUserProfiles } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Search, Briefcase } from 'lucide-react';

function StaffManagementContent() {
  const { data: allUsers, isLoading } = useGetAllUserProfiles();
  const [search, setSearch] = useState('');

  const staffList = (allUsers || []).filter((u) => u.role === UserRole.staff);
  const filtered = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.idNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin"><ChevronLeft className="w-4 h-4 mr-1" /> Admin Panel</Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy">Staff Management</h1>
            <p className="text-muted-foreground text-sm">{staffList.length} registered staff members</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="pl-9"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-navy flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gold" />
              Staff Members ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>{search ? 'No staff match your search.' : 'No staff registered yet.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Staff ID</th>
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-center py-3 px-3 text-muted-foreground font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((staff) => (
                      <tr key={staff.principal.toString()} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-3 font-semibold text-navy">{staff.name}</td>
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{staff.idNumber || '—'}</td>
                        <td className="py-3 px-3 text-muted-foreground">{staff.email || '—'}</td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant="secondary" className="text-xs capitalize">{staff.role}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StaffManagementPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <StaffManagementContent />
    </RoleGuard>
  );
}
