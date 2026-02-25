import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useGetCourses, useAddCourse } from '../../hooks/useQueries';
import RoleGuard from '../../components/auth/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import { useActor } from '../../hooks/useActor';

function ProgrammeManagementContent() {
  const navigate = useNavigate();
  const { isFetching: actorFetching } = useActor();
  const { data: courses = [], isLoading } = useGetCourses();
  const addCourse = useAddCourse();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('First');
  const [programme, setProgramme] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('100');
  const [creditUnits, setCreditUnits] = useState('3');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCourse.mutateAsync({
        code, name, semester, programme, department,
        level: Number(level), creditUnits: Number(creditUnits),
      });
      toast.success('Course added successfully');
      setCode(''); setName(''); setProgramme(''); setDepartment('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add course');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Programme Management</h1>
            <p className="text-xs text-primary-foreground/70">Manage courses and programmes</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />Add Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Course Code</Label>
                <Input placeholder="e.g. CSC101" value={code} onChange={e => setCode(e.target.value)} required disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Course Name</Label>
                <Input placeholder="e.g. Introduction to Computing" value={name} onChange={e => setName(e.target.value)} required disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input placeholder="e.g. Computer Science" value={department} onChange={e => setDepartment(e.target.value)} disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Programme</Label>
                <Input placeholder="e.g. B.Sc Computer Science" value={programme} onChange={e => setProgramme(e.target.value)} disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First">First Semester</SelectItem>
                    <SelectItem value="Second">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[100,200,300,400,500].map(l => <SelectItem key={l} value={String(l)}>{l} Level</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Credit Units</Label>
                <Input type="number" min="1" max="6" value={creditUnits} onChange={e => setCreditUnits(e.target.value)} disabled={actorFetching} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Button type="submit" disabled={addCourse.isPending || actorFetching} className="w-full sm:w-auto">
                  {addCourse.isPending ? 'Adding...' : 'Add Course'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" />Course Catalogue ({courses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No courses added yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.code}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.department}</TableCell>
                        <TableCell>{c.level}</TableCell>
                        <TableCell>{c.semester}</TableCell>
                        <TableCell>{c.creditUnits}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ProgrammeManagementPage() {
  return (
    <RoleGuard requiredRole="admin">
      <ProgrammeManagementContent />
    </RoleGuard>
  );
}
