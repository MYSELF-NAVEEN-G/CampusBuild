
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateIdea, type Idea } from '@/ai/flows/idea-generator';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IdeaGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IdeaGenerator({ isOpen, onClose }: IdeaGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [generatedIdea, setGeneratedIdea] = useState<Idea | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ title: 'Topic Required', description: 'Please enter a topic to generate an idea.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGeneratedIdea(null);
    try {
      const idea = await generateIdea({ topic });
      setGeneratedIdea(idea);
    } catch (error) {
      console.error('Error generating idea:', error);
      toast({ title: 'Generation Failed', description: 'Could not generate an idea. Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state when dialog closes
    setTimeout(() => {
        setTopic('');
        setGeneratedIdea(null);
        setIsGenerating(false);
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Project Idea Generator
          </DialogTitle>
          <DialogDescription>
            Enter a topic or domain, and our AI will brainstorm a project idea for you.
          </DialogDescription>
        </DialogHeader>

        {!isGenerating && !generatedIdea && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., IoT for agriculture, AI in healthcare"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Generate Idea
              </Button>
            </DialogFooter>
          </form>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating your next big idea...</p>
          </div>
        )}

        {generatedIdea && (
            <div className="pt-4">
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                        <CardTitle className="font-headline">{generatedIdea.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{generatedIdea.description}</p>
                    </CardContent>
                </Card>
                 <DialogFooter className="mt-4">
                    <Button onClick={handleSubmit} variant="secondary" disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Another
                    </Button>
                    <Button onClick={handleClose}>Close</Button>
                </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
