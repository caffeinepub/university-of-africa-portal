import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Receipt, Loader2, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetPaymentHistory } from '../../hooks/useQueries';
import { formatNairaFromBackend } from '../../utils/currency';

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { data: payments = [], isLoading } = useGetPaymentHistory();

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading payment history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground">View all your payment transactions.</p>
      </div>

      {/* Summary */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Amount Paid</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {formatNairaFromBackend(BigInt(totalPaid))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            All Transactions
            <Badge variant="secondary" className="ml-auto">
              {payments.length} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No payment records found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
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
                    <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          payment.status === 'completed'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }
                      >
                        {payment.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.reference && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate({
                              to: '/student/receipt/$paymentId',
                              params: { paymentId: payment.id.toString() },
                            })
                          }
                        >
                          View
                        </Button>
                      )}
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
