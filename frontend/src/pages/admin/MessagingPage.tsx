import React, { useState } from 'react';
import { useSendAnnouncement, isAuthorizationError, ADMIN_AUTH_ERROR_MSG, extractErrorMessage } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react';

interface SentMessage {
  id: number;
  title: string;
  content: string;
  targetRole: string;
  sentAt: Date;
}

export default function MessagingPage() {
  const sendAnnouncement = useSendAnnouncement();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in the title and message content');
      return;
    }

    const fullContent = `${title.trim()}\n\n${content.trim()}`;

    try {
      await sendAnnouncement.mutateAsync({
        content: fullContent,
        targetRole,
      });

      setSentMessages((prev) => [
        {
          id: Date.now(),
          title: title.trim(),
          content: content.trim(),
          targetRole,
          sentAt: new Date(),
        },
        ...prev,
      ]);

      toast.success('Announcement sent successfully!');
      setTitle('');
      setContent('');
      setTargetRole('all');
    } catch (error: unknown) {
      const msg = extractErrorMessage(error);
      if (isAuthorizationError(error)) {
        setAuthError(ADMIN_AUTH_ERROR_MSG);
        toast.error(ADMIN_AUTH_ERROR_MSG);
      } else {
        toast.error(`Failed to send announcement: ${msg}`);
      }
    }
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      all: 'Everyone',
      student: 'Students',
      staff: 'Staff',
      parent: 'Parents',
      admin: 'Admins',
    };
    return map[role] ?? role;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Messaging & Announcements</h1>
      </div>

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authorization Error</AlertTitle>
          <AlertDescription>
            {authError}
            <button className="ml-2 underline font-medium" onClick={() => setAuthError(null)}>
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="msgTitle">Title</Label>
              <Input
                id="msgTitle"
                placeholder="e.g. Important Notice: Exam Timetable"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setAuthError(null); }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="msgContent">Message</Label>
              <Textarea
                id="msgContent"
                placeholder="Type your announcement here..."
                rows={5}
                value={content}
                onChange={(e) => { setContent(e.target.value); setAuthError(null); }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Target Audience</Label>
              <Select value={targetRole} onValueChange={(v) => { setTargetRole(v); setAuthError(null); }}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={sendAnnouncement.isPending}>
              {sendAnnouncement.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
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
            <CardTitle>Sent Announcements (This Session)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentMessages.map((msg) => (
              <div key={msg.id} className="border rounded-lg p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{msg.title}</p>
                  <Badge variant="secondary">{roleLabel(msg.targetRole)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                <p className="text-xs text-muted-foreground">
                  {msg.sentAt.toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
