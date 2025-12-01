'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import './ChatWidget.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  senderName?: string;
}

interface ChatWidgetProps {
  locale?: string;
}

export default function ChatWidget({ locale = 'en' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: locale === 'ar' ? 'مرحباً! كيف يمكنني مساعدتك اليوم؟' : 'Hello! How can I help you today?',
      sender: 'admin',
      timestamp: new Date(),
      senderName: locale === 'ar' ? 'فريق الدعم' : 'Support Team'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const t = useTranslations('chat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      senderName: session?.user?.name || 'User'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate admin response
    setTimeout(() => {
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: locale === 'ar' 
          ? 'شكراً لرسالتك. سأقوم بمساعدتك في أقرب وقت ممكن.' 
          : 'Thank you for your message. I will help you as soon as possible.',
        sender: 'admin',
        timestamp: new Date(),
        senderName: locale === 'ar' ? 'فريق الدعم' : 'Support Team'
      };
      setMessages(prev => [...prev, adminResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96">
      <Card className="h-full flex flex-col shadow-xl border-0 bg-background/95 backdrop-blur-sm">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            {locale === 'ar' ? 'الدردشة' : 'Live Chat'}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'admin' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src="/support-avatar.webp" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        ST
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                  {msg.sender === 'user' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={session?.user?.image} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {session?.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src="/support-avatar.webp" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      ST
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full chat-typing-dot chat-typing-dot-1" />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full chat-typing-dot chat-typing-dot-2" />
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full chat-typing-dot chat-typing-dot-3" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={locale === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  disabled={!message.trim() || isTyping}
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
