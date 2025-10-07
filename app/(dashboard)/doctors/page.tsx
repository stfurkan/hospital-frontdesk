import { db } from '@/lib/db';
import { doctors, departments } from '@/lib/db/schema';
import { desc, eq, or, like, count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DoctorsTable } from '@/components/doctors/doctors-table';
import { CreateDoctorDialog } from '@/components/doctors/create-doctor-dialog';
import { DoctorSearch } from '@/components/doctors/doctor-search';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { canManageDoctors } from '@/lib/auth/permissions';

const ITEMS_PER_PAGE = 10;

export default async function DoctorsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const session = await getSession();

  if (!canManageDoctors(session)) {
    redirect('/');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const searchQuery = (params.search || '').trim();
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause for search
  let whereClause;
  if (searchQuery) {
    whereClause = or(
      like(doctors.fullName, `%${searchQuery}%`),
      like(departments.name, `%${searchQuery}%`)
    );
  }

  // Get total count
  const totalCountResult = await db
    .select({ count: count() })
    .from(doctors)
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(whereClause);

  const totalCount = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get paginated doctors
  const allDoctors = await db
    .select({
      doctor: doctors,
      department: departments
    })
    .from(doctors)
    .leftJoin(departments, eq(doctors.departmentId, departments.id))
    .where(whereClause)
    .orderBy(desc(doctors.createdAt))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  const activeDepartments = await db
    .select()
    .from(departments)
    .where(eq(departments.isActive, true))
    .orderBy(departments.name);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Doktorlar</h1>
          <p className='text-muted-foreground'>Hastane doktorlarını yönetin</p>
        </div>
        <CreateDoctorDialog departments={activeDepartments}>
          <Button className='w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Yeni Doktor
          </Button>
        </CreateDoctorDialog>
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <CardTitle>Tüm Doktorlar</CardTitle>
            <DoctorSearch />
          </div>
        </CardHeader>
        <CardContent>
          <DoctorsTable
            doctors={allDoctors}
            departments={activeDepartments}
            currentPage={page}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
