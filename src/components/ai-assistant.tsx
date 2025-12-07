'use client';
import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/app-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bot, Send, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAiResponse } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AiAssistant = () => {
    const { isChatOpen, toggleAiChat } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: 'ai',
            text: "Hi! I'm NAFON AI (powered by Gemini). I can help you find projects or generate ideas for a custom build. Try asking about 'Smart Parking' or 'Power Generation'!",
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        setMessages((prev) => [...prev, { sender: 'user', text }]);
        setInput('');
        setIsTyping(true);

        const aiResponse = await getAiResponse(text);

        setIsTyping(false);
        setMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
    };

    return (
        <div className="fixed bottom-6 left-6 z-[100]">
            {/* Chat Window */}
            <div
                className={cn(
                    'flex-col w-[350px] sm:w-[400px] h-[500px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden transform transition-all origin-bottom-left mb-4',
                    isChatOpen ? 'flex scale-100 opacity-100' : 'hidden scale-95 opacity-0'
                )}
            >
                {/* Header */}
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center">
                        <Bot className="mr-2 text-accent" />
                        <div>
                            <h3 className="font-bold text-sm font-headline">NAFON AI Assistant</h3>
                            <p className="text-[10px] opacity-70 font-code">RUNNING GEMINI MODEL</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/80 hover:text-white h-8 w-8" onClick={toggleAiChat}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={cn('flex items-start gap-3', msg.sender === 'user' && 'justify-end')}>
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
                                <div className="bg-muted border rounded-2xl rounded-bl-none p-4 h-12 flex items-center gap-1 shadow-sm">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing" style={{ animationDelay: '-0.32s' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing" style={{ animationDelay: '-0.16s' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-typing"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                
                {/* Input */}
                <div className="p-4 border-t border-border bg-card">
                    <form className="flex gap-2" onSubmit={handleSendMessage}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1"
                            placeholder="Type a topic..."
                            aria-label="Chat input"
                        />
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* FAB */}
            <Button
                size="icon"
                className="w-16 h-16 rounded-full shadow-xl hover:scale-110 transition-transform group relative"
                onClick={toggleAiChat}
                aria-label="Toggle AI Assistant"
            >
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
                <Bot className="h-8 w-8" />
            </Button>
        </div>
    );
};

export default AiAssistant;
