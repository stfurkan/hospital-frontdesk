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
import { createDoctor } from '@/lib/actions/doctors';
import { toast } from 'sonner';
import { Department } from '@/lib/db/schema';

export function CreateDoctorDialog({
  children,
  departments
}: {
  children: React.ReactNode;
  departments: Department[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    if (!selectedDepartment) {
      toast.error('Lütfen bir bölüm seçin');
      return;
    }

    formData.set('departmentId', selectedDepartment);
    const result = await createDoctor(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Doktor başarıyla oluşturuldu');
      setOpen(false);
      setSelectedDepartment('');
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Doktor Ekle</DialogTitle>
            <DialogDescription>Yeni bir doktor ekleyin</DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Doktor Adı *</Label>
              <Input
                id='fullName'
                name='fullName'
                placeholder='Örn: Dr. Ahmet Yılmaz'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='departmentId'>Bölüm *</Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder='Bölüm seçin' />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Telefon</Label>
              <Input
                id='phone'
                name='phone'
                placeholder='0532 123 4567'
                type='tel'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>E-posta</Label>
              <Input
                id='email'
                name='email'
                placeholder='doktor@hastane.com'
                type='email'
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
