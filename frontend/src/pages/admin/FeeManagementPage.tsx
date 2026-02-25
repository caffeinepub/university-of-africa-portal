import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useGetFeeTypes, useAddFeeType } from '../../hooks/useQueries';
import RoleGuard from '../../components/auth/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, DollarSign, Plus } from 'lucide-react';
import { useActor } from '../../hooks/useActor';
import { formatNaira } from '../../utils/currency';

function FeeManagementContent() {
  const navigate = useNavigate();
  const { isFetching: actorFetching } = useActor();
  const { data: feeTypes = [], isLoading } = useGetFeeTypes();
  const addFeeType = useAddFeeType();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [programme, setProgramme] = useState('');
  const [session, setSession] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFeeType.mutateAsync({ name, amount: Number(amount), programme, session });
      toast.success('Fee type added successfully');
      setName(''); setAmount(''); setProgramme(''); setSession('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add fee type');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Fee Management</h1>
            <p className="text-xs text-primary-foreground/70">Manage fee types and schedules</p>
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
              <Plus className="w-4 h-4" />Add Fee Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fee Name</Label>
                <Input placeholder="e.g. Tuition Fee" value={name} onChange={e => setName(e.target.value)} required disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Amount (₦)</Label>
                <Input type="number" placeholder="e.g. 150000" value={amount} onChange={e => setAmount(e.target.value)} required disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Programme</Label>
                <Input placeholder="e.g. Computer Science" value={programme} onChange={e => setProgramme(e.target.value)} disabled={actorFetching} />
              </div>
              <div className="space-y-1.5">
                <Label>Session</Label>
                <Input placeholder="e.g. 2024/2025" value={session} onChange={e => setSession(e.target.value)} disabled={actorFetching} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={addFeeType.isPending || actorFetching} className="w-full sm:w-auto">
                  {addFeeType.isPending ? 'Adding...' : 'Add Fee Type'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />Fee Types ({feeTypes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : feeTypes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No fee types added yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeTypes.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>{formatNaira(f.amount)}</TableCell>
                        <TableCell>{f.programme}</TableCell>
                        <TableCell>{f.session}</TableCell>
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

export default function FeeManagementPage() {
  return (
    <RoleGuard requiredRole="admin">
      <FeeManagementContent />
    </RoleGuard>
  );
}
