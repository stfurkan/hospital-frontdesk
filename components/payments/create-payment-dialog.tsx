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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { createPayment } from '@/lib/actions/payments';
import { toast } from 'sonner';
import { Visit, Patient } from '@/lib/db/schema';

type VisitWithPaymentInfo = {
  visit: Visit;
  patient: Patient | null;
  totalServices: number;
  totalPayments: number;
};

export function CreatePaymentDialog({
  children,
  visits
}: {
  children: React.ReactNode;
  visits: VisitWithPaymentInfo[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const selectedVisitData = visits.find(
    (v) => v.visit.id.toString() === selectedVisit
  );
  const remainingAmount = selectedVisitData
    ? selectedVisitData.totalServices - selectedVisitData.totalPayments
    : 0;

  const handleSubmit = async (formData: FormData) => {
    if (!selectedVisit || !paymentMethod) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    formData.set('visitId', selectedVisit);
    formData.set('paymentMethod', paymentMethod);

    const result = await createPayment(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Tahsilat başarıyla eklendi');
      setOpen(false);
      setSelectedVisit('');
      setPaymentMethod('cash');
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Tahsilat Ekle</DialogTitle>
            <DialogDescription>
              Hasta için ödeme kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='visitId'>Geliş *</Label>
              <Select value={selectedVisit} onValueChange={setSelectedVisit}>
                <SelectTrigger>
                  <SelectValue placeholder='Geliş seçin' />
                </SelectTrigger>
                <SelectContent>
                  {visits.map((item) => {
                    const remaining = item.totalServices - item.totalPayments;
                    return (
                      <SelectItem
                        key={item.visit.id}
                        value={item.visit.id.toString()}
                      >
                        {item.patient
                          ? `${item.patient.firstName} ${item.patient.lastName}`
                          : 'Bilinmeyen'}{' '}
                        - Kalan: ₺{remaining.toFixed(2)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedVisitData && (
              <div className='p-3 bg-muted rounded-lg text-sm'>
                <div className='flex justify-between'>
                  <span>Toplam Hizmet:</span>
                  <span className='font-medium'>
                    ₺{selectedVisitData.totalServices.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Ödenen:</span>
                  <span className='font-medium'>
                    ₺{selectedVisitData.totalPayments.toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between font-bold'>
                  <span>Kalan:</span>
                  <span>₺{remainingAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='amount'>Tutar (₺) *</Label>
              <Input
                id='amount'
                name='amount'
                type='number'
                step='0.01'
                min='0'
                max={remainingAmount}
                defaultValue={remainingAmount}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='paymentMethod'>Ödeme Yöntemi *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='cash'>Nakit</SelectItem>
                  <SelectItem value='credit_card'>Kredi Kartı</SelectItem>
                  <SelectItem value='debit_card'>Banka Kartı</SelectItem>
                  <SelectItem value='insurance'>Sigorta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='notes'>Notlar</Label>
              <Textarea id='notes' name='notes' rows={2} />
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
              <Button type='submit'>Tahsilat Kaydet</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
