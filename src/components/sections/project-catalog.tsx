'use client';
import { useState } from 'react';
import { projects } from '@/lib/projects';
import ProjectCard from '@/components/project-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Category = 'All' | 'IoT' | 'Hardware' | 'Software' | 'AI';
const categories: Category[] = ['All', 'IoT', 'Hardware', 'Software', 'AI'];

const ProjectCatalog = () => {
    const [filter, setFilter] = useState<Category>('All');

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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project, index) => (
                        <div key={project.id} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <ProjectCard project={project} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProjectCatalog;
