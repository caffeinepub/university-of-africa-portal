import React, { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
  Home,
  GraduationCap,
  Award,
  CreditCard,
  BookOpen,
  Link2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useGetCallerUserProfile, useGetResultsForStudent } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';

const parentNavItems = [
  { label: 'Dashboard', to: '/parent/dashboard', icon: Home },
  { label: 'Student Overview', to: '/parent/overview', icon: GraduationCap },
  { label: 'Student Results', to: '/parent/results', icon: Award },
  { label: 'Fee Status', to: '/parent/fees', icon: CreditCard },
  { label: 'Course Registrations', to: '/parent/courses', icon: BookOpen },
];

export default function ParentDashboard() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: profile } = useGetCallerUserProfile();
  const { actor } = useActor();

  const [studentId, setStudentId] = useState('');
  const [linkedStudentId, setLinkedStudentId] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const { data: studentResults = [], isLoading: resultsLoading } = useGetResultsForStudent(linkedStudentId);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !actor) return;
    setIsLinking(true);
    try {
      await actor.linkParentToStudent(studentId.trim());
      setLinkedStudentId(studentId.trim());
      toast.success(`Successfully linked to student: ${studentId}`);
      setStudentId('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to link student';
      toast.error(message);
    } finally {
      setIsLinking(false);
    }
  };

  // Group results by semester
  const semesterMap: Record<string, typeof studentResults> = {};
  for (const result of studentResults) {
    if (!semesterMap[result.semester]) semesterMap[result.semester] = [];
    semesterMap[result.semester].push(result);
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent Portal</p>
          <p className="text-sm font-medium text-foreground mt-1 truncate">{profile?.name ?? 'Parent'}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {parentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.to || currentPath.startsWith(item.to + '/');
            return (
              <button
                key={item.to}
                onClick={() => navigate({ to: item.to })}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">ID: {profile?.idNumber ?? '—'}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome, {profile?.name?.split(' ')[0] ?? 'Parent'}!
            </h1>
            <p className="text-muted-foreground">Monitor your child's academic progress.</p>
          </div>

          {/* Services Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Parent Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {parentNavItems.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.to}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => navigate({ to: item.to })}
                  >
                    <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2 text-center">
                      <Icon className="h-6 w-6 text-primary" />
                      <p className="text-xs font-medium leading-tight">{item.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Link Student */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Link to Student Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLinkStudent} className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="student-id-link">Student ID / Matric Number</Label>
                  <Input
                    id="student-id-link"
                    placeholder="Enter student's matric number"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isLinking}>
                    {isLinking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Link'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Student Results */}
          {linkedStudentId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Academic Results — {linkedStudentId}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">Loading results...</span>
                  </div>
                ) : studentResults.length === 0 ? (
                  <p className="text-muted-foreground py-4">No results found for this student.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(semesterMap).map(([sem, semResults]) => {
                      const typedResults: typeof studentResults = semResults;
                      const avg = typedResults.reduce((s, r) => s + Number(r.score), 0) / typedResults.length;
                      return (
                        <div key={sem}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">{sem}</h3>
                            <Badge variant="outline">Avg: {avg.toFixed(1)}%</Badge>
                          </div>
                          <div className="space-y-1">
                            {typedResults.map((r, i) => (
                              <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                                <span className="text-muted-foreground">Course #{String(r.courseId)}</span>
                                <div className="flex gap-3">
                                  <span>{Number(r.score)}%</span>
                                  <Badge variant={r.grade === 'A' || r.grade === 'B' ? 'default' : 'secondary'}>
                                    {r.grade}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
