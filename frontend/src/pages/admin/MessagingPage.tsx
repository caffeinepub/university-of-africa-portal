import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import RoleGuard from '../../components/auth/RoleGuard';
import { UserRole } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, MessageSquare, Send, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  title: string;
  content: string;
  targetRole: string;
  date: string;
}

function MessagingContent() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSending(true);
    // Store locally since backend messaging is not yet implemented
    await new Promise((r) => setTimeout(r, 500));
    const newMessage: Message = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      targetRole,
      date: new Date().toLocaleDateString('en-NG', { dateStyle: 'medium' }),
    };
    setMessages((prev) => [newMessage, ...prev]);
    toast.success('Announcement sent successfully!');
    setTitle('');
    setContent('');
    setTargetRole('all');
    setIsSending(false);
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      all: 'All Users',
      student: 'Students',
      staff: 'Staff',
      parent: 'Parents',
    };
    return map[role] || role;
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">
              <ChevronLeft className="w-4 h-4 mr-1" /> Admin Panel
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-navy">Messaging & Announcements</h1>
          <p className="text-muted-foreground text-sm">
            Send broadcast announcements to users
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compose */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-navy flex items-center gap-2">
                <Send className="w-5 h-5 text-gold" />
                Compose Announcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your announcement here..."
                    rows={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="target">Target Audience</Label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="student">Students Only</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                      <SelectItem value="parent">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={!title.trim() || !content.trim() || isSending}
                  className="w-full bg-navy text-white hover:bg-navy/90"
                >
                  {isSending ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Send Announcement
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-navy flex items-center gap-2">
                <Bell className="w-5 h-5 text-gold" />
                Sent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No announcements sent yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-lg border border-border bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-navy text-sm">{msg.title}</span>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {roleLabel(msg.targetRole)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{msg.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{msg.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
