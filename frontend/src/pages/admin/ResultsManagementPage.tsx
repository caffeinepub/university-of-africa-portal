import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';
import { useAddResult, useGetCourses } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Award, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D', 'E', 'F'];

function ResultsManagementContent() {
  const { data: courses } = useGetCourses();
  const addResult = useAddResult();

  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('');
  const [grade, setGrade] = useState('');
  const [score, setScore] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !courseId || !semester || !grade || !score) return;
    try {
      await addResult.mutateAsync({
        studentId,
        courseId: BigInt(courseId),
        semester,
        grade,
        score: BigInt(score),
      });
      toast.success('Result posted successfully!');
      setStudentId(''); setCourseId(''); setSemester(''); setGrade(''); setScore('');
    } catch (err) {
      toast.error('Failed to post result. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin"><ChevronLeft className="w-4 h-4 mr-1" /> Admin Panel</Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-navy">Results Management</h1>
          <p className="text-muted-foreground text-sm">Post academic results for students</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-navy flex items-center gap-2">
              <Award className="w-5 h-5 text-gold" />
              Post Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sid">Student ID (Matric Number) *</Label>
                <Input id="sid" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. UAT/2024/001" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="course">Course *</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {(courses || []).map((c) => (
                      <SelectItem key={c.id.toString()} value={c.id.toString()}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sem">Semester *</Label>
                <Input id="sem" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. 2024/2025 First Semester" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="score">Score (0-100) *</Label>
                <Input id="score" type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="e.g. 75" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="grade">Grade *</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={!studentId || !courseId || !semester || !grade || !score || addResult.isPending}
                  className="w-full bg-gold text-navy font-semibold hover:bg-gold-light"
                >
                  {addResult.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting Result...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" /> Post Result</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
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
