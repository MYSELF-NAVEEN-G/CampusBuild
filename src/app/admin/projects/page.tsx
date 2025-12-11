
'use client';
import { useEffect, useState, useRef } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
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
import { PlusCircle, Edit, Trash2, Crop, Upload } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import * as XLSX from 'xlsx';


// This is the type we'll use in the component state, which includes the Firestore document ID.
type Project = Omit<ProjectType, 'id' | 'image'> & { docId: string; image: string; desc: string; bundleIncluded: string[] };

// This is the type for the data stored in Firestore.
type FirestoreProject = Omit<ProjectType, 'id' | 'image' > & {
  image: string; // Storing image as a data URL string
  desc: string;
  bundleIncluded: string[];
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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const initialFormData = {
    title: '',
    category: 'Software' as 'IoT' | 'Hardware' | 'Software' | 'AI',
    price: 0,
    image: '', // Will hold data URL
    tags: [] as string[],
    desc: '',
    bundleIncluded: [] as string[],
  };
  const [formData, setFormData] = useState<typeof initialFormData>(initialFormData);

  // Cropping state
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const userEmail = user?.email || '';
  const isSuperAdmin = userEmail === 'naveen.01@nafon.in';
  const canManageProjects = isSuperAdmin || ['karthick.02@nafon.in', 'jed.05@nafon.in', 'gershon.05@nafon.in'].includes(userEmail);

  // Security check
  useEffect(() => {
    if (!isUserLoading && !canManageProjects) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to manage projects.',
        variant: 'destructive',
      });
      router.replace('/admin');
    }
  }, [user, isUserLoading, router, toast, canManageProjects]);


  useEffect(() => {
    if (!firestore || !canManageProjects) {
        setLoading(false);
        return;
    }

    const projectsCollection = collection(firestore, 'projects');
    const unsubscribe = onSnapshot(projectsCollection, (snapshot) => {
      const fetchedProjects = snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreProject;
        return {
          docId: doc.id,
          title: data.title,
          category: data.category,
          price: data.price,
          image: data.image,
          tags: data.tags || [],
          desc: data.desc,
          bundleIncluded: data.bundleIncluded || [],
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
  }, [firestore, toast, canManageProjects]);

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
        bundleIncluded: project.bundleIncluded || [],
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

   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setIsCropperOpen(true);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  const handleCropConfirm = () => {
    if (!completedCrop || !imgRef.current) {
        toast({ title: 'Crop Error', description: 'Could not process the crop.', variant: 'destructive'});
        return;
    }

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    setFormData(prev => ({...prev, image: base64Image}));
    setIsCropperOpen(false);
  }


  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }));
  };
  
  const handleBundleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, bundleIncluded: e.target.value.split('\n').map(item => item.trim()) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !canManageProjects) {
      toast({ title: 'Error', description: 'Database not ready or insufficient permissions.', variant: 'destructive'});
      return;
    }
    if (!formData.image && !editingProject) {
        toast({ title: 'Error', description: 'Please upload an image for the new project.', variant: 'destructive' });
        return;
    }


    const projectData: FirestoreProject & { updatedAt: any, createdAt?: any } = {
      title: formData.title,
      category: formData.category,
      price: formData.price,
      image: formData.image, // Store data URL
      tags: formData.tags,
      desc: formData.desc,
      bundleIncluded: formData.bundleIncluded,
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
      if (!firestore || !canManageProjects) return;
      try {
          await deleteDoc(doc(firestore, 'projects', projectId));
          toast({title: 'Project Deleted', description: 'The project has been removed.'});
      } catch (error) {
          console.error('Error deleting project:', error);
          toast({title: 'Delete Error', description: 'Could not delete the project.', variant: 'destructive'});
      }
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore || !canManageProjects) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
              toast({ title: 'Upload Error', description: 'Excel file is empty or in the wrong format.', variant: 'destructive'});
              return;
            }

            const batch = writeBatch(firestore);
            const projectsCollection = collection(firestore, 'projects');
            
            json.forEach((row) => {
              const docRef = doc(projectsCollection); // Create a new doc with a random ID
              const projectData = {
                title: row.title || 'No Title',
                category: row.category || 'Software',
                price: parseFloat(row.price) || 0,
                desc: row.description || '',
                tags: row.tags ? String(row.tags).split(',').map(t => t.trim()) : [],
                bundleIncluded: row.bundleIncluded ? String(row.bundleIncluded).split('\n').map(t => t.trim()) : [],
                image: row.image || `https://picsum.photos/seed/${Math.random()}/600/400`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };
              batch.set(docRef, projectData);
            });

            await batch.commit();

            toast({ title: 'Upload Successful', description: `${json.length} projects have been added.` });
            setIsUploadDialogOpen(false);
        } catch (error) {
            console.error('Error processing Excel file:', error);
            toast({ title: 'Upload Failed', description: 'There was an error processing your file.', variant: 'destructive'});
        } finally {
            setIsUploading(false);
             // Reset file input
            e.target.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
  };


  if (isUserLoading || loading) {
    return <div>Loading Project Data...</div>;
  }
  
  if (!canManageProjects) {
      return <div>Redirecting...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p>Manage the publicly available projects in the catalog.</p>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Upload Catalog
            </Button>
            <Button onClick={() => openForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
            </Button>
        </div>
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
                <TableCell>₹{project.price.toFixed(2)}</TableCell>
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
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                <DialogDescription>{editingProject ? 'Update the details for this project.' : 'Fill out the form to add a new project to the catalog.'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                    <Input name="title" value={formData.title} onChange={handleFormChange} placeholder="Project Title" required />
                    <Textarea name="desc" value={formData.desc} onChange={handleFormChange} placeholder="Project Description" required className="h-24" />
                    <div>
                        <Label htmlFor="bundleIncluded">Bundle Included (one item per line)</Label>
                        <Textarea id="bundleIncluded" name="bundleIncluded" value={formData.bundleIncluded.join('\n')} onChange={handleBundleChange} placeholder="e.g.,&#10;Hardware Kit&#10;Source Code&#10;Assembly Guide" required className="h-28 mt-1" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IoT">IoT</SelectItem>
                            <SelectItem value="Hardware">Hardware</SelectItem>
                            <SelectItem value="Software">Software</SelectItem>
                            <SelectItem value="AI">AI</SelectItem>
                        </SelectContent>
                    </Select>
                    <div>
                        <Label htmlFor="image-upload">Project Image</Label>
                        <Input id="image-upload" name="image" type="file" accept="image/*" onChange={handleFileSelect} className="mt-1"/>
                    </div>
                    {formData.image && (
                        <div className="mt-2">
                            <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
                            <img src={formData.image} alt="Preview" className="rounded-md object-cover h-32 w-full" />
                        </div>
                    )}
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
      
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogDescription>Select the part of the image you want to use.</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={16 / 9}
                className="max-h-[70vh]"
              >
                <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop preview" />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCropperOpen(false)}>Cancel</Button>
            <Button onClick={handleCropConfirm}><Crop className="mr-2 h-4 w-4" /> Crop and Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Project Catalog</DialogTitle>
            <DialogDescription>
              Select an Excel file (.xlsx) to bulk upload projects. Ensure your file has the following columns: <strong>title, category, price, description, tags, bundleIncluded, image</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
              <Label htmlFor="excel-upload">Excel File</Label>
              <Input 
                id="excel-upload" 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                disabled={isUploading}
              />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>Cancel</Button>
            <Button disabled={true} className="hidden">
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
