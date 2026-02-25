import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetCallerUserProfile,
  useGetResultsForStudent,
  useLinkParentToStudent,
} from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import {
  LayoutDashboard,
  FileText,
  AlertCircle,
  RefreshCw,
  Link2,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

interface ResultItem {
  studentId: string;
  courseId: number | bigint;
  semester: string;
  grade: string;
  score: number | bigint;
}

const sidebarLinks = [
  { label: 'Dashboard', href: '/parent', icon: LayoutDashboard },
] as const;

const gradePoints: Record<string, number> = {
  A: 5, B: 4, C: 3, D: 2, E: 1, F: 0,
};

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [studentIdInput, setStudentIdInput] = useState('');
  const [linkedStudentId, setLinkedStudentId] = useState('');
  const [studentResults, setStudentResults] = useState<ResultItem[]>([]);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    error: profileError,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  const getResultsForStudent = useGetResultsForStudent();
  const linkParent = useLinkParentToStudent();

  const handleLinkStudent = async () => {
    if (!studentIdInput.trim()) return;
    try {
      const parentId = userProfile?.idNumber ?? '';
      await linkParent.mutateAsync({ parentId, studentId: studentIdInput.trim() });
      setLinkedStudentId(studentIdInput.trim());
      const results = await getResultsForStudent.mutateAsync(studentIdInput.trim());
      setStudentResults((results as ResultItem[]) ?? []);
      toast.success('Student linked successfully');
    } catch {
      toast.error('Failed to link student. Please check the student ID.');
    }
  };

  // Group results by semester
  const resultsBySemester = studentResults.reduce<Record<string, ResultItem[]>>((acc, r) => {
    const key = r.semester;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const calculateGPA = (semResults: ResultItem[]) => {
    if (semResults.length === 0) return '0.00';
    const total = semResults.reduce((sum, r) => sum + (gradePoints[r.grade] ?? 0), 0);
    return (total / semResults.length).toFixed(2);
  };

  // Loading state
  if (profileLoading || !profileFetched) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-2">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-9 w-full rounded-md" />
        </aside>
        <div className="flex-1 p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load profile</h2>
          <p className="text-muted-foreground text-sm">
            There was an error loading your profile. Please try again.
          </p>
          <Button onClick={() => refetchProfile()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 gap-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Parent Portal
        </p>
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => navigate({ to: link.href })}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </button>
          );
        })}
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {userProfile.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Parent ID: {userProfile.idNumber} · {userProfile.email}
          </p>
        </div>

        {/* Link Student Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-5 w-5 text-primary" />
              Link Student Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="studentId" className="sr-only">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="Enter student matriculation number"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                />
              </div>
              <Button
                onClick={handleLinkStudent}
                disabled={!studentIdInput.trim() || linkParent.isPending}
              >
                {linkParent.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Linking...
                  </span>
                ) : (
                  'Link Student'
                )}
              </Button>
            </div>
            {linkedStudentId && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Linked to student: <strong>{linkedStudentId}</strong>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Student Results */}
        {studentResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Academic Results
            </h2>
            {Object.entries(resultsBySemester).map(([semester, semResults]) => (
              <Card key={semester}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{semester}</CardTitle>
                    <Badge variant="outline">GPA: {calculateGPA(semResults)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {semResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <span className="text-foreground/80">
                          Course #{String(result.courseId)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{String(result.score)}/100</span>
                          <Badge
                            variant={result.grade === 'F' ? 'destructive' : 'secondary'}
                          >
                            {result.grade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {linkedStudentId && studentResults.length === 0 && !getResultsForStudent.isPending && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No results available for this student yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
