import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Search, ArrowRight, Clock, AlertCircle } from 'lucide-react';

const STEPS = [
  { step: 1, title: 'JAMB Registration', desc: 'Register for UTME and sit for the examination. Minimum score of 180 required.' },
  { step: 2, title: 'Post-UTME Application', desc: 'Apply for Post-UTME screening on this portal with your JAMB registration number.' },
  { step: 3, title: 'Upload Documents', desc: 'Upload your O\'Level results, JAMB result slip, and other required documents.' },
  { step: 4, title: 'Screening Exercise', desc: 'Attend the Post-UTME screening exercise on the scheduled date.' },
  { step: 5, title: 'Check Admission Status', desc: 'Check your admission status on this portal using your JAMB number or name.' },
  { step: 6, title: 'Pay Acceptance Fee', desc: 'Admitted candidates must pay the acceptance fee to secure their admission.' },
];

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="/assets/generated/admissions-illustration.dim_800x400.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-2xl">
            <Badge className="bg-gold/20 text-gold border-gold/30 mb-4">Admissions 2024/2025</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Admissions & <span className="text-gold">Applications</span>
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Start your journey at the University of Africa, Toru-Orua. Applications are open for the 2024/2025 academic session.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-gold text-navy font-bold hover:bg-gold-light">
                <Link to="/admissions/apply">
                  <FileText className="w-4 h-4 mr-2" />
                  Apply Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Link to="/admissions/check">
                  <Search className="w-4 h-4 mr-2" />
                  Check Admission Status
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-12 bg-gold/10 border-y border-gold/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-xl font-bold text-navy">Important Dates</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Application Opens', date: 'January 15, 2025', status: 'active' },
              { label: 'Post-UTME Screening', date: 'March 15, 2025', status: 'upcoming' },
              { label: 'Admission List Release', date: 'April 30, 2025', status: 'upcoming' },
            ].map(({ label, date, status }) => (
              <div key={label} className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gold/20">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status === 'active' ? 'bg-success' : 'bg-gold'}`} />
                <div>
                  <div className="font-semibold text-navy text-sm">{label}</div>
                  <div className="text-muted-foreground text-xs">{date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-navy mb-3">Admission Process</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Follow these steps to complete your application to the University of Africa, Toru-Orua.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map(({ step, title, desc }) => (
              <Card key={step} className="border-2 hover:border-gold/40 transition-colors">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center mb-4">
                    <span className="text-gold font-bold">{step}</span>
                  </div>
                  <h3 className="font-semibold text-navy mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-2xl font-bold text-navy">Entry Requirements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy mb-4">UTME Requirements</h3>
                  <ul className="space-y-2">
                    {[
                      'Minimum UTME score of 180',
                      'Relevant UTME subjects for chosen programme',
                      'Valid JAMB registration number',
                      'JAMB result slip',
                    ].map((req) => (
                      <li key={req} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-navy mb-4">O'Level Requirements</h3>
                  <ul className="space-y-2">
                    {[
                      'Minimum of 5 credits in relevant subjects',
                      'Credits must include English Language',
                      'Credits must include Mathematics (for science programmes)',
                      'WAEC, NECO, or NABTEB accepted',
                    ].map((req) => (
                      <li key={req} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Ready to Apply?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Don't miss the opportunity to be part of our vibrant academic community.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold text-navy font-bold hover:bg-gold-light">
              <Link to="/admissions/apply">Start Your Application <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link to="/admissions/check">Check Admission Status</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
