import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  useGetCallerUserProfile,
  useGetCoursesByDepartmentAndLevel,
  useGetRegisteredCourses,
  useRegisterCourse,
  useDeregisterCourse,
} from '../../hooks/useQueries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Loader2,
  MinusCircle,
  GraduationCap,
  AlertCircle,
  BookMarked,
} from 'lucide-react';
import { toast } from 'sonner';

interface CourseItem {
  id: number | bigint;
  code: string;
  name: string;
  semester: string;
  creditUnits: number | bigint;
}

function CourseRegistrationContent() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();

  const department = profile?.department ?? '';
  const level = profile?.level !== undefined ? Number(profile.level) : 0;
  const studentId = profile?.idNumber ?? '';

  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetCoursesByDepartmentAndLevel(department, level);

  const { data: registeredCourseIds = [], isLoading: regLoading } =
    useGetRegisteredCourses(studentId);

  const registerCourse = useRegisterCourse();
  const deregisterCourse = useDeregisterCourse();

  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);

  const registeredSet = new Set(
    (registeredCourseIds as any[]).map((id: any) => String(id)),
  );

  // Group courses by semester
  const grouped = (courses as CourseItem[]).reduce(
    (acc, course) => {
      const key = course.semester;
      if (!acc[key]) acc[key] = [];
      acc[key].push(course);
      return acc;
    },
    {} as Record<string, CourseItem[]>,
  );

  const semesterOrder = ['First Semester', 'Second Semester', 'First', 'Second'];
  const sortedSemesters = Object.keys(grouped).sort((a, b) => {
    const ai = semesterOrder.indexOf(a);
    const bi = semesterOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const totalRegisteredCreditUnits = (courses as CourseItem[])
    .filter((c) => registeredSet.has(String(c.id)))
    .reduce((sum, c) => sum + Number(c.creditUnits), 0);

  const totalRegisteredCount = registeredSet.size;

  const handleToggle = async (courseId: number | bigint, isRegistered: boolean) => {
    const idStr = String(courseId);
    setPendingCourseId(idStr);
    try {
      if (isRegistered) {
        await deregisterCourse.mutateAsync({ studentId, courseId: Number(courseId) });
        toast.success('Course removed from your registration.');
      } else {
        await registerCourse.mutateAsync({ studentId, courseId: Number(courseId) });
        toast.success('Course registered successfully!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update registration');
    } finally {
      setPendingCourseId(null);
    }
  };

  const isLoading = profileLoading || coursesLoading || regLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Profile missing department/level
  if (!department || !level) {
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your profile is missing department or level information. Please contact the admin to
              update your profile before registering for courses.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back button */}
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/student">
              <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Course Registration</h1>
          <p className="text-muted-foreground text-sm mt-1">2024/2025 Academic Session</p>
        </div>

        {/* Info + Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-semibold text-sm">{department}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4 flex items-center gap-3">
              <BookMarked className="w-8 h-8 text-accent shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="font-semibold text-sm">{level} Level</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Registered</p>
                <p className="font-semibold text-sm">
                  {totalRegisteredCount} courses · {totalRegisteredCreditUnits} units
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error state */}
        {coursesError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {coursesError instanceof Error ? coursesError.message : 'Failed to load courses'}
            </AlertDescription>
          </Alert>
        )}

        {/* No courses available */}
        {(courses as CourseItem[]).length === 0 && !coursesError ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Courses Available</h3>
              <p className="text-muted-foreground text-sm">
                No courses have been assigned to{' '}
                <span className="font-medium">{department}</span> — Level{' '}
                <span className="font-medium">{level}</span> yet. Please check back later or
                contact the admin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedSemesters.map((semester) => (
              <div key={semester}>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {semester}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {grouped[semester].length} course
                    {grouped[semester].length !== 1 ? 's' : ''}
                  </Badge>
                </h2>

                <Card>
                  <CardHeader className="pb-0 pt-4 px-4">
                    <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                      <span className="col-span-2">Code</span>
                      <span className="col-span-5">Course Title</span>
                      <span className="col-span-2 text-center">Credits</span>
                      <span className="col-span-3 text-right">Action</span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pt-2 pb-4">
                    <div className="divide-y divide-border">
                      {grouped[semester].map((course) => {
                        const idStr = String(course.id);
                        const isRegistered = registeredSet.has(idStr);
                        const isPending = pendingCourseId === idStr;

                        return (
                          <div
                            key={idStr}
                            className={`grid grid-cols-12 items-center py-3 gap-2 transition-colors ${
                              isRegistered ? 'bg-green-50/50' : ''
                            }`}
                          >
                            <div className="col-span-2">
                              <Badge
                                variant="outline"
                                className="text-xs font-mono"
                              >
                                {course.code}
                              </Badge>
                            </div>

                            <div className="col-span-5">
                              <p className="font-medium text-sm leading-tight">{course.name}</p>
                              {isRegistered && (
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                                  <CheckCircle className="w-3 h-3" /> Registered
                                </span>
                              )}
                            </div>

                            <div className="col-span-2 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {String(course.creditUnits)}
                              </span>
                            </div>

                            <div className="col-span-3 flex justify-end">
                              {isRegistered ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggle(course.id, true)}
                                  disabled={isPending}
                                  className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
                                >
                                  {isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <MinusCircle className="w-3 h-3 mr-1" />
                                      Remove
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleToggle(course.id, false)}
                                  disabled={isPending}
                                  className="text-xs"
                                >
                                  {isPending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Register
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Credit Unit Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Registration Summary</p>
                    <p className="text-sm text-muted-foreground">
                      {totalRegisteredCount} of {(courses as CourseItem[]).length} courses
                      registered
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Credit Units</p>
                    <p className="text-2xl font-bold text-primary">{totalRegisteredCreditUnits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourseRegistrationPage() {
  return <CourseRegistrationContent />;
}
