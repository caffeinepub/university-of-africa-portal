import React, { useState } from 'react';
import {
  useGetAllResults,
  useGetAllStudents,
  useGetCourses,
  useAddResult,
  isAuthorizationError,
  ADMIN_AUTH_ERROR_MSG,
  extractErrorMessage,
} from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { ClipboardList, PlusCircle, Loader2, AlertCircle } from 'lucide-react';

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ResultsManagementPage() {
  const { data: results = [], isLoading: resultsLoading } = useGetAllResults();
  const { data: students = [] } = useGetAllStudents();
  const { data: courses = [] } = useGetCourses();
  const addResult = useAddResult();

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('');
  const [grade, setGrade] = useState('');
  const [score, setScore] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const gradeColor = (g: string) => {
    if (g === 'A') return 'default';
    if (g === 'B') return 'secondary';
    if (g === 'F') return 'destructive';
    return 'outline';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!studentId || !courseId || !semester.trim() || !grade || !score) {
      toast.error('Please fill in all fields');
      return;
    }

    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      toast.error('Score must be between 0 and 100');
      return;
    }

    try {
      await addResult.mutateAsync({
        studentId,
        courseId: BigInt(courseId),
        semester: semester.trim(),
        grade,
        score: BigInt(scoreNum),
      });
      toast.success('Result posted successfully!');
      setStudentId('');
      setCourseId('');
      setSemester('');
      setGrade('');
      setScore('');
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      if (isAuthorizationError(error)) {
        setAuthError(ADMIN_AUTH_ERROR_MSG);
        toast.error(ADMIN_AUTH_ERROR_MSG);
      } else {
        toast.error(`Failed to post result: ${msg}`);
      }
    }
  };

  const getStudentName = (id: string) =>
    students.find((s) => s.idNumber === id)?.name ?? id;

  const getCourseName = (id: bigint) =>
    courses.find((c) => c.id === id)?.name ?? String(id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Results Management</h1>
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
            Post New Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={(v) => { setStudentId(v); setAuthError(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.idNumber} value={s.idNumber}>
                      {s.name} ({s.idNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={(v) => { setCourseId(v); setAuthError(null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                placeholder="e.g. First Semester 2024/2025"
                value={semester}
                onChange={(e) => { setSemester(e.target.value); setAuthError(null); }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="score">Score (0–100)</Label>
              <Input
                id="score"
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 75"
                value={score}
                onChange={(e) => { setScore(e.target.value); setAuthError(null); }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Grade</Label>
              <Select value={grade} onValueChange={(v) => { setGrade(v); setAuthError(null); }}>
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

            <div className="flex items-end">
              <Button type="submit" disabled={addResult.isPending} className="w-full">
                {addResult.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
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
          <CardTitle>All Results</CardTitle>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No results posted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{getStudentName(r.studentId)}</TableCell>
                    <TableCell>{getCourseName(r.courseId)}</TableCell>
                    <TableCell>{r.semester}</TableCell>
                    <TableCell>{String(r.score)}</TableCell>
                    <TableCell>
                      <Badge variant={gradeColor(r.grade)}>{r.grade}</Badge>
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
