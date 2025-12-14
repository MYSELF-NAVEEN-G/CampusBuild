
'use client';
import Image from 'next/image';
import type { Project } from '@/lib/projects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, PackageCheck } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectCardProps {
    project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
    const { addToCart, toggleCart } = useAppContext();
    const { toast } = useToast();

    const handleAddToCart = () => {
        addToCart(project);
        toast({
            title: "Added to Order",
            description: `"${project.title}" has been added to your order list.`,
        });
        toggleCart();
    };
    
    const fallbackImage = 'https://picsum.photos/seed/1/600/400';
    let imageUrl = fallbackImage;
    let imageDescription = project.title;
    let imageHint = '';

    // Check if project.image is a base64 data URL
    if (typeof project.image === 'string' && project.image.startsWith('data:image')) {
        imageUrl = project.image;
    } else if (typeof project.image === 'string') {
        // If it's a string but not a data URL, assume it's a placeholder ID
        const placeholder = PlaceHolderImages.find(p => p.id === project.image);
        if (placeholder) {
            imageUrl = placeholder.imageUrl;
            imageDescription = placeholder.description;
            imageHint = placeholder.imageHint;
        }
    }

    return (
        <Dialog>
            <Card className="h-full flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
                <DialogTrigger asChild>
                    <div className="cursor-pointer">
                        <CardHeader className="p-0">
                            <div className="relative h-48 overflow-hidden group">
                                <Image
                                    src={imageUrl}
                                    alt={imageDescription}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    data-ai-hint={imageHint}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <Badge variant="secondary" className="absolute top-3 right-3 bg-white/90 backdrop-blur">
                                    {project.category}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 flex-1 flex flex-col">
                            <CardTitle className="text-lg font-bold text-slate-900 mb-2 font-headline">{project.title}</CardTitle>
                            <CardDescription className="text-slate-500 text-sm mb-4 line-clamp-2">{project.desc}</CardDescription>
                            
                             <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t">
                                {project.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </div>
                </DialogTrigger>
                <CardFooter className="p-5 flex items-center justify-between border-t mt-auto">
                    <span className="text-xl font-bold text-slate-800">₹{project.price.toFixed(2)}</span>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={handleAddToCart}>
                        Add to Order <Plus className="ml-1 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>

            <DialogContent className="sm:max-w-xl md:max-w-3xl flex flex-col max-h-[90vh]">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-3xl font-bold font-headline">{project.title}</DialogTitle>
                    <DialogDescription className="text-base text-slate-600 pt-2">{project.desc}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow min-h-0">
                    <div className="py-6 space-y-6 pr-6">
                        <div className="relative rounded-lg overflow-hidden h-64 md:h-80">
                            <Image src={imageUrl} alt={project.title} fill className="object-cover" />
                        </div>
                        <div className="space-y-6">
                            {project.bundleIncluded && project.bundleIncluded.length > 0 && (
                            <div className="text-sm text-slate-700">
                                <h4 className="font-bold uppercase tracking-wider mb-3 flex items-center text-slate-800"><PackageCheck className="mr-2 h-5 w-5 text-primary" />Bundle Includes</h4>
                                <ul className="space-y-2 list-disc list-inside bg-slate-50 p-4 rounded-lg border">
                                {project.bundleIncluded.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                                </ul>
                            </div>
                            )}
                            <div className="text-sm">
                                <h4 className="font-bold uppercase tracking-wider mb-3 text-slate-800">Details</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Category</span>
                                        <Badge variant="secondary">{project.category}</Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                                        <span className="text-slate-500 mr-2">Tags:</span>
                                        {project.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="flex-shrink-0 flex-col-reverse items-center justify-between sm:flex-col-reverse bg-background/95 backdrop-blur-sm pt-4 border-t gap-4">
                    <Button size="lg" onClick={handleAddToCart} className="w-full sm:w-auto">
                        Add to Order <Plus className="ml-2 h-4 w-4" />
                    </Button>
                    <span className="text-2xl font-extrabold text-slate-900">₹{project.price.toFixed(2)}</span>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectCard;
