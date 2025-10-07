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
import { updateDoctor } from '@/lib/actions/doctors';
import { toast } from 'sonner';
import { Doctor, Department } from '@/lib/db/schema';

export function EditDoctorDialog({
  doctor,
  departments,
  open,
  onOpenChange
}: {
  doctor: Doctor;
  departments: Department[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    doctor.departmentId.toString()
  );

  const handleSubmit = async (formData: FormData) => {
    if (!selectedDepartment) {
      toast.error('Lütfen bir bölüm seçin');
      return;
    }

    formData.set('departmentId', selectedDepartment);
    const result = await updateDoctor(doctor.id, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Doktor başarıyla güncellendi');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Doktoru Düzenle</DialogTitle>
          <DialogDescription>Doktor bilgilerini güncelleyin</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-fullName'>Doktor Adı *</Label>
            <Input
              id='edit-fullName'
              name='fullName'
              defaultValue={doctor.fullName}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-departmentId'>Bölüm *</Label>
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
            <Label htmlFor='edit-phone'>Telefon</Label>
            <Input
              id='edit-phone'
              name='phone'
              defaultValue={doctor.phone || ''}
              type='tel'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-email'>E-posta</Label>
            <Input
              id='edit-email'
              name='email'
              defaultValue={doctor.email || ''}
              type='email'
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

