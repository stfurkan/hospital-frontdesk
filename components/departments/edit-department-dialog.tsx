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
import { updateDepartment } from '@/lib/actions/departments';
import { toast } from 'sonner';
import { Department } from '@/lib/db/schema';

export function EditDepartmentDialog({
  department,
  open,
  onOpenChange
}: {
  department: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleSubmit = async (formData: FormData) => {
    const result = await updateDepartment(department.id, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Bölüm başarıyla güncellendi');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bölümü Düzenle</DialogTitle>
          <DialogDescription>Bölüm bilgilerini güncelleyin</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-name'>Bölüm Adı *</Label>
            <Input
              id='edit-name'
              name='name'
              defaultValue={department.name}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-description'>Açıklama</Label>
            <Textarea
              id='edit-description'
              name='description'
              defaultValue={department.description || ''}
              rows={3}
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

