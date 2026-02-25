import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSubmitApplication } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle, Plus, Trash2, Upload, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

const PROGRAMMES = [
  'Computer Science', 'Medicine & Surgery', 'Law', 'Business Administration',
  'Civil Engineering', 'Nursing Science', 'Accounting', 'Mass Communication',
  'Electrical Engineering', 'Pharmacy', 'Economics', 'Political Science',
];

const SUBJECTS = [
  'English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Geography', 'Economics', 'Government', 'Literature in English', 'History',
  'Agricultural Science', 'Further Mathematics', 'Technical Drawing', 'Commerce',
];

const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const STEPS = [
  { id: 1, title: 'Personal Information' },
  { id: 2, title: 'JAMB Details' },
  { id: 3, title: "O'Level Results" },
  { id: 4, title: 'Programme Choice' },
  { id: 5, title: 'Documents' },
];

interface OLevelResult {
  subject: string;
  grade: string;
}

export default function ApplicationFormPage() {
  const navigate = useNavigate();
  const submitApplication = useSubmitApplication();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<bigint | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [jambNumber, setJambNumber] = useState('');
  const [jambScore, setJambScore] = useState('');
  const [oLevelResults, setOLevelResults] = useState<OLevelResult[]>([
    { subject: '', grade: '' },
    { subject: '', grade: '' },
    { subject: '', grade: '' },
    { subject: '', grade: '' },
    { subject: '', grade: '' },
  ]);
  const [programmeChoice, setProgrammeChoice] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const addOLevelRow = () => setOLevelResults([...oLevelResults, { subject: '', grade: '' }]);
  const removeOLevelRow = (i: number) => setOLevelResults(oLevelResults.filter((_, idx) => idx !== i));
  const updateOLevel = (i: number, field: 'subject' | 'grade', value: string) => {
    const updated = [...oLevelResults];
    updated[i][field] = value;
    setOLevelResults(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setDocuments((prev) => [...prev, base64]);
        setUploadedFiles((prev) => [...prev, file.name]);
      };
      reader.readAsDataURL(file);
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return name.trim() && phone.trim();
      case 2: return jambNumber.trim().length >= 10;
      case 3: return oLevelResults.filter((r) => r.subject && r.grade).length >= 5;
      case 4: return !!programmeChoice;
      case 5: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    const validResults = oLevelResults
      .filter((r) => r.subject && r.grade)
      .map((r) => `${r.subject}: ${r.grade}`);

    try {
      const id = await submitApplication.mutateAsync({
        name,
        jambNumber,
        oLevelResults: validResults,
        programmeChoice,
        documents,
      });
      setApplicationId(id);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit application. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-navy mb-3">Application Submitted!</h2>
          <p className="text-muted-foreground mb-2">
            Your application has been received and is under review.
          </p>
          {applicationId !== null && (
            <p className="text-sm font-semibold text-navy mb-6">
              Application ID: <span className="text-gold">#{applicationId.toString()}</span>
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button asChild className="bg-navy text-white hover:bg-navy/90">
              <a href="/admissions/check">Check Status</a>
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-navy mb-2">Post-UTME Application Form</h1>
          <p className="text-muted-foreground">2024/2025 Academic Session</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  currentStep > step.id ? 'bg-success text-white' :
                  currentStep === step.id ? 'bg-navy text-gold' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-xs mt-1 text-center max-w-[70px] ${currentStep === step.id ? 'text-navy font-semibold' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-success' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-navy">
              Step {currentStep}: {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="As on JAMB form" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state">State of Origin</Label>
                  <Input id="state" value={stateOfOrigin} onChange={(e) => setStateOfOrigin(e.target.value)} placeholder="e.g. Bayelsa" className="mt-1" />
                </div>
              </div>
            )}

            {/* Step 2: JAMB */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jamb">JAMB Registration Number *</Label>
                  <Input id="jamb" value={jambNumber} onChange={(e) => setJambNumber(e.target.value)} placeholder="e.g. 12345678AB" className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Enter your JAMB registration number exactly as it appears on your result slip.</p>
                </div>
                <div>
                  <Label htmlFor="score">UTME Score</Label>
                  <Input id="score" type="number" value={jambScore} onChange={(e) => setJambScore(e.target.value)} placeholder="e.g. 250" className="mt-1" />
                </div>
              </div>
            )}

            {/* Step 3: O'Level */}
            {currentStep === 3 && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">Enter at least 5 O'Level results (minimum 5 credits required).</p>
                <div className="space-y-3">
                  {oLevelResults.map((result, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Select value={result.subject} onValueChange={(v) => updateOLevel(i, 'subject', v)}>
                          <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Select value={result.grade} onValueChange={(v) => updateOLevel(i, 'grade', v)}>
                          <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                          <SelectContent>
                            {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {oLevelResults.length > 5 && (
                        <button onClick={() => removeOLevelRow(i)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addOLevelRow} className="mt-3">
                  <Plus className="w-4 h-4 mr-1" /> Add Subject
                </Button>
              </div>
            )}

            {/* Step 4: Programme */}
            {currentStep === 4 && (
              <div>
                <Label>Programme Choice *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {PROGRAMMES.map((prog) => (
                    <button
                      key={prog}
                      type="button"
                      onClick={() => setProgrammeChoice(prog)}
                      className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                        programmeChoice === prog
                          ? 'border-gold bg-gold/10 text-navy'
                          : 'border-border hover:border-gold/50'
                      }`}
                    >
                      {prog}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload required documents (JAMB result slip, O'Level certificate, passport photograph).
                </p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gold/40 rounded-lg cursor-pointer hover:bg-gold/5 transition-colors">
                  <Upload className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload documents</span>
                  <span className="text-xs text-muted-foreground">PDF, JPG, PNG (max 5MB each)</span>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-navy">Uploaded Files:</p>
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success" />
                        {file}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {currentStep < STEPS.length ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
              className="bg-navy text-white hover:bg-navy/90"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitApplication.isPending}
              className="bg-gold text-navy font-bold hover:bg-gold-light"
            >
              {submitApplication.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                'Submit Application'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
