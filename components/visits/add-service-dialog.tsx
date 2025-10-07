'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { addServiceToVisit } from '@/lib/actions/visits';
import { toast } from 'sonner';
import { Service } from '@/lib/db/schema';

export function AddServiceDialog({
  visitId,
  services,
  open,
  onOpenChange
}: {
  visitId: number;
  services: Service[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedService, setSelectedService] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    if (!selectedService) {
      toast.error('Lütfen bir hizmet seçin');
      return;
    }

    formData.set('visitId', visitId.toString());
    formData.set('serviceId', selectedService);

    const result = await addServiceToVisit(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Hizmet eklendi');
      onOpenChange(false);
      setSelectedService('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hizmet Ekle</DialogTitle>
          <DialogDescription>
            Bu gelişe yeni bir hizmet ekleyin
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='serviceId'>Hizmet *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder='Hizmet seçin' />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} - ₺{service.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='quantity'>Adet *</Label>
            <Input
              id='quantity'
              name='quantity'
              type='number'
              min='1'
              defaultValue='1'
              required
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type='submit'>Ekle</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

