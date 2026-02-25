import React from 'react';
import { Link } from '@tanstack/react-router';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole, Result } from '../../backend';
import { useGetResults, useGetCourses, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Printer } from 'lucide-react';

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

function TranscriptContent() {
  const { data: userProfile } = useGetCallerUserProfile();
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
        <div className="flex items-center justify-between mb-6 no-print">
          <Button asChild variant="ghost" size="sm">
            <Link to="/student/results">
              <ChevronLeft className="w-4 h-4 mr-1" /> Results
            </Link>
          </Button>
          {!isLoading && (
            <Button
              onClick={() => window.print()}
              className="bg-navy text-white hover:bg-navy/90"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Transcript
            </Button>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : (
          <div className="bg-white rounded-xl shadow-navy border border-border p-8 print:shadow-none print:border-none">
            {/* Header */}
            <div className="text-center border-b-2 border-navy pb-6 mb-6">
              <div className="flex items-center justify-center gap-4 mb-3">
                <img
                  src="/assets/generated/university-crest.dim_256x256.png"
                  alt="University Crest"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="font-serif text-2xl font-bold text-navy">
                    University of Africa, Toru-Orua
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Office of the Registrar — Academic Transcript
                  </p>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Student Name</p>
                <p className="font-semibold text-navy">{userProfile?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Matric Number</p>
                <p className="font-semibold text-navy">{userProfile?.idNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold text-navy">{userProfile?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cumulative GPA</p>
                <p className="font-serif text-xl font-bold text-gold">
                  {overallGPA.toFixed(2)} / 5.00
                </p>
              </div>
            </div>

            {/* Results by Semester */}
            {Object.keys(grouped).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No results available yet.
              </p>
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
                    <div key={semester}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif font-bold text-navy">{semester}</h3>
                        <span className="text-sm font-semibold text-muted-foreground">
                          Semester GPA: {semGPA.toFixed(2)}
                        </span>
                      </div>
                      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                        <thead className="bg-navy text-white">
                          <tr>
                            <th className="text-left py-2 px-3">Code</th>
                            <th className="text-left py-2 px-3">Course Title</th>
                            <th className="text-center py-2 px-3">Score</th>
                            <th className="text-center py-2 px-3">Grade</th>
                            <th className="text-center py-2 px-3">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semResultsArr.map((result, i) => {
                            const course = courseMap.get(result.courseId.toString());
                            return (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                                <td className="py-2 px-3 font-mono text-xs">
                                  {course?.code || `CRS-${result.courseId}`}
                                </td>
                                <td className="py-2 px-3">
                                  {course?.name || 'Unknown Course'}
                                </td>
                                <td className="py-2 px-3 text-center">{Number(result.score)}</td>
                                <td className="py-2 px-3 text-center font-bold">{result.grade}</td>
                                <td className="py-2 px-3 text-center">
                                  {gradeToPoints(result.grade).toFixed(1)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
              <p>
                This is an official academic transcript of the University of Africa, Toru-Orua.
              </p>
              <p>
                Generated on{' '}
                {new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TranscriptPage() {
  return (
    <RoleGuard requiredRole={UserRole.student}>
      <TranscriptContent />
    </RoleGuard>
  );
}
