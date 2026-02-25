import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useGetCallerUserProfile,
  useGetStudentResults,
  useGetCourses,
} from '../../hooks/useQueries';

interface ResultItem {
  studentId: string;
  courseId: number | bigint;
  semester: string;
  grade: string;
  score: number | bigint;
}

interface CourseItem {
  id: number | bigint;
  code: string;
  name: string;
  creditUnits: number | bigint;
}

const gradePoints: Record<string, number> = {
  A: 5, 'A+': 5, 'A-': 4.5,
  B: 4, 'B+': 4.5, 'B-': 3.5,
  C: 3, 'C+': 3.5, 'C-': 2.5,
  D: 2, 'D+': 2.5, 'D-': 1.5,
  E: 1, F: 0,
};

export default function TranscriptPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const studentId = userProfile?.idNumber ?? '';
  const { data: results = [], isLoading: resultsLoading } = useGetStudentResults(studentId);
  const { data: courses = [], isLoading: coursesLoading } = useGetCourses();

  const isLoading = resultsLoading || coursesLoading;

  const courseMap = new Map(
    (courses as CourseItem[]).map((c) => [String(c.id), c]),
  );

  const typedResults = results as ResultItem[];

  const grouped = typedResults.reduce<Record<string, ResultItem[]>>((acc, result) => {
    const key = result.semester;
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {});

  const overallGPA =
    typedResults.length > 0
      ? typedResults.reduce((sum, r) => sum + (gradePoints[r.grade] ?? 0), 0) /
        typedResults.length
      : 0;

  const calcSemGPA = (semResults: ResultItem[]) => {
    if (!semResults.length) return '0.00';
    const total = semResults.reduce((sum, r) => sum + (gradePoints[r.grade] ?? 0), 0);
    return (total / semResults.length).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/student/results' })}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Results
          </Button>
          {!isLoading && (
            <Button onClick={() => window.print()} className="bg-primary text-primary-foreground">
              <Printer className="w-4 h-4 mr-2" /> Print Transcript
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-border p-8 print:shadow-none print:border-none">
            {/* Header */}
            <div className="text-center border-b-2 border-primary pb-6 mb-6">
              <div className="flex items-center justify-center gap-4 mb-3">
                <img
                  src="/assets/generated/university-crest.dim_256x256.png"
                  alt="University Crest"
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
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
                <p className="font-semibold">{userProfile?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Matric Number</p>
                <p className="font-semibold">{userProfile?.idNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold">{userProfile?.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cumulative GPA</p>
                <p className="text-xl font-bold text-primary">
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
                {Object.entries(grouped).map(([semester, semResults]) => (
                  <div key={semester}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground">{semester}</h3>
                      <span className="text-sm font-semibold text-primary">
                        GPA: {calcSemGPA(semResults)}
                      </span>
                    </div>
                    <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Course Code</th>
                          <th className="text-left px-3 py-2 font-medium">Course Name</th>
                          <th className="text-center px-3 py-2 font-medium">Score</th>
                          <th className="text-center px-3 py-2 font-medium">Grade</th>
                          <th className="text-center px-3 py-2 font-medium">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semResults.map((result, idx) => {
                          const course = courseMap.get(String(result.courseId));
                          return (
                            <tr key={idx} className="border-t border-border">
                              <td className="px-3 py-2 font-mono text-xs">
                                {course?.code ?? `CRS-${result.courseId}`}
                              </td>
                              <td className="px-3 py-2">
                                {course?.name ?? 'Unknown Course'}
                              </td>
                              <td className="px-3 py-2 text-center">{String(result.score)}</td>
                              <td className="px-3 py-2 text-center font-bold">{result.grade}</td>
                              <td className="px-3 py-2 text-center">
                                {gradePoints[result.grade] ?? 0}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
              <p>This transcript is an official document of the University of Africa, Toru-Orua.</p>
              <p>Generated on {new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
