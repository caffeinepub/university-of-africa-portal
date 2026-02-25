import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useSendAnnouncement } from '../../hooks/useQueries';
import RoleGuard from '../../components/auth/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useActor } from '../../hooks/useActor';

interface SentMessage {
  content: string;
  targetRole: string;
  timestamp: number;
}

function MessagingContent() {
  const navigate = useNavigate();
  const { isFetching: actorFetching } = useActor();
  const sendAnnouncement = useSendAnnouncement();

  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendAnnouncement.mutateAsync({ content, targetRole });
      toast.success('Announcement sent successfully');
      setSentMessages(prev => [{ content, targetRole, timestamp: Date.now() }, ...prev]);
      setContent('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send announcement');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img src="/assets/generated/university-crest.dim_256x256.png" alt="Crest" className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold">Messaging & Announcements</h1>
            <p className="text-xs text-primary-foreground/70">Send announcements to portal users</p>
          </div>
          <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate({ to: '/admin' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />Send Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Target Audience</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your announcement here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={sendAnnouncement.isPending || actorFetching} className="w-full sm:w-auto">
                {sendAnnouncement.isPending ? 'Sending...' : <><Send className="w-4 h-4 mr-2" />Send Announcement</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {sentMessages.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sent This Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sentMessages.map((msg, i) => (
                <div key={i} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-primary capitalize">To: {msg.targetRole}</span>
                    <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-foreground">{msg.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <RoleGuard requiredRole="admin">
      <MessagingContent />
    </RoleGuard>
  );
}
