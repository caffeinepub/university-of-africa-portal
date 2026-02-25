import React, { useState } from 'react';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';
import { useGetCourses, useAddCourse, extractErrorMessage } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, PlusCircle, BookOpen } from 'lucide-react';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';

function ProgrammeManagementContent() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: courses = [], isLoading } = useGetCourses();
  const addCourse = useAddCourse();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [programme, setProgramme] = useState('');

  const isActorReady = !!actor && !actorFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActorReady) {
      toast.error('Please wait — connecting to the server...');
      return;
    }
    if (!code || !name || !semester || !programme) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await addCourse.mutateAsync({ code, name, semester, programme });
      toast.success('Course added successfully!');
      setCode('');
      setName('');
      setSemester('');
      setProgramme('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Programme Management</h1>
          <p className="text-muted-foreground">Add and manage courses across all programmes</p>
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
            Add New Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input
                id="courseCode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CSC301"
                disabled={addCourse.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Structures"
                disabled={addCourse.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseSemester">Semester</Label>
              <Input
                id="courseSemester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. First Semester"
                disabled={addCourse.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseProgramme">Programme</Label>
              <Input
                id="courseProgramme"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                placeholder="e.g. Computer Science"
                disabled={addCourse.isPending}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={!isActorReady || addCourse.isPending}
                className="w-full md:w-auto"
              >
                {addCourse.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Course...
                  </>
                ) : !isActorReady ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
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
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No courses added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Programme</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id.toString()}>
                    <TableCell className="font-mono font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.programme}</TableCell>
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

export default function ProgrammeManagementPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <ProgrammeManagementContent />
    </RoleGuard>
  );
}
