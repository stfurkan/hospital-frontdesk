import { db } from '@/lib/db';
import {
  visits,
  patients,
  doctors,
  appointments,
  visitServices,
  services
} from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitsTable } from '@/components/visits/visits-table';
import { PendingAppointments } from '@/components/visits/pending-appointments';

export default async function VisitsPage() {
  // Get all visits with relations
  const allVisits = await db
    .select({
      visit: visits,
      patient: patients,
      doctor: doctors
    })
    .from(visits)
    .leftJoin(patients, eq(visits.patientId, patients.id))
    .leftJoin(doctors, eq(visits.doctorId, doctors.id))
    .orderBy(desc(visits.visitDate));

  // Get visit services for each visit
  const visitServicesData = await db
    .select({
      visitService: visitServices,
      service: services
    })
    .from(visitServices)
    .leftJoin(services, eq(visitServices.serviceId, services.id));

  // Get scheduled appointments (pending check-in)
  const scheduledAppointments = await db
    .select({
      appointment: appointments,
      patient: patients,
      doctor: doctors
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(eq(appointments.status, 'scheduled'))
    .orderBy(appointments.appointmentDate);

  // Get active services
  const activeServices = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(services.name);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Gelişler</h1>
        <p className='text-muted-foreground'>
          Hasta gelişlerini ve hizmetleri yönetin
        </p>
      </div>

      <PendingAppointments appointments={scheduledAppointments} />

      <Card>
        <CardHeader>
          <CardTitle>Tüm Gelişler</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitsTable
            visits={allVisits}
            visitServices={visitServicesData}
            services={activeServices}
          />
        </CardContent>
      </Card>
    </div>
  );
}

