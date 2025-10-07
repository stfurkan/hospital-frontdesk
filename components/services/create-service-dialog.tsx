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
import { Textarea } from '@/components/ui/textarea';
import { createService } from '@/lib/actions/services';
import { toast } from 'sonner';

export function CreateServiceDialog({
  children
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const result = await createService(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Hizmet başarıyla oluşturuldu');
      setOpen(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Hizmet Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir muayene hizmeti ekleyin
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Hizmet Adı *</Label>
              <Input
                id='name'
                name='name'
                placeholder='Örn: Genel Muayene'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Açıklama</Label>
              <Textarea
                id='description'
                name='description'
                placeholder='Hizmet hakkında kısa açıklama'
                rows={3}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='price'>Fiyat (₺) *</Label>
              <Input
                id='price'
                name='price'
                type='number'
                step='0.01'
                min='0'
                placeholder='0.00'
                required
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
              <Button type='submit'>Kaydet</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
