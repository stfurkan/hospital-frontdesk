'use client';

import { Appointment, Patient, Doctor } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck } from 'lucide-react';
import { createVisit } from '@/lib/actions/visits';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type AppointmentWithRelations = {
  appointment: Appointment;
  patient: Patient | null;
  doctor: Doctor | null;
};

export function PendingAppointments({
  appointments
}: {
  appointments: AppointmentWithRelations[];
}) {
  const handleCheckIn = async (appointmentId: number) => {
    const result = await createVisit(appointmentId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Geliş kaydı oluşturuldu');
    }
  };

  if (appointments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bekleyen Randevular (Check-In)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {appointments.map(({ appointment, patient, doctor }) => (
            <div
              key={appointment.id}
              className='flex items-center justify-between p-3 border rounded-lg'
            >
              <div className='flex-1'>
                <div className='font-medium'>
                  {patient
                    ? `${patient.firstName} ${patient.lastName}`
                    : 'Hasta bulunamadı'}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {doctor?.fullName} -{' '}
                  {format(appointment.appointmentDate, 'dd MMMM yyyy HH:mm', {
                    locale: tr
                  })}
                </div>
              </div>
              <Button
                size='sm'
                onClick={() => handleCheckIn(appointment.id)}
                className='gap-2'
              >
                <ClipboardCheck className='h-4 w-4' />
                Geliş Kaydı Aç
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

