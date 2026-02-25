import React, { useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetCourses, useAddCourse } from '../../hooks/useQueries';

export default function ProgrammeManagementPage() {
  const [code, setCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState('');
  const [programme, setProgramme] = useState('');

  const { data: courses = [], isLoading } = useGetCourses();
  const addCourse = useAddCourse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !courseName.trim() || !semester.trim() || !programme.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      await addCourse.mutateAsync({
        code: code.trim(),
        name: courseName.trim(),
        semester: semester.trim(),
        programme: programme.trim(),
      });
      toast.success(`Course "${courseName}" added successfully!`);
      setCode('');
      setCourseName('');
      setSemester('');
      setProgramme('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add course';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Programme & Course Management</h1>
        <p className="text-muted-foreground">Add and manage courses across all programmes and semesters.</p>
      </div>

      {/* Add Course Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Add New Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-code">Course Code</Label>
              <Input
                id="course-code"
                placeholder="e.g. CSC 301"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                placeholder="e.g. Data Structures and Algorithms"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-semester">Semester</Label>
              <Input
                id="course-semester"
                placeholder="e.g. First Semester 2024/2025"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-programme">Programme</Label>
              <Input
                id="course-programme"
                placeholder="e.g. Computer Science"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={addCourse.isPending} className="w-full md:w-auto">
                {addCourse.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Course...
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

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            All Courses
            <Badge variant="secondary" className="ml-auto">
              {courses.length} courses
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No courses added yet. Add your first course above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Programme</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={String(course.id)}>
                    <TableCell className="font-mono font-semibold">{course.code}</TableCell>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.programme}</Badge>
                    </TableCell>
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
