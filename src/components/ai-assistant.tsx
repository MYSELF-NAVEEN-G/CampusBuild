'use client';
import {useState, useRef, useEffect} from 'react';
import {useAppContext} from '@/context/app-context';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Bot, Send, X, User} from 'lucide-react';
import {cn} from '@/lib/utils';
import {getAiResponse} from '@/app/actions';
import {ScrollArea} from './ui/scroll-area';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AiAssistant = () => {
  const {isChatOpen, toggleAiChat} = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hi! I'm CampusBuild AI. I can help you brainstorm a project idea for your custom build. What topic are you interested in?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages(prev => [...prev, {sender: 'user', text}]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await getAiResponse(text);
      setMessages(prev => [...prev, {sender: 'ai', text: aiResponse}]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'I seem to be having trouble connecting. Please check the server logs or contact support.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-4 left-4 z-[100] md:bottom-6 md:left-6">
        <Button
          onClick={toggleAiChat}
          size="lg"
          className="rounded-full h-16 w-16 md:h-auto md:w-auto md:rounded-lg shadow-lg md:px-4"
        >
          <Bot className="h-6 w-6 md:mr-2" />
          <span className="hidden md:inline">AI Assistant</span>
        </Button>
      </div>


      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-[calc(4rem+1.5rem)] left-4 right-4 z-[99] flex flex-col h-[60vh] max-h-[500px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transform-gpu transition-all origin-bottom-left md:bottom-6 md:left-6 md:w-[400px] md:right-auto',
          isChatOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center">
            <Bot className="mr-2 text-accent" />
            <div>
              <h3 className="font-bold text-sm font-headline">
                CampusBuild AI
              </h3>
              <p className="text-[10px] opacity-70 font-code">
                POWERED BY GEMINI
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white h-8 w-8"
            onClick={toggleAiChat}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  msg.sender === 'user' && 'justify-end'
                )}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot className="text-primary-foreground h-5 w-5" />
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-2xl p-3 text-sm shadow-sm max-w-[85%]',
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-muted-foreground rounded-bl-none border'
                  )}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <User className="text-slate-600 h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="text-primary-foreground h-5 w-5" />
                </div>
                <div className="bg-muted border rounded-2xl rounded-bl-none p-4 h-12 flex items-center gap-1.5 shadow-sm">
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{animationDelay: '0s'}}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{animationDelay: '0.2s'}}
                  ></div>
                  <div
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{animationDelay: '0.4s'}}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          <form className="flex gap-2" onSubmit={handleSendMessage}>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
              placeholder="Ask for a project idea..."
              aria-label="Chat input"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AiAssistant;
