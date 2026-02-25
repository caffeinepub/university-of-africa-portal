import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';
import { useGetCourses } from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Search, CheckCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

function CourseRegistrationContent() {
  const { data: courses, isLoading } = useGetCourses();
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filtered = (courses || []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.programme.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, course) => {
    const key = course.semester;
    if (!acc[key]) acc[key] = [];
    acc[key].push(course);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const toggleRegistration = (id: string) => {
    setRegisteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info('Course deregistered');
      } else {
        next.add(id);
        toast.success('Course registered successfully');
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/student">
              <ChevronLeft className="w-4 h-4 mr-1" /> Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy">Course Registration</h1>
            <p className="text-muted-foreground text-sm">2024/2025 Academic Session</p>
          </div>
          <Badge className="bg-navy text-white">{registeredIds.size} Registered</Badge>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by name, code, or programme..."
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-navy mb-2">No Courses Available</h3>
              <p className="text-muted-foreground text-sm">
                {search
                  ? 'No courses match your search.'
                  : 'No courses have been added yet. Check back later.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([semester, semCourses]) => (
              <div key={semester}>
                <h2 className="font-serif text-lg font-bold text-navy mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  {semester}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {semCourses.map((course) => {
                    const id = course.id.toString();
                    const isRegistered = registeredIds.has(id);
                    return (
                      <Card
                        key={id}
                        className={`border-2 transition-all ${
                          isRegistered
                            ? 'border-success/40 bg-success/5'
                            : 'border-border hover:border-gold/30'
                        }`}
                      >
                        <CardContent className="p-4 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className="text-xs border-navy/30 text-navy"
                              >
                                {course.code}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {course.programme}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-navy text-sm">{course.name}</h3>
                          </div>
                          <Button
                            size="sm"
                            variant={isRegistered ? 'outline' : 'default'}
                            onClick={() => toggleRegistration(id)}
                            className={
                              isRegistered
                                ? 'border-success text-success hover:bg-success/10'
                                : 'bg-navy text-white hover:bg-navy/90'
                            }
                          >
                            {isRegistered ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" /> Registered
                              </>
                            ) : (
                              'Register'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourseRegistrationPage() {
  return (
    <RoleGuard requiredRole={UserRole.student}>
      <CourseRegistrationContent />
    </RoleGuard>
  );
}
