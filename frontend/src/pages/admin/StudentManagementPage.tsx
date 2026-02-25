import React, { useState } from 'react';
import { useGetAllStudents, useAddStudent, isAuthorizationError, ADMIN_AUTH_ERROR_MSG, extractErrorMessage } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { toast } from 'sonner';
import { Users, PlusCircle, Loader2, Search, AlertCircle } from 'lucide-react';

export default function StudentManagementPage() {
  const { data: students = [], isLoading } = useGetAllStudents();
  const addStudent = useAddStudent();

  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.idNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!name.trim() || !idNumber.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addStudent.mutateAsync({
        name: name.trim(),
        idNumber: idNumber.trim(),
        email: email.trim(),
      });
      toast.success('Student registered successfully!');
      setName('');
      setIdNumber('');
      setEmail('');
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      if (isAuthorizationError(error)) {
        setAuthError(ADMIN_AUTH_ERROR_MSG);
        toast.error(ADMIN_AUTH_ERROR_MSG);
      } else {
        toast.error(`Failed to register student: ${msg}`);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Student Management</h1>
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
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Register New Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="studentName">Full Name</Label>
              <Input
                id="studentName"
                placeholder="e.g. Amaka Okonkwo"
                value={name}
                onChange={(e) => { setName(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studentId">Matriculation Number</Label>
              <Input
                id="studentId"
                placeholder="e.g. MAT/2024/001"
                value={idNumber}
                onChange={(e) => { setIdNumber(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studentEmail">Email Address</Label>
              <Input
                id="studentEmail"
                type="email"
                placeholder="e.g. amaka@university.edu.ng"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={addStudent.isPending} className="w-full md:w-auto">
                {addStudent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
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
          <CardTitle>Registered Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {search ? 'No students match your search.' : 'No students registered yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.idNumber}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="font-mono text-sm">{student.idNumber}</TableCell>
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
