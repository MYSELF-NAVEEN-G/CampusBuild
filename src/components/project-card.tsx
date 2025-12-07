
'use client';
import Image from 'next/image';
import type { Project } from '@/lib/projects';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
        <Card className="h-full flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
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
                <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    {project.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-5 flex items-center justify-between border-t">
                <span className="text-xl font-bold text-slate-800">₹{project.price.toFixed(2)}</span>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" onClick={handleAddToCart}>
                    Add to Order <Plus className="ml-1 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProjectCard;
