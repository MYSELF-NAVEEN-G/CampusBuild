
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal, MapPin, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

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
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setDeadline('');
    }
  }, [isOpen]);

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using a free, public reverse geocoding service. No API key needed.
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          } else {
            toast({ title: "Location Error", description: "Could not find address for your location.", variant: "destructive" });
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast({ title: "Location Error", description: "Failed to fetch address from coordinates.", variant: "destructive" });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        toast({ title: "Geolocation Error", description: error.message, variant: "destructive" });
        setIsLocating(false);
      }
    );
  };


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
            <div className="flex justify-between items-center">
                <Label htmlFor="address">Delivery Address</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation} disabled={isLocating}>
                    {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                    <span className="ml-2">{isLocating ? 'Locating...' : 'Use Current Location'}</span>
                </Button>
            </div>
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
                <ul className="list-disc list-inside space-y-1">
                    <li>If you do not receive a confirmation message or call within 2 business days, please contact us.</li>
                    <li>Additional delivery charges may apply based on your location.</li>
                </ul>
            </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutForm;
