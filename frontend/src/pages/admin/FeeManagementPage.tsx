import React, { useState } from 'react';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';
import { useGetFeeTypes, useAddFeeType, extractErrorMessage } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, PlusCircle, DollarSign } from 'lucide-react';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';

function FeeManagementContent() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: feeTypes = [], isLoading } = useGetFeeTypes();
  const addFeeType = useAddFeeType();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [programme, setProgramme] = useState('');
  const [session, setSession] = useState('');

  const isActorReady = !!actor && !actorFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActorReady) {
      toast.error('Please wait — connecting to the server...');
      return;
    }
    if (!name || !amount || !programme || !session) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await addFeeType.mutateAsync({
        name,
        amount: BigInt(Math.round(parseFloat(amount) * 100)),
        programme,
        session,
      });
      toast.success('Fee type added successfully!');
      setName('');
      setAmount('');
      setProgramme('');
      setSession('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const formatAmount = (amount: bigint) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(Number(amount) / 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>
          <p className="text-muted-foreground">Add and manage fee types for all programmes</p>
        </div>
      </div>

      {!isActorReady && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting to server — please wait before submitting...</span>
        </div>
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
            <div className="space-y-2">
              <Label htmlFor="feeName">Fee Name</Label>
              <Input
                id="feeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tuition Fee"
                disabled={addFeeType.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeAmount">Amount (₦)</Label>
              <Input
                id="feeAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 150000"
                disabled={addFeeType.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeProgramme">Programme</Label>
              <Input
                id="feeProgramme"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                placeholder="e.g. Computer Science"
                disabled={addFeeType.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeSession">Session</Label>
              <Input
                id="feeSession"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                placeholder="e.g. 2024/2025"
                disabled={addFeeType.isPending}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={!isActorReady || addFeeType.isPending}
                className="w-full md:w-auto"
              >
                {addFeeType.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Fee...
                  </>
                ) : !isActorReady ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
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
          <CardTitle>All Fee Types</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : feeTypes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No fee types added yet.</p>
          ) : (
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
                {feeTypes.map((fee) => (
                  <TableRow key={fee.id.toString()}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>{formatAmount(fee.amount)}</TableCell>
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

export default function FeeManagementPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <FeeManagementContent />
    </RoleGuard>
  );
}
