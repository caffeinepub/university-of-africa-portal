import React, { useState } from 'react';
import { toast } from 'sonner';
import { PlusCircle, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetFeeTypes, useAddFeeType } from '../../hooks/useQueries';
import { formatNairaFromBackend } from '../../utils/currency';

export default function FeeManagementPage() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [programme, setProgramme] = useState('');
  const [session, setSession] = useState('');

  const { data: feeTypes = [], isLoading } = useGetFeeTypes();
  const addFeeType = useAddFeeType();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (!name.trim() || isNaN(amountNum) || amountNum <= 0 || !programme.trim() || !session.trim()) {
      toast.error('Please fill in all fields with valid values.');
      return;
    }

    try {
      await addFeeType.mutateAsync({
        name: name.trim(),
        amount: BigInt(Math.round(amountNum)),
        programme: programme.trim(),
        session: session.trim(),
      });
      toast.success(`Fee type "${name}" added successfully!`);
      setName('');
      setAmount('');
      setProgramme('');
      setSession('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add fee type';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>
        <p className="text-muted-foreground">Define and manage fee types for programmes and sessions.</p>
      </div>

      {/* Add Fee Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Add New Fee Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee-name">Fee Name</Label>
              <Input
                id="fee-name"
                placeholder="e.g. School Fees, Acceptance Fee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee-amount">Amount (₦)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
                <Input
                  id="fee-amount"
                  type="number"
                  placeholder="e.g. 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee-programme">Programme</Label>
              <Input
                id="fee-programme"
                placeholder="e.g. Computer Science, All Programmes"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee-session">Session</Label>
              <Input
                id="fee-session"
                placeholder="e.g. 2024/2025"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={addFeeType.isPending} className="w-full md:w-auto">
                {addFeeType.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Fee...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Fee Type
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Fee Types List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Existing Fee Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading fee types...</span>
            </div>
          ) : feeTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No fee types defined yet. Add your first fee type above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeTypes.map((fee) => (
                  <TableRow key={String(fee.id)}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatNairaFromBackend(fee.amount)}
                    </TableCell>
                    <TableCell>{fee.programme}</TableCell>
                    <TableCell>{fee.session}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
