
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { name: string; email: string; phone: string; deadline: string; address: string; }) => void;
  isSubmitting: boolean;
  minDeadlineDate: string;
}

const CheckoutForm = ({ isOpen, onClose, onSubmit, isSubmitting, minDeadlineDate }: CheckoutFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deadline, setDeadline] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDeadline('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !deadline || !address) {
      setError('Please fill out all fields, including the address and deadline.');
      return;
    }
    setError('');
    onSubmit({ name, email, phone, deadline, address });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Customer Information</DialogTitle>
          <DialogDescription>Please provide your details to complete the order.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@university.edu" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your Phone Number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your full delivery address" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Requested Deadline</Label>
            <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={minDeadlineDate} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
            </Button>
          </DialogFooter>
        </form>
         <Alert className="mt-4">
            <Terminal className="h-4 w-4" />
            <AlertDescription>
                If you do not receive a confirmation message or call within 2 business days, it means the order was not properly saved. Please contact us.
            </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutForm;
