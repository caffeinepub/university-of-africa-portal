import React, { useState } from 'react';
import { useGetFeeTypes, useAddFeeType, isAuthorizationError, ADMIN_AUTH_ERROR_MSG, extractErrorMessage } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { toast } from 'sonner';
import { PlusCircle, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

export default function FeeManagementPage() {
  const { data: feeTypes = [], isLoading } = useGetFeeTypes();
  const addFeeType = useAddFeeType();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [programme, setProgramme] = useState('');
  const [session, setSession] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const formatNaira = (amount: bigint) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(amount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!name.trim() || !amount || !programme.trim() || !session.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await addFeeType.mutateAsync({
        name: name.trim(),
        amount: BigInt(Math.round(amountNum * 100)),
        programme: programme.trim(),
        session: session.trim(),
      });
      toast.success('Fee type added successfully!');
      setName('');
      setAmount('');
      setProgramme('');
      setSession('');
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      if (isAuthorizationError(error)) {
        setAuthError(ADMIN_AUTH_ERROR_MSG);
        toast.error(ADMIN_AUTH_ERROR_MSG);
      } else {
        toast.error(`Failed to add fee type: ${msg}`);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Fee Management</h1>
      </div>

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authorization Error</AlertTitle>
          <AlertDescription>
            {authError}
            <button
              className="ml-2 underline font-medium"
              onClick={() => setAuthError(null)}
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Add New Fee Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="feeName">Fee Name</Label>
              <Input
                id="feeName"
                placeholder="e.g. Tuition Fee"
                value={name}
                onChange={(e) => { setName(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feeAmount">Amount (₦)</Label>
              <Input
                id="feeAmount"
                type="number"
                placeholder="e.g. 150000"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feeProgramme">Programme</Label>
              <Input
                id="feeProgramme"
                placeholder="e.g. Computer Science"
                value={programme}
                onChange={(e) => { setProgramme(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feeSession">Session</Label>
              <Input
                id="feeSession"
                placeholder="e.g. 2024/2025"
                value={session}
                onChange={(e) => { setSession(e.target.value); setAuthError(null); }}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={addFeeType.isPending} className="w-full md:w-auto">
                {addFeeType.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
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

      <Card>
        <CardHeader>
          <CardTitle>Fee Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : feeTypes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No fee types defined yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Name</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeTypes.map((fee) => (
                  <TableRow key={String(fee.id)}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>{fee.programme}</TableCell>
                    <TableCell>{fee.session}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNaira(fee.amount / 100n)}
                    </TableCell>
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
