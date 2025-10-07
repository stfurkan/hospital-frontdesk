'use client';

import { Payment, Patient, Visit } from '@/lib/db/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type PaymentWithRelations = {
  payment: Payment;
  patient: Patient | null;
  visit: Visit | null;
};

export function PaymentsTable({
  payments
}: {
  payments: PaymentWithRelations[];
}) {
  if (payments.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        Henüz tahsilat eklenmemiş
      </div>
    );
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge variant='default'>Nakit</Badge>;
      case 'credit_card':
        return <Badge className='bg-blue-500'>Kredi Kartı</Badge>;
      case 'debit_card':
        return <Badge className='bg-purple-500'>Banka Kartı</Badge>;
      case 'insurance':
        return <Badge className='bg-green-500'>Sigorta</Badge>;
      default:
        return <Badge>{method}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarih</TableHead>
          <TableHead>Hasta</TableHead>
          <TableHead>Tutar</TableHead>
          <TableHead>Ödeme Yöntemi</TableHead>
          <TableHead>Notlar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map(({ payment, patient }) => (
          <TableRow key={payment.id}>
            <TableCell className='font-medium'>
              {format(payment.paymentDate, 'dd MMMM yyyy HH:mm', {
                locale: tr
              })}
            </TableCell>
            <TableCell>
              {patient ? `${patient.firstName} ${patient.lastName}` : '-'}
            </TableCell>
            <TableCell className='font-semibold'>
              ₺{payment.amount.toFixed(2)}
            </TableCell>
            <TableCell>
              {getPaymentMethodBadge(payment.paymentMethod)}
            </TableCell>
            <TableCell>{payment.notes || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
