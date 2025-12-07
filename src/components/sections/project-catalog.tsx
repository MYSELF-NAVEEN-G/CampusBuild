
'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Project as ProjectType } from '@/lib/projects';
import ProjectCard from '@/components/project-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type Category = 'All' | 'IoT' | 'Hardware' | 'Software' | 'AI';
const categories: Category[] = ['All', 'IoT', 'Hardware', 'Software', 'AI'];

type FirestoreProject = Omit<ProjectType, 'id' | 'image' | 'difficulty'> & {
  image: string;
  desc: string;
};

const ProjectCatalog = () => {
    const { firestore } = useFirebase();
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Category>('All');

    useEffect(() => {
        if (!firestore) return;

        setLoading(true);
        const projectsCollection = collection(firestore, 'projects');
        const unsubscribe = onSnapshot(projectsCollection, (snapshot) => {
            const fetchedProjects = snapshot.docs.map((doc) => {
                const data = doc.data() as FirestoreProject;
                
                return {
                    id: doc.id, // Use Firestore doc ID as the unique ID
                    docId: doc.id,
                    title: data.title,
                    category: data.category,
                    price: data.price,
                    image: data.image, // This will be the data URL or placeholder ID
                    tags: data.tags || [],
                    desc: data.desc,
                } as ProjectType;
            });
            setProjects(fetchedProjects);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching projects:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);


    const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

    return (
        <section className="py-16 bg-white min-h-screen" id="projectCatalog">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-headline">Project Catalog</h2>
                        <p className="text-slate-500 mt-1">Select a category to filter the laboratory database.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                variant={filter === cat ? 'default' : 'outline'}
                                className={cn(
                                    'transition-all',
                                    filter === cat && 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                                )}
                                onClick={() => setFilter(cat)}
                            >
                                {cat === 'AI' ? 'AI/ML' : cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                           <div key={i} className="flex flex-col space-y-3">
                               <Skeleton className="h-[200px] w-full rounded-xl" />
                               <div className="space-y-2">
                                   <Skeleton className="h-4 w-3/4" />
                                   <Skeleton className="h-4 w-1/2" />
                               </div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProjects.map((project, index) => (
                            <div key={project.id} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <ProjectCard project={project} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProjectCatalog;
