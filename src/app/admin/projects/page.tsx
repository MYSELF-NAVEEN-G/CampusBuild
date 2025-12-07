
'use client';
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import type { Project as ProjectType } from '@/lib/projects';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// This is the type we'll use in the component state, which includes the Firestore document ID and resolved image object.
type Project = ProjectType & { docId: string };

// This is the type for the data stored in Firestore.
type FirestoreProject = Omit<ProjectType, 'id' | 'image' > & {
  image: string; // Storing image by its ID
};

export default function ProjectManagementPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const initialFormData = {
    title: '',
    category: 'Software' as 'IoT' | 'Hardware' | 'Software' | 'AI',
    price: 0,
    image: null as ImagePlaceholder | null,
    tags: [] as string[],
    desc: '',
  };
  const [formData, setFormData] = useState<typeof initialFormData>(initialFormData);

  // Security check
  useEffect(() => {
    if (!isUserLoading && (!user || user.email !== 'naveen.contactme1@gmail.com')) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to manage projects.',
        variant: 'destructive',
      });
      router.push('/admin');
    }
  }, [user, isUserLoading, router, toast]);


  useEffect(() => {
    if (!firestore) return;

    const projectsCollection = collection(firestore, 'projects');
    const unsubscribe = onSnapshot(projectsCollection, (snapshot) => {
      const fetchedProjects = snapshot.docs.map((doc, index) => {
        const data = doc.data() as FirestoreProject;
        const imagePlaceholder = PlaceHolderImages.find(p => p.id === data.image) || PlaceHolderImages[0];
        return {
          docId: doc.id,
          id: index + 1, // This is just for local array key, not DB id
          title: data.title,
          category: data.category,
          price: data.price,
          image: imagePlaceholder,
          tags: data.tags || [],
          desc: data.desc,
        } as Project;
      });
      setProjects(fetchedProjects);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching projects:', error);
      toast({ title: 'Error', description: 'Could not fetch projects.', variant: 'destructive'});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);

  const openForm = (project: Project | null = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        category: project.category,
        price: project.price,
        image: project.image,
        tags: project.tags || [],
        desc: project.desc,
      });
    } else {
      setEditingProject(null);
      setFormData(initialFormData);
    }
    setIsFormOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
        ...prev,
        [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
     if (name === 'image') {
        const selectedImage = PlaceHolderImages.find(p => p.id === value);
        setFormData(prev => ({...prev, image: selectedImage || null}));
    } else {
        setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !formData.image) {
      toast({ title: 'Error', description: 'Form is invalid or database not ready.', variant: 'destructive'});
      return;
    }

    const projectData: FirestoreProject & { updatedAt: any, createdAt?: any } = {
      title: formData.title,
      category: formData.category,
      price: formData.price,
      image: formData.image.id, // Store only the ID
      tags: formData.tags,
      desc: formData.desc,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingProject) {
        const projectRef = doc(firestore, 'projects', editingProject.docId);
        await updateDoc(projectRef, projectData);
        toast({ title: 'Project Updated', description: `"${formData.title}" has been updated.` });
      } else {
        projectData.createdAt = serverTimestamp();
        await addDoc(collection(firestore, 'projects'), projectData);
        toast({ title: 'Project Added', description: `"${formData.title}" has been added.` });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      toast({ title: 'Save Error', description: 'Could not save the project. Check permissions.', variant: 'destructive'});
    }
  };
  
  const handleDelete = async (projectId: string) => {
      if (!firestore) return;
      try {
          await deleteDoc(doc(firestore, 'projects', projectId));
          toast({title: 'Project Deleted', description: 'The project has been removed.'});
      } catch (error) {
          console.error('Error deleting project:', error);
          toast({title: 'Delete Error', description: 'Could not delete the project.', variant: 'destructive'});
      }
  }

  if (isUserLoading || loading) {
    return <div>Loading Project Data...</div>;
  }
  
  if (!user || user.email !== 'naveen.contactme1@gmail.com') {
      return <div>Redirecting...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p>Manage the publicly available projects in the catalog.</p>
        <Button onClick={() => openForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.docId}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>${project.price.toFixed(2)}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openForm(project)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete the project from the catalog. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project.docId)}>Confirm</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                <DialogDescription>{editingProject ? 'Update the details for this project.' : 'Fill out the form to add a new project to the catalog.'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4 col-span-2 md:col-span-1">
                    <Input name="title" value={formData.title} onChange={handleFormChange} placeholder="Project Title" required />
                    <Textarea name="desc" value={formData.desc} onChange={handleFormChange} placeholder="Project Description" required className="h-40" />
                </div>
                <div className="space-y-4 col-span-2 md:col-span-1">
                    <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IoT">IoT</SelectItem>
                            <SelectItem value="Hardware">Hardware</SelectItem>
                            <SelectItem value="Software">Software</SelectItem>
                            <SelectItem value="AI">AI</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select name="image" value={formData.image?.id || ''} onValueChange={(value) => handleSelectChange('image', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an image..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {PlaceHolderImages.map(img => (
                                <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleFormChange} placeholder="Price" required />
                    <Input name="tags" value={formData.tags.join(', ')} onChange={handleTagsChange} placeholder="Tags (comma-separated)" />
                </div>
                <DialogFooter className="col-span-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Project</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
