import React, { useState } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Settings, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('NG, US, GB, CA');
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return null;
  if (isConfigured) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) return;
    const allowedCountries = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    try {
      await setConfig.mutateAsync({ secretKey: secretKey.trim(), allowedCountries });
      toast.success('Stripe configured successfully!');
      setShowForm(false);
    } catch {
      toast.error('Failed to configure Stripe. Please check your secret key.');
    }
  };

  return (
    <Card className="mb-6 border-2 border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="font-serif text-navy flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gold" />
          Stripe Payment Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-amber-300 bg-amber-100">
          <Settings className="w-4 h-4" />
          <AlertDescription>
            Stripe is not yet configured. Students will not be able to make online payments until
            you set up Stripe.
          </AlertDescription>
        </Alert>

        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-navy text-white hover:bg-navy/90"
          >
            <Settings className="w-4 h-4 mr-2" /> Configure Stripe
          </Button>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="sk">Stripe Secret Key *</Label>
              <Input
                id="sk"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="sk_live_... or sk_test_..."
                className="mt-1 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find this in your Stripe Dashboard → Developers → API Keys
              </p>
            </div>
            <div>
              <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
              <Input
                id="countries"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="NG, US, GB, CA"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!secretKey.trim() || setConfig.isPending}
                className="bg-gold text-navy font-semibold hover:bg-gold-light"
              >
                {setConfig.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Save Configuration
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
