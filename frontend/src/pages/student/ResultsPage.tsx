import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetCallerUserProfile, useGetStudentResults } from '../../hooks/useQueries';

const gradePoints: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

export default function ResultsPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const studentId = userProfile?.idNumber ?? '';
  const { data: results = [], isLoading } = useGetStudentResults(studentId);

  const semesters = Array.from(new Set((results as any[]).map((r: any) => r.semester)));

  const calcGPA = (semResults: any[]) => {
    if (!semResults.length) return '0.00';
    const total = semResults.reduce((sum: number, r: any) => sum + (gradePoints[r.grade] ?? 0), 0);
    return (total / semResults.length).toFixed(2);
  };

  const getGradeBadgeColor = (grade: string) => {
    if (grade === 'A') return 'bg-green-100 text-green-800';
    if (grade === 'B') return 'bg-blue-100 text-blue-800';
    if (grade === 'C') return 'bg-amber-100 text-amber-800';
    if (grade === 'D') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Academic Results</h1>
            <p className="text-xs text-primary-foreground/70">{userProfile?.name}</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/student' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (results as any[]).length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No results available yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {semesters.map((sem) => {
              const semResults: any[] = (results as any[]).filter((r: any) => r.semester === sem);
              return (
                <Card key={sem as string}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{sem as string} Semester</CardTitle>
                      <span className="text-sm font-semibold text-primary">GPA: {calcGPA(semResults)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-2 font-medium">Course ID</th>
                            <th className="text-left px-4 py-2 font-medium">Score</th>
                            <th className="text-left px-4 py-2 font-medium">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semResults.map((r: any, i: number) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-4 py-2 font-mono">{r.courseId}</td>
                              <td className="px-4 py-2">{r.score}</td>
                              <td className="px-4 py-2">
                                <Badge className={getGradeBadgeColor(r.grade)}>{r.grade}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
