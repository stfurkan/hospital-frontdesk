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
import { updatePatient } from '@/lib/actions/patients';
import { toast } from 'sonner';
import { Patient } from '@/lib/db/schema';
import { format } from 'date-fns';

export function EditPatientDialog({
  patient,
  open,
  onOpenChange
}: {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleSubmit = async (formData: FormData) => {
    const result = await updatePatient(patient.id, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Hasta başarıyla güncellendi');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Hastayı Düzenle</DialogTitle>
          <DialogDescription>Hasta bilgilerini güncelleyin</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-nationalId'>T.C. Kimlik No *</Label>
              <Input
                id='edit-nationalId'
                name='nationalId'
                defaultValue={patient.nationalId}
                maxLength={11}
                pattern='\d{11}'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-dateOfBirth'>Doğum Tarihi</Label>
              <Input
                id='edit-dateOfBirth'
                name='dateOfBirth'
                type='date'
                defaultValue={
                  patient.dateOfBirth
                    ? format(patient.dateOfBirth, 'yyyy-MM-dd')
                    : ''
                }
              />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-firstName'>Ad *</Label>
              <Input
                id='edit-firstName'
                name='firstName'
                defaultValue={patient.firstName}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-lastName'>Soyad *</Label>
              <Input
                id='edit-lastName'
                name='lastName'
                defaultValue={patient.lastName}
                required
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-phone'>Telefon *</Label>
            <Input
              id='edit-phone'
              name='phone'
              type='tel'
              defaultValue={patient.phone}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-address'>Adres</Label>
            <Textarea
              id='edit-address'
              name='address'
              defaultValue={patient.address || ''}
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

