import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  useGetResults,
  usePostResult,
  useGetAllStudents,
  useGetCourses,
} from '../../hooks/useQueries';
import RoleGuard from '../../components/auth/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, BarChart3, Plus } from 'lucide-react';
import { useActor } from '../../hooks/useActor';

function ResultsManagementContent() {
  const navigate = useNavigate();
  const { isFetching: actorFetching } = useActor();
  const { data: results = [], isLoading: resultsLoading } = useGetResults();
  const { data: students = [] } = useGetAllStudents();
  const { data: courses = [] } = useGetCourses();
  const postResult = usePostResult();

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('First');
  const [grade, setGrade] = useState('A');
  const [score, setScore] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postResult.mutateAsync({
        studentId,
        courseId: Number(courseId),
        semester,
        grade,
        score: Number(score),
      });
      toast.success('Result posted successfully');
      setStudentId(''); setCourseId(''); setScore('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post result');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Results Management</h1>
            <p className="text-xs text-primary-foreground/70">Post and manage student results</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />Post Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Student</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {(students as any[]).map((s: any) => (
                      <SelectItem key={s.idNumber} value={s.idNumber}>{s.name} ({s.idNumber})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {(courses as any[]).map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.code} - {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First">First Semester</SelectItem>
                    <SelectItem value="Second">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['A','B','C','D','E','F'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Score</Label>
                <Input type="number" min="0" max="100" placeholder="0-100" value={score} onChange={e => setScore(e.target.value)} required disabled={actorFetching} />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={postResult.isPending || actorFetching} className="w-full">
                  {postResult.isPending ? 'Posting...' : 'Post Result'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />Posted Results ({(results as any[]).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {resultsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (results as any[]).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No results posted yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(results as any[]).map((r: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{r.studentId}</TableCell>
                        <TableCell>{r.courseId}</TableCell>
                        <TableCell>{r.semester}</TableCell>
                        <TableCell className="font-bold">{r.grade}</TableCell>
                        <TableCell>{r.score}</TableCell>
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

export default function ResultsManagementPage() {
  return (
    <RoleGuard requiredRole="admin">
      <ResultsManagementContent />
    </RoleGuard>
  );
}
