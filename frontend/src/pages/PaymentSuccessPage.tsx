import React, { useEffect, useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useGetStripeSessionStatus, useRecordPayment } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const sessionId = search['session_id'] || '';
  const getSessionStatus = useGetStripeSessionStatus();
  const recordPayment = useRecordPayment();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const result = await getSessionStatus.mutateAsync(sessionId);
        if (cancelled) return;

        if (result.__kind__ === 'completed') {
          setReference(sessionId);
          // Record the payment in the backend
          try {
            await recordPayment.mutateAsync({
              amount: BigInt(0), // Amount is tracked by Stripe; we record the reference
              reference: sessionId,
              feeType: 'Stripe Payment',
            });
          } catch {
            // Payment recording failure is non-critical
          }
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-navy mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-navy mb-2">Payment Verification Failed</h2>
          <p className="text-muted-foreground mb-6">
            We could not verify your payment. If you were charged, please contact support with your
            session reference.
          </p>
          <Button asChild className="bg-navy text-white hover:bg-navy/90">
            <Link to="/student/fees">Return to Fee Statement</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-16">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-navy mb-3">Payment Successful!</h2>
        <p className="text-muted-foreground mb-2">
          Your payment has been processed successfully.
        </p>
        {reference && (
          <Card className="my-4 border-success/20 bg-success/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Payment Reference</p>
              <p className="font-mono text-sm font-semibold text-navy break-all">{reference}</p>
            </CardContent>
          </Card>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <Button asChild className="bg-navy text-white hover:bg-navy/90">
            <Link to="/student/payments">View Payment History</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/student">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
