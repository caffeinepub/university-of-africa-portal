import React, { useState } from 'react';
import { useGetCourses, useAddCourse, isAuthorizationError, ADMIN_AUTH_ERROR_MSG, extractErrorMessage } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
import { toast } from 'sonner';
import { BookOpen, PlusCircle, Loader2, AlertCircle } from 'lucide-react';

export default function ProgrammeManagementPage() {
  const { data: courses = [], isLoading } = useGetCourses();
  const addCourse = useAddCourse();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [programme, setProgramme] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!code.trim() || !name.trim() || !semester.trim() || !programme.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addCourse.mutateAsync({
        code: code.trim(),
        name: name.trim(),
        semester: semester.trim(),
        programme: programme.trim(),
      });
      toast.success('Course added successfully!');
      setCode('');
      setName('');
      setSemester('');
      setProgramme('');
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      if (isAuthorizationError(error)) {
        setAuthError(ADMIN_AUTH_ERROR_MSG);
        toast.error(ADMIN_AUTH_ERROR_MSG);
      } else {
        toast.error(`Failed to add course: ${msg}`);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Programme & Course Management</h1>
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
            Add New Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input
                id="courseCode"
                placeholder="e.g. CSC 301"
                value={code}
                onChange={(e) => { setCode(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                placeholder="e.g. Data Structures"
                value={name}
                onChange={(e) => { setName(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="courseSemester">Semester</Label>
              <Input
                id="courseSemester"
                placeholder="e.g. First Semester 2024/2025"
                value={semester}
                onChange={(e) => { setSemester(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="courseProgramme">Programme</Label>
              <Input
                id="courseProgramme"
                placeholder="e.g. Computer Science"
                value={programme}
                onChange={(e) => { setProgramme(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={addCourse.isPending} className="w-full md:w-auto">
                {addCourse.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Course
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Catalogue</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No courses added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Semester</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={String(course.id)}>
                    <TableCell>
                      <Badge variant="outline">{course.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.programme}</TableCell>
                    <TableCell>{course.semester}</TableCell>
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
