import React from 'react';
import { Link } from '@tanstack/react-router';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole, Result } from '../../backend';
import { useGetResults, useGetCourses } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, ChevronLeft, FileText, TrendingUp } from 'lucide-react';

function gradeToPoints(grade: string): number {
  const map: Record<string, number> = {
    A: 5,
    'A+': 5,
    'A-': 4.5,
    B: 4,
    'B+': 4.5,
    'B-': 3.5,
    C: 3,
    'C+': 3.5,
    'C-': 2.5,
    D: 2,
    'D+': 2.5,
    'D-': 1.5,
    E: 1,
    F: 0,
  };
  return map[grade.toUpperCase()] ?? 0;
}

function gradeColor(grade: string): string {
  const g = grade.toUpperCase();
  if (g.startsWith('A')) return 'bg-success/10 text-success border-success/30';
  if (g.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (g.startsWith('C')) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-destructive/10 text-destructive border-destructive/30';
}

function ResultsContent() {
  const { data: results, isLoading: resultsLoading } = useGetResults();
  const { data: courses, isLoading: coursesLoading } = useGetCourses();

  const isLoading = resultsLoading || coursesLoading;

  const courseMap = new Map((courses || []).map((c) => [c.id.toString(), c]));

  const grouped = (results || []).reduce(
    (acc, result) => {
      const key = result.semester;
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    },
    {} as Record<string, Result[]>
  );

  const allResults = results || [];
  const overallGPA =
    allResults.length > 0
      ? allResults.reduce((sum, r) => sum + gradeToPoints(r.grade), 0) / allResults.length
      : 0;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/student">
              <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy">Academic Results</h1>
            <p className="text-muted-foreground text-sm">All semesters</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/student/transcript">
              <FileText className="w-4 h-4 mr-2" /> View Transcript
            </Link>
          </Button>
        </div>

        {/* GPA Summary */}
        {!isLoading && allResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-2 border-gold/30 bg-gold/5">
              <CardContent className="p-5 text-center">
                <TrendingUp className="w-6 h-6 text-gold mx-auto mb-2" />
                <div className="font-serif text-3xl font-bold text-navy">
                  {overallGPA.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Cumulative GPA</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <Award className="w-6 h-6 text-navy mx-auto mb-2" />
                <div className="font-serif text-3xl font-bold text-navy">{allResults.length}</div>
                <p className="text-xs text-muted-foreground">Courses Taken</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 text-center">
                <div className="w-6 h-6 bg-navy rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-gold text-xs font-bold">S</span>
                </div>
                <div className="font-serif text-3xl font-bold text-navy">
                  {Object.keys(grouped).length}
                </div>
                <p className="text-xs text-muted-foreground">Semesters</p>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array(2)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-navy mb-2">No Results Yet</h3>
              <p className="text-muted-foreground text-sm">
                Your results will appear here once they have been posted by the admin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([semester, semResults]) => {
              const semResultsArr: Result[] = semResults ?? [];
              const semGPA =
                semResultsArr.length > 0
                  ? semResultsArr.reduce((sum, r) => sum + gradeToPoints(r.grade), 0) /
                    semResultsArr.length
                  : 0;
              return (
                <Card key={semester}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-navy text-lg">{semester}</CardTitle>
                      <Badge className="bg-navy text-white">GPA: {semGPA.toFixed(2)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                              Course Code
                            </th>
                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                              Course Name
                            </th>
                            <th className="text-center py-2 px-3 text-muted-foreground font-medium">
                              Score
                            </th>
                            <th className="text-center py-2 px-3 text-muted-foreground font-medium">
                              Grade
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {semResultsArr.map((result, i) => {
                            const course = courseMap.get(result.courseId.toString());
                            return (
                              <tr
                                key={i}
                                className="border-b border-border/50 hover:bg-muted/30"
                              >
                                <td className="py-3 px-3 font-mono text-xs text-navy">
                                  {course?.code || `CRS-${result.courseId}`}
                                </td>
                                <td className="py-3 px-3 font-medium text-navy">
                                  {course?.name || 'Unknown Course'}
                                </td>
                                <td className="py-3 px-3 text-center font-semibold">
                                  {Number(result.score)}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-bold ${gradeColor(result.grade)}`}
                                  >
                                    {result.grade}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <RoleGuard requiredRole={UserRole.student}>
      <ResultsContent />
    </RoleGuard>
  );
}
