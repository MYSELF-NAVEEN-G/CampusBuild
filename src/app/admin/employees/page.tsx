
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

interface Employee {
  id: string;
  name: string;
  age: number;
  position: string;
  specialization: string;
}

export default function EmployeeManagementPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    position: '',
    specialization: '',
  });

  const canManageEmployees = user?.email === 'naveen.01@nafon.in' || user?.email === 'john.04@nafon.in';

  // Security check
  useEffect(() => {
    if (!isUserLoading && !canManageEmployees) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to manage employees.',
        variant: 'destructive',
      });
      router.push('/admin');
    }
  }, [user, isUserLoading, router, toast, canManageEmployees]);

  useEffect(() => {
    if (!firestore) return;

    const employeesCollection = collection(firestore, 'employees');
    const unsubscribe = onSnapshot(employeesCollection, (snapshot) => {
      const fetchedEmployees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Employee));
      setEmployees(fetchedEmployees);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching employees:', error);
      toast({ title: 'Error', description: 'Could not fetch employee data.', variant: 'destructive'});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);

  const openForm = (employee: Employee | null = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        age: employee.age,
        position: employee.position,
        specialization: employee.specialization,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        age: 0,
        position: '',
        specialization: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
        ...prev,
        [name]: name === 'age' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) {
      toast({ title: 'Error', description: 'Database not ready.', variant: 'destructive'});
      return;
    }

    const employeeData = {
      ...formData,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingEmployee) {
        const employeeRef = doc(firestore, 'employees', editingEmployee.id);
        await updateDoc(employeeRef, employeeData);
        toast({ title: 'Employee Updated', description: `Details for ${formData.name} have been updated.` });
      } else {
        await addDoc(collection(firestore, 'employees'), { ...employeeData, createdAt: serverTimestamp() });
        toast({ title: 'Employee Added', description: `${formData.name} has been added.` });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({ title: 'Save Error', description: 'Could not save employee details.', variant: 'destructive'});
    }
  };
  
  const handleDelete = async (employeeId: string) => {
      if (!firestore) return;
      try {
          await deleteDoc(doc(firestore, 'employees', employeeId));
          toast({title: 'Employee Removed', description: 'The employee has been removed from the list.'});
      } catch (error) {
          console.error('Error deleting employee:', error);
          toast({title: 'Delete Error', description: 'Could not remove the employee.', variant: 'destructive'});
      }
  }

  if (isUserLoading || loading) {
    return <div>Loading Employee Data...</div>;
  }
  
  if (!canManageEmployees) {
      return <div>Redirecting...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p>Add, edit, or remove employee records from the company database.</p>
        <Button onClick={() => openForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.age}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.specialization}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openForm(employee)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete the employee's record. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(employee.id)}>Confirm</AlertDialogAction>
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
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                <DialogDescription>{editingEmployee ? "Update the employee's details." : "Fill out the form to add a new employee."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <Input name="name" value={formData.name} onChange={handleFormChange} placeholder="Full Name" required />
                <Input name="age" type="number" value={formData.age} onChange={handleFormChange} placeholder="Age" required />
                <Input name="position" value={formData.position} onChange={handleFormChange} placeholder="Position (e.g., Lead Engineer)" required />
                <Input name="specialization" value={formData.specialization} onChange={handleFormChange} placeholder="Specialization (e.g., IoT)" required />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Employee</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
