import React, { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetStripeSessionStatus, useRecordPayment } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const getSessionStatus = useGetStripeSessionStatus();
  const recordPayment = useRecordPayment();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [reference, setReference] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setStatus('success');
      setReference('MANUAL-' + Date.now());
      return;
    }

    getSessionStatus.mutateAsync(sessionId).then(async (result) => {
      if (result.__kind__ === 'completed') {
        const ref = 'PAY-' + Date.now();
        setReference(ref);
        if (userProfile) {
          try {
            await recordPayment.mutateAsync({
              studentId: userProfile.idNumber,
              amount: 0,
              reference: ref,
              feeType: 'Stripe Payment',
              paymentMethod: 'stripe',
            });
          } catch {
            // non-critical
          }
        }
        setStatus('success');
      } else {
        setStatus('error');
      }
    }).catch(() => setStatus('error'));
  }, []);

  const dashboardRoute = userProfile ? `/${userProfile.role as string}` : '/';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardContent className="pt-10 pb-10 flex flex-col items-center gap-6">
          {status === 'loading' ? (
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : status === 'success' ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground text-sm">Your payment has been processed successfully.</p>
              </div>
              {reference && (
                <div className="bg-muted rounded-lg px-6 py-3 w-full">
                  <p className="text-xs text-muted-foreground mb-1">Reference</p>
                  <p className="font-mono text-sm font-semibold text-primary">{reference}</p>
                </div>
              )}
              <Button className="w-full" onClick={() => navigate({ to: dashboardRoute as any })}>
                Return to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Issue</h2>
                <p className="text-muted-foreground text-sm">There was an issue verifying your payment.</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate({ to: dashboardRoute as any })}>
                Return to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
