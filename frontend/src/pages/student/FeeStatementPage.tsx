import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CreditCard, CheckCircle, AlertCircle, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetFeeTypes,
  useGetPaymentHistory,
  useCheckUnpaidFees,
  useCreateCheckoutSession,
  useGetCallerUserProfile,
} from '../../hooks/useQueries';
import { formatNairaFromBackend } from '../../utils/currency';
import { toast } from 'sonner';

interface FeeTypeItem {
  id: number | bigint;
  name: string;
  amount: bigint;
  programme: string;
  session: string;
}

export default function FeeStatementPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const studentId = userProfile?.idNumber ?? '';

  const { data: feeTypes = [], isLoading: feesLoading } = useGetFeeTypes();
  const { data: payments = [], isLoading: paymentsLoading } = useGetPaymentHistory();
  const { data: unpaidFees = [], isLoading: unpaidLoading } = useCheckUnpaidFees(studentId);
  const createCheckout = useCreateCheckoutSession();

  const isLoading = feesLoading || paymentsLoading || unpaidLoading;

  const totalPaid = (payments as any[]).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const totalOutstanding = (unpaidFees as any[]).reduce(
    (sum: number, f: any) => sum + Number(f.amount),
    0,
  );

  const paidFeeNames = new Set((payments as any[]).map((p: any) => p.feeType));

  const handlePayNow = async (fee: FeeTypeItem) => {
    try {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const session = await createCheckout.mutateAsync({
        items: [
          {
            productName: fee.name,
            currency: 'usd',
            quantity: BigInt(1),
            priceInCents: fee.amount * BigInt(100),
            productDescription: `${fee.programme} - ${fee.session}`,
          },
        ],
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failure`,
      });
      if (!session?.url) throw new Error('Stripe session missing url');
      window.location.href = session.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate payment';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading fee statement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fee Statement</h1>
        <p className="text-muted-foreground">View your fee obligations and payment status.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatNairaFromBackend(BigInt(totalPaid))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {formatNairaFromBackend(BigInt(totalOutstanding))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Fee Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(feeTypes as any[]).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No fee types have been defined yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Name</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(feeTypes as FeeTypeItem[]).map((fee) => {
                  const isPaid = paidFeeNames.has(fee.name);
                  return (
                    <TableRow key={String(fee.id)}>
                      <TableCell className="font-medium">{fee.name}</TableCell>
                      <TableCell>{fee.programme}</TableCell>
                      <TableCell>{fee.session}</TableCell>
                      <TableCell className="font-semibold">
                        {formatNairaFromBackend(fee.amount)}
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Paid</Badge>
                        ) : (
                          <Badge variant="destructive">Unpaid</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!isPaid && (
                          <Button
                            size="sm"
                            disabled={createCheckout.isPending}
                            onClick={() => handlePayNow(fee)}
                          >
                            {createCheckout.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Pay Now'
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {(payments as any[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Recent Payments
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/student/payments' })}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payments as any[]).slice(0, 5).map((payment: any) => (
                  <TableRow key={String(payment.id)}>
                    <TableCell className="font-medium">{payment.feeType}</TableCell>
                    <TableCell className="font-semibold text-green-700 dark:text-green-400">
                      {formatNairaFromBackend(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {new Date(Number(payment.date) / 1_000_000).toLocaleDateString('en-NG')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.reference || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
