import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-16">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-navy mb-3">Payment Cancelled</h2>
        <p className="text-muted-foreground mb-2">
          Your payment was not completed. No charges have been made to your account.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          You can return to your fee statement to try again or choose a different payment option.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild className="bg-navy text-white hover:bg-navy/90">
            <Link to="/student/fees">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Fee Statement
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/student">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
