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
import { createPatient } from '@/lib/actions/patients';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export function CreatePatientDialog({
  children
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nationalId: '',
    dateOfBirth: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const data = new FormData(e.currentTarget);
    const result = await createPatient(data);

    if (result.error) {
      // Parse error message to extract field-specific errors
      const errorMsg = result.error;
      const fieldErrors: Record<string, string> = {};

      if (errorMsg.includes('TC Kimlik')) {
        fieldErrors.nationalId = errorMsg;
      } else if (errorMsg.includes('telefon') || errorMsg.includes('Telefon')) {
        fieldErrors.phone = errorMsg;
      } else if (errorMsg.includes('İsim') || errorMsg.includes('isim')) {
        fieldErrors.firstName = errorMsg;
      } else if (errorMsg.includes('Soyisim') || errorMsg.includes('soyisim')) {
        fieldErrors.lastName = errorMsg;
      } else if (errorMsg.includes('Adres') || errorMsg.includes('adres')) {
        fieldErrors.address = errorMsg;
      } else {
        // General error
        fieldErrors.general = errorMsg;
      }

      setErrors(fieldErrors);
      toast.error('Lütfen hataları düzeltip tekrar deneyin');
    } else {
      toast.success('Hasta başarıyla oluşturuldu');
      setFormData({
        nationalId: '',
        dateOfBirth: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
      });
      setErrors({});
      setOpen(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Yeni Hasta Ekle</DialogTitle>
            <DialogDescription>Yeni hasta kaydı oluşturun</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {errors.general && (
              <div className='flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
                <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400 mt-0.5' />
                <p className='text-sm text-red-800 dark:text-red-300'>
                  {errors.general}
                </p>
              </div>
            )}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='nationalId'
                  className={
                    errors.nationalId ? 'text-red-600 dark:text-red-400' : ''
                  }
                >
                  T.C. Kimlik No *
                </Label>
                <Input
                  id='nationalId'
                  name='nationalId'
                  placeholder='Örn: 12345678900'
                  maxLength={11}
                  pattern='\d{11}'
                  value={formData.nationalId}
                  onChange={handleChange}
                  className={
                    errors.nationalId ? 'border-red-500 focus:ring-red-500' : ''
                  }
                  required
                />
                {errors.nationalId ? (
                  <p className='text-xs text-red-600 dark:text-red-400 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.nationalId}
                  </p>
                ) : (
                  <p className='text-xs text-muted-foreground'>
                    11 haneli TC Kimlik No
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='dateOfBirth'>Doğum Tarihi</Label>
                <Input
                  id='dateOfBirth'
                  name='dateOfBirth'
                  type='date'
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='firstName'
                  className={
                    errors.firstName ? 'text-red-600 dark:text-red-400' : ''
                  }
                >
                  Ad *
                </Label>
                <Input
                  id='firstName'
                  name='firstName'
                  placeholder='Örn: Ahmet'
                  value={formData.firstName}
                  onChange={handleChange}
                  className={
                    errors.firstName ? 'border-red-500 focus:ring-red-500' : ''
                  }
                  required
                />
                {errors.firstName && (
                  <p className='text-xs text-red-600 dark:text-red-400 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label
                  htmlFor='lastName'
                  className={
                    errors.lastName ? 'text-red-600 dark:text-red-400' : ''
                  }
                >
                  Soyad *
                </Label>
                <Input
                  id='lastName'
                  name='lastName'
                  placeholder='Örn: Yılmaz'
                  value={formData.lastName}
                  onChange={handleChange}
                  className={
                    errors.lastName ? 'border-red-500 focus:ring-red-500' : ''
                  }
                  required
                />
                {errors.lastName && (
                  <p className='text-xs text-red-600 dark:text-red-400 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className='space-y-2'>
              <Label
                htmlFor='phone'
                className={errors.phone ? 'text-red-600 dark:text-red-400' : ''}
              >
                Telefon *
              </Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                placeholder='Örn: 0532 123 45 67'
                value={formData.phone}
                onChange={handleChange}
                className={
                  errors.phone ? 'border-red-500 focus:ring-red-500' : ''
                }
                required
              />
              {errors.phone ? (
                <p className='text-xs text-red-600 dark:text-red-400 flex items-center gap-1'>
                  <AlertCircle className='h-3 w-3' />
                  {errors.phone}
                </p>
              ) : (
                <p className='text-xs text-muted-foreground'>
                  Cep telefonu numarası (05XX XXX XX XX)
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label
                htmlFor='address'
                className={
                  errors.address ? 'text-red-600 dark:text-red-400' : ''
                }
              >
                Adres
              </Label>
              <Textarea
                id='address'
                name='address'
                placeholder='Örn: Atatürk Mah. Cumhuriyet Cad. No:123 Kadıköy/İstanbul'
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className={
                  errors.address ? 'border-red-500 focus:ring-red-500' : ''
                }
              />
              {errors.address && (
                <p className='text-xs text-red-600 dark:text-red-400 flex items-center gap-1'>
                  <AlertCircle className='h-3 w-3' />
                  {errors.address}
                </p>
              )}
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false);
                  setFormData({
                    nationalId: '',
                    dateOfBirth: '',
                    firstName: '',
                    lastName: '',
                    phone: '',
                    address: ''
                  });
                  setErrors({});
                }}
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
