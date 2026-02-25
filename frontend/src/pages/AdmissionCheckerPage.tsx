import React, { useState } from 'react';
import { useCheckAdmissionStatus, useCheckAdmissionStatusByName } from '../hooks/useQueries';
import { AdmissionStatus } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Search, Loader2 } from 'lucide-react';

function StatusDisplay({ status }: { status: AdmissionStatus | null | undefined }) {
  if (status === undefined) return null;
  if (status === null) {
    return (
      <div className="text-center py-8">
        <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-navy mb-2">No Record Found</h3>
        <p className="text-muted-foreground">No application found with the provided details. Please check and try again.</p>
      </div>
    );
  }

  const config = {
    [AdmissionStatus.admitted]: {
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10 border-success/30',
      title: 'Congratulations! You have been Admitted',
      desc: 'Your application has been approved. Please proceed to pay your acceptance fee and complete the registration process.',
    },
    [AdmissionStatus.rejected]: {
      icon: XCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10 border-destructive/30',
      title: 'Application Not Successful',
      desc: 'Unfortunately, your application was not successful at this time. You may apply again in the next admission cycle.',
    },
    [AdmissionStatus.pending]: {
      icon: Clock,
      color: 'text-gold',
      bg: 'bg-gold/10 border-gold/30',
      title: 'Application Under Review',
      desc: 'Your application is currently being reviewed. Please check back later for updates.',
    },
  };

  const { icon: Icon, color, bg, title, desc } = config[status];

  return (
    <div className={`rounded-xl border-2 p-8 text-center ${bg}`}>
      <Icon className={`w-16 h-16 mx-auto mb-4 ${color}`} />
      <h3 className={`font-serif text-2xl font-bold mb-3 ${color}`}>{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{desc}</p>
      {status === AdmissionStatus.admitted && (
        <Button className="mt-6 bg-navy text-white hover:bg-navy/90">
          Proceed to Pay Acceptance Fee
        </Button>
      )}
    </div>
  );
}

export default function AdmissionCheckerPage() {
  const [jambNumber, setJambNumber] = useState('');
  const [name, setName] = useState('');
  const [jambResult, setJambResult] = useState<AdmissionStatus | null | undefined>(undefined);
  const [nameResult, setNameResult] = useState<AdmissionStatus | null | undefined>(undefined);

  const checkByJamb = useCheckAdmissionStatus();
  const checkByName = useCheckAdmissionStatusByName();

  const handleJambCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jambNumber.trim()) return;
    const result = await checkByJamb.mutateAsync(jambNumber.trim());
    setJambResult(result);
  };

  const handleNameCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = await checkByName.mutateAsync(name.trim());
    setNameResult(result);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-navy mb-2">Admission Status Checker</h1>
          <p className="text-muted-foreground">
            Check your admission status using your JAMB registration number or full name.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="jamb">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="jamb" className="flex-1">Check by JAMB Number</TabsTrigger>
                <TabsTrigger value="name" className="flex-1">Check by Name</TabsTrigger>
              </TabsList>

              <TabsContent value="jamb">
                <form onSubmit={handleJambCheck} className="space-y-4">
                  <div>
                    <Label htmlFor="jambNum">JAMB Registration Number</Label>
                    <Input
                      id="jambNum"
                      value={jambNumber}
                      onChange={(e) => setJambNumber(e.target.value)}
                      placeholder="e.g. 12345678AB"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!jambNumber.trim() || checkByJamb.isPending}
                    className="w-full bg-navy text-white hover:bg-navy/90"
                  >
                    {checkByJamb.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
                    ) : (
                      <><Search className="w-4 h-4 mr-2" /> Check Status</>
                    )}
                  </Button>
                </form>
                {jambResult !== undefined && (
                  <div className="mt-6">
                    <StatusDisplay status={jambResult} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="name">
                <form onSubmit={handleNameCheck} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name as on JAMB form"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!name.trim() || checkByName.isPending}
                    className="w-full bg-navy text-white hover:bg-navy/90"
                  >
                    {checkByName.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
                    ) : (
                      <><Search className="w-4 h-4 mr-2" /> Check Status</>
                    )}
                  </Button>
                </form>
                {nameResult !== undefined && (
                  <div className="mt-6">
                    <StatusDisplay status={nameResult} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
