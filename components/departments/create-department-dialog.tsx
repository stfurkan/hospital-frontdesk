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
import { createDepartment } from '@/lib/actions/departments';
import { toast } from 'sonner';

export function CreateDepartmentDialog({
  children
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const result = await createDepartment(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Bölüm başarıyla oluşturuldu');
      setOpen(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Bölüm Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir hastane bölümü ekleyin
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Bölüm Adı *</Label>
              <Input
                id='name'
                name='name'
                placeholder='Örn: Kardiyoloji'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Açıklama</Label>
              <Textarea
                id='description'
                name='description'
                placeholder='Bölüm hakkında kısa açıklama'
                rows={3}
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
