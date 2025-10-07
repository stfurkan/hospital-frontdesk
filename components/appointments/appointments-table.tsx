'use client';

import { Appointment, Patient, Doctor, Department } from '@/lib/db/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cancelAppointment } from '@/lib/actions/appointments';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter, useSearchParams } from 'next/navigation';

type AppointmentWithRelations = {
  appointment: Appointment;
  patient: Patient | null;
  doctor: Doctor | null;
  department: Department | null;
};

export function AppointmentsTable({
  appointments,
  currentPage,
  totalPages
}: {
  appointments: AppointmentWithRelations[];
  currentPage?: number;
  totalPages?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/appointments?${params.toString()}`);
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    const result = await cancelAppointment(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Randevu iptal edildi');
    }
  };

  if (appointments.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        {searchParams.get('search')
          ? 'Arama kriterlerine uygun randevu bulunamadı'
          : 'Henüz randevu eklenmemiş'}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant='default'>Planlandı</Badge>;
      case 'completed':
        return <Badge className='bg-green-500'>Tamamlandı</Badge>;
      case 'cancelled':
        return <Badge variant='destructive'>İptal</Badge>;
      case 'no_show':
        return <Badge variant='secondary'>Gelmedi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Randevu Tarihi</TableHead>
            <TableHead>Hasta</TableHead>
            <TableHead>Doktor</TableHead>
            <TableHead>Bölüm</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Notlar</TableHead>
            <TableHead className='text-right'>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map(({ appointment, patient, doctor, department }) => (
            <TableRow key={appointment.id}>
              <TableCell className='font-medium'>
                {format(appointment.appointmentDate, 'dd MMMM yyyy HH:mm', {
                  locale: tr
                })}
              </TableCell>
              <TableCell>
                {patient ? `${patient.firstName} ${patient.lastName}` : '-'}
              </TableCell>
              <TableCell>{doctor?.fullName || '-'}</TableCell>
              <TableCell>{department?.name || '-'}</TableCell>
              <TableCell>{getStatusBadge(appointment.status)}</TableCell>
              <TableCell>{appointment.notes || '-'}</TableCell>
              <TableCell>
                <div className='flex items-center justify-end gap-1'>
                  {appointment.status === 'scheduled' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleCancel(appointment.id)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages && totalPages > 1 && (
        <div className='flex items-center justify-between px-2 py-4'>
          <div className='text-sm text-muted-foreground'>
            Sayfa {currentPage} / {totalPages}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange((currentPage || 1) - 1)}
              disabled={!currentPage || currentPage <= 1}
            >
              <ChevronLeft className='h-4 w-4' />
              Önceki
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange((currentPage || 1) + 1)}
              disabled={!currentPage || currentPage >= totalPages}
            >
              Sonraki
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
