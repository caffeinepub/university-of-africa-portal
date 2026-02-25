import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { UserRole } from '../../backend';
import RoleGuard from '../../components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { GraduationCap, Users, BookOpen, DollarSign, ClipboardList, FileText, Home, MessageSquare } from 'lucide-react';

const sidebarLinks = [
  { icon: GraduationCap, label: 'Dashboard', to: '/admin' },
  { icon: Users, label: 'Manage Students', to: '/admin/students' },
  { icon: UserCheck, label: 'Manage Staff', to: '/admin/staff' },
  { icon: BookOpen, label: 'Manage Programmes', to: '/admin/programmes' },
  { icon: DollarSign, label: 'Manage Fees', to: '/admin/fees' },
  { icon: ClipboardList, label: 'Admissions', to: '/admin/admissions' },
  { icon: FileText, label: 'Results Management', to: '/admin/results' },
  { icon: Home, label: 'Hostel Applications', to: '/admin/hostel' },
  { icon: MessageSquare, label: 'Messaging', to: '/admin/messaging' },
];

function StaffManagementContent() {
  const { actor } = useActor();

  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor,
  });

  const staffProfiles = allProfiles.filter((p) => p.role === UserRole.staff || String(p.role) === 'staff');

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-primary text-lg">Admin Panel</h2>
          <p className="text-xs text-muted-foreground mt-1">University Management</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link key={link.to + link.label} to={link.to} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors">
              <link.icon className="h-4 w-4 flex-shrink-0" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="h-5 w-5 text-primary" />
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Loading...</span></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffProfiles.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No staff members found</TableCell></TableRow>
                    ) : (
                      staffProfiles.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.idNumber}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell><Badge variant="outline">Staff</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
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
