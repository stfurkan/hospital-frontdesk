'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { updateService } from '@/lib/actions/services';
import { toast } from 'sonner';
import { Service } from '@/lib/db/schema';

export function EditServiceDialog({
  service,
  open,
  onOpenChange
}: {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleSubmit = async (formData: FormData) => {
    const result = await updateService(service.id, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Hizmet başarıyla güncellendi');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hizmeti Düzenle</DialogTitle>
          <DialogDescription>Hizmet bilgilerini güncelleyin</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-name'>Hizmet Adı *</Label>
            <Input
              id='edit-name'
              name='name'
              defaultValue={service.name}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-description'>Açıklama</Label>
            <Textarea
              id='edit-description'
              name='description'
              defaultValue={service.description || ''}
              rows={3}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-price'>Fiyat (₺) *</Label>
            <Input
              id='edit-price'
              name='price'
              type='number'
              step='0.01'
              min='0'
              defaultValue={service.price}
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
            <Button type='submit'>Güncelle</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

