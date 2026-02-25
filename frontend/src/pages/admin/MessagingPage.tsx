import React, { useState } from 'react';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';
import { useSendAnnouncement, extractErrorMessage } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Loader2, Send, MessageSquare, Clock } from 'lucide-react';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';

interface SentMessage {
  content: string;
  targetRole: string;
  timestamp: Date;
}

function MessagingContent() {
  const { actor, isFetching: actorFetching } = useActor();
  const sendAnnouncement = useSendAnnouncement();

  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);

  const isActorReady = !!actor && !actorFetching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActorReady) {
      toast.error('Please wait — connecting to the server...');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    try {
      await sendAnnouncement.mutateAsync({ content, targetRole });
      toast.success('Announcement sent successfully!');
      setSentMessages((prev) => [
        { content, targetRole, timestamp: new Date() },
        ...prev,
      ]);
      setContent('');
      setTargetRole('all');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'all': return 'All Users';
      case 'student': return 'Students';
      case 'staff': return 'Staff';
      case 'parent': return 'Parents';
      default: return role;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messaging & Announcements</h1>
          <p className="text-muted-foreground">Send broadcast announcements to users</p>
        </div>
      </div>

      {!isActorReady && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting to server — please wait before submitting...</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={targetRole} onValueChange={setTargetRole} disabled={sendAnnouncement.isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="student">Students Only</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
                  <SelectItem value="parent">Parents Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageContent">Message</Label>
              <Textarea
                id="messageContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your announcement here..."
                rows={5}
                disabled={sendAnnouncement.isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={!isActorReady || sendAnnouncement.isPending}
              className="w-full md:w-auto"
            >
              {sendAnnouncement.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : !isActorReady ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {sentMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sent This Session ({sentMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentMessages.map((msg, idx) => (
                <div key={idx} className="p-4 bg-muted rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium">To: {getRoleLabel(msg.targetRole)}</span>
                    <span>{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-foreground">{msg.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function MessagingPage() {
  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <MessagingContent />
    </RoleGuard>
  );
}
