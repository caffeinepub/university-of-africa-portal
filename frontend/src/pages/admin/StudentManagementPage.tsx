import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useGetAllStudents, useAddStudentProfile } from '../../hooks/useQueries';
import RoleGuard from '../../components/auth/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Users, Plus } from 'lucide-react';
import { useActor } from '../../hooks/useActor';

function StudentManagementContent() {
  const navigate = useNavigate();
  const { isFetching: actorFetching } = useActor();
  const { data: students = [], isLoading } = useGetAllStudents();
  const addStudent = useAddStudentProfile();

  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [programme, setProgramme] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStudent.mutateAsync({ name, idNumber, email, programme });
      toast.success('Student registered successfully');
      setName(''); setIdNumber(''); setEmail(''); setProgramme('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register student');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Student Management</h1>
            <p className="text-xs text-primary-foreground/70">Register and manage students</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Add Student Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />Register New Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="Student name" value={name} onChange={e => setName(e.target.value)} required disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Matriculation Number</Label>
                <Input placeholder="e.g. MATRIC/2024/001" value={idNumber} onChange={e => setIdNumber(e.target.value)} required disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} required disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Programme</Label>
                <Input placeholder="e.g. Computer Science" value={programme} onChange={e => setProgramme(e.target.value)} disabled={actorFetching} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={addStudent.isPending || actorFetching} className="w-full sm:w-auto">
                  {addStudent.isPending ? 'Registering...' : 'Register Student'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />Registered Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No students registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Matric Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Programme</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s: any) => (
                      <TableRow key={s.idNumber}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.idNumber}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.programme ?? s.department ?? '—'}</TableCell>
                      </TableRow>
                    ))}
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

export default function StudentManagementPage() {
  return (
    <RoleGuard requiredRole="admin">
      <StudentManagementContent />
    </RoleGuard>
  );
}
