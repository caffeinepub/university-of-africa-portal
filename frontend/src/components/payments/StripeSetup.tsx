import React, { useState } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB,NG');

  if (isLoading) return null;
  if (isConfigured) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const allowedCountries = countries.split(',').map((c) => c.trim()).filter(Boolean);
      await setConfig.mutateAsync({ secretKey, allowedCountries });
      toast.success('Stripe configured successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to configure Stripe');
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Configure Stripe Payments</CardTitle>
            <CardDescription>Stripe is not yet configured. Set it up to enable payments.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="stripe-key">Stripe Secret Key</Label>
            <Input
              id="stripe-key"
              type="password"
              placeholder="sk_live_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stripe-countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="stripe-countries"
              placeholder="US,CA,GB,NG"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={setConfig.isPending} className="w-full">
            {setConfig.isPending ? 'Saving...' : 'Save Stripe Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
