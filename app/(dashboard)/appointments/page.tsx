import { db } from '@/lib/db';
import { appointments, patients, doctors, departments } from '@/lib/db/schema';
import { desc, eq, or, like, count, and, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AppointmentsTable } from '@/components/appointments/appointments-table';
import { CreateAppointmentDialog } from '@/components/appointments/create-appointment-dialog';
import { AppointmentSearch } from '@/components/appointments/appointment-search';

const ITEMS_PER_PAGE = 10;

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const searchQuery = (params.search || '').trim();
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause for search with improved logic
  let whereClause;
  if (searchQuery) {
    const terms = searchQuery.split(/\s+/).filter((term) => term.length > 0);

    if (terms.length === 1) {
      // Single term: search across all fields
      whereClause = or(
        like(patients.firstName, `%${terms[0]}%`),
        like(patients.lastName, `%${terms[0]}%`),
        like(patients.nationalId, `%${terms[0]}%`),
        like(doctors.fullName, `%${terms[0]}%`),
        like(departments.name, `%${terms[0]}%`)
      );
    } else if (terms.length === 2) {
      // Two terms: could be "firstName lastName" or "lastName firstName"
      whereClause = or(
        // firstName lastName
        and(
          like(patients.firstName, `%${terms[0]}%`),
          like(patients.lastName, `%${terms[1]}%`)
        ),
        // lastName firstName (reversed)
        and(
          like(patients.firstName, `%${terms[1]}%`),
          like(patients.lastName, `%${terms[0]}%`)
        ),
        // Also search other fields
        like(patients.nationalId, `%${searchQuery}%`),
        like(doctors.fullName, `%${searchQuery}%`),
        like(departments.name, `%${searchQuery}%`)
      );
    } else {
      // Multiple terms: search all fields with full query
      whereClause = or(
        sql`${patients.firstName} || ' ' || ${
          patients.lastName
        } LIKE ${`%${searchQuery}%`}`,
        like(patients.nationalId, `%${searchQuery}%`),
        like(doctors.fullName, `%${searchQuery}%`),
        like(departments.name, `%${searchQuery}%`)
      );
    }
  }

  // Get total count
  const totalCountResult = await db
    .select({ count: count() })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(departments, eq(appointments.departmentId, departments.id))
    .where(whereClause);

  const totalCount = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get paginated appointments
  const allAppointments = await db
    .select({
      appointment: appointments,
      patient: patients,
      doctor: doctors,
      department: departments
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(departments, eq(appointments.departmentId, departments.id))
    .where(whereClause)
    .orderBy(desc(appointments.appointmentDate))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  const activeDoctors = await db
    .select({
      doctor: doctors,
      department: departments
    })
    .from(doctors)
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(eq(doctors.isActive, true))
    .orderBy(doctors.fullName);

  const activeDepartments = await db
    .select()
    .from(departments)
    .where(eq(departments.isActive, true))
    .orderBy(departments.name);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Randevular</h1>
          <p className='text-muted-foreground'>Hasta randevularını yönetin</p>
        </div>
        <CreateAppointmentDialog
          doctors={activeDoctors}
          departments={activeDepartments}
        >
          <Button className='w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Yeni Randevu
          </Button>
        </CreateAppointmentDialog>
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <CardTitle>Tüm Randevular</CardTitle>
            <AppointmentSearch />
          </div>
        </CardHeader>
        <CardContent>
          <AppointmentsTable
            appointments={allAppointments}
            currentPage={page}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
