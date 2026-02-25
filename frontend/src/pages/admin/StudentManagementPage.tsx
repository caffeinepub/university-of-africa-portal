import React, { useState } from 'react';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';
import { useGetAllStudents, useAddStudentProfile, extractErrorMessage } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, PlusCircle, Users } from 'lucide-react';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';

function StudentManagementContent() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: students = [], isLoading } = useGetAllStudents();
  const addStudentProfile = useAddStudentProfile();

  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');

  const isActorReady = !!actor && !actorFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActorReady) {
      toast.error('Please wait — connecting to the server...');
      return;
    }
    if (!name || !idNumber || !email) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await addStudentProfile.mutateAsync({ name, idNumber, email });
      toast.success('Student registered successfully!');
      setName('');
      setIdNumber('');
      setEmail('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Register and manage student profiles</p>
        </div>
      </div>

      {!isActorReady && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting to server — please wait before submitting...</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Register New Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Full Name</Label>
              <Input
                id="studentName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                disabled={addStudentProfile.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID / Matric Number</Label>
              <Input
                id="studentId"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. CSC/2024/001"
                disabled={addStudentProfile.isPending}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="studentEmail">Email Address</Label>
              <Input
                id="studentEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john.doe@university.edu"
                disabled={addStudentProfile.isPending}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={!isActorReady || addStudentProfile.isPending}
                className="w-full md:w-auto"
              >
                {addStudentProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Registering...
                  </>
                ) : !isActorReady ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Register Student
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No students registered yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID / Matric Number</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="font-mono">{student.idNumber}</TableCell>
                    <TableCell>{student.email}</TableCell>
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

export default function StudentManagementPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <StudentManagementContent />
    </RoleGuard>
  );
}
