import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetPaymentHistory, useGetCallerUserProfile } from '../../hooks/useQueries';
import { formatNairaFromBackend } from '../../utils/currency';

export default function ReceiptPage() {
  const navigate = useNavigate();
  const { paymentId } = useParams({ from: '/student/receipt/$paymentId' });

  const { data: payments = [] } = useGetPaymentHistory();
  const { data: profile } = useGetCallerUserProfile();

  const payment = payments.find((p) => p.id.toString() === paymentId);

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Receipt not found for payment ID: {paymentId || 'N/A'}</p>
        <Button variant="outline" onClick={() => navigate({ to: '/student/payments' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payment History
        </Button>
      </div>
    );
  }

  const paymentDate = new Date(Number(payment.date) / 1_000_000);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: '/student/payments' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
      </div>

      <Card className="border-2">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <img
              src="/assets/generated/university-crest.dim_256x256.png"
              alt="University Crest"
              className="h-16 w-16 mx-auto mb-3"
            />
            <h1 className="text-xl font-bold text-foreground">OFFICIAL PAYMENT RECEIPT</h1>
            <p className="text-muted-foreground text-sm">University Management System</p>
          </div>

          <Separator className="my-4" />

          {/* Success indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold text-lg">Payment Confirmed</span>
          </div>

          {/* Receipt Details */}
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Receipt No.</span>
              <span className="font-mono font-semibold">
                RCP-{payment.id.toString().padStart(6, '0')}
              </span>
            </div>
            {payment.reference && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-sm">{payment.reference}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Student Name</span>
              <span className="font-medium">{profile?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Student ID</span>
              <span className="font-mono">{profile?.idNumber ?? '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Fee Type</span>
              <span className="font-medium">{payment.feeType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Date</span>
              <span>
                {paymentDate.toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between py-3 bg-primary/5 rounded-lg px-3 mt-2">
              <span className="font-bold text-lg">Amount Paid</span>
              <span className="font-bold text-xl text-primary">
                {formatNairaFromBackend(payment.amount)}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          <p className="text-center text-xs text-muted-foreground">
            This is an official receipt. Please keep it for your records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
