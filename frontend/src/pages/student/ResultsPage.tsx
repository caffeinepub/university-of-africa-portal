import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { UserRole, Result } from '../../backend';
import RoleGuard from '../../components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { GraduationCap, BookOpen, DollarSign, Home, CreditCard, Bell } from 'lucide-react';

const sidebarLinks = [
  { icon: GraduationCap, label: 'Dashboard', to: '/student' },
  { icon: BookOpen, label: 'Course Registration', to: '/student/courses' },
  { icon: DollarSign, label: 'Fee Statement', to: '/student/fees' },
  { icon: FileText, label: 'Results', to: '/student/results' },
  { icon: FileText, label: 'Transcript', to: '/student/transcript' },
  { icon: Home, label: 'Hostel Application', to: '/student/hostel' },
  { icon: CreditCard, label: 'Payment History', to: '/student/payments' },
  { icon: Bell, label: 'Announcements', to: '/student' },
];

function ResultsContent() {
  const { actor } = useActor();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['studentResults'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResults();
    },
    enabled: !!actor,
  });

  const resultsBySemester: Record<string, Result[]> = {};
  results.forEach((result) => {
    if (!resultsBySemester[result.semester]) {
      resultsBySemester[result.semester] = [];
    }
    resultsBySemester[result.semester].push(result);
  });

  const getGradeBadge = (grade: string) => {
    if (grade === 'A') return <Badge className="bg-green-100 text-green-800">A</Badge>;
    if (grade === 'B') return <Badge className="bg-blue-100 text-blue-800">B</Badge>;
    if (grade === 'C') return <Badge variant="secondary">C</Badge>;
    if (grade === 'F') return <Badge variant="destructive">F</Badge>;
    return <Badge variant="outline">{grade}</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-primary text-lg">Student Portal</h2>
          <p className="text-xs text-muted-foreground mt-1">Academic Services</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link key={link.to + link.label} to={link.to} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors">
              <link.icon className="h-4 w-4 flex-shrink-0" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-foreground">Academic Results</h1>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading results...</span>
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No results available yet.
              </CardContent>
            </Card>
          ) : (
            Object.entries(resultsBySemester).map(([semester, semResults]) => {
              const typedResults: Result[] = semResults;
              const avg = typedResults.length > 0
                ? typedResults.reduce((sum, r) => sum + Number(r.score), 0) / typedResults.length
                : 0;
              return (
                <Card key={semester}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{semester}</CardTitle>
                      <Badge variant="outline">GPA: {avg.toFixed(1)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {typedResults.map((result, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                          <span className="text-foreground/80">Course #{String(result.courseId)}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{String(result.score)}/100</span>
                            {getGradeBadge(result.grade)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
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
