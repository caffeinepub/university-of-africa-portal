import React, { useState } from 'react';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';
import {
  useGetAllResults,
  useAddResult,
  useGetAllStudents,
  useGetCourses,
  extractErrorMessage,
} from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, PlusCircle, ClipboardList } from 'lucide-react';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

function ResultsManagementContent() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: results = [], isLoading: resultsLoading } = useGetAllResults();
  const { data: students = [] } = useGetAllStudents();
  const { data: courses = [] } = useGetCourses();
  const addResult = useAddResult();

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('');
  const [grade, setGrade] = useState('');
  const [score, setScore] = useState('');

  const isActorReady = !!actor && !actorFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActorReady) {
      toast.error('Please wait — connecting to the server...');
      return;
    }
    if (!studentId || !courseId || !semester || !grade || !score) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await addResult.mutateAsync({
        studentId,
        courseId: BigInt(courseId),
        semester,
        grade,
        score: BigInt(score),
      });
      toast.success('Result posted successfully!');
      setStudentId('');
      setCourseId('');
      setSemester('');
      setGrade('');
      setScore('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const getCourseName = (courseId: bigint) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : `Course ${courseId}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Results Management</h1>
          <p className="text-muted-foreground">Post and manage student academic results</p>
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
            Post New Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resultStudentId">Student ID / Matric Number</Label>
              <Input
                id="resultStudentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. CSC/2024/001"
                disabled={addResult.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId} disabled={addResult.isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id.toString()} value={course.id.toString()}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resultSemester">Semester</Label>
              <Input
                id="resultSemester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. First Semester 2024/2025"
                disabled={addResult.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select value={grade} onValueChange={setGrade} disabled={addResult.isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resultScore">Score (0–100)</Label>
              <Input
                id="resultScore"
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 75"
                disabled={addResult.isPending}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={!isActorReady || addResult.isPending}
                className="w-full md:w-auto"
              >
                {addResult.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting Result...
                  </>
                ) : !isActorReady ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post Result
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No results posted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{result.studentId}</TableCell>
                    <TableCell>{getCourseName(result.courseId)}</TableCell>
                    <TableCell>{result.semester}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${result.grade === 'F' ? 'text-destructive' : 'text-primary'}`}>
                        {result.grade}
                      </span>
                    </TableCell>
                    <TableCell>{result.score.toString()}</TableCell>
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

export default function ResultsManagementPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <ResultsManagementContent />
    </RoleGuard>
  );
}
