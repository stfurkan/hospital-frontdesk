import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { desc, or, like, count, and } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PatientsTable } from '@/components/patients/patients-table';
import { CreatePatientDialog } from '@/components/patients/create-patient-dialog';
import { PatientSearch } from '@/components/patients/patient-search';

const ITEMS_PER_PAGE = 10;

export default async function PatientsPage({
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
    // Split search query by spaces to handle "firstName lastName" searches
    const searchTerms = searchQuery
      .split(/\s+/)
      .filter((term) => term.length > 0);

    if (searchTerms.length === 1) {
      // Single term: search in firstName, lastName, nationalId, or phone
      const term = searchTerms[0];
      whereClause = or(
        like(patients.firstName, `%${term}%`),
        like(patients.lastName, `%${term}%`),
        like(patients.nationalId, `%${term}%`),
        like(patients.phone, `%${term}%`)
      );
    } else if (searchTerms.length === 2) {
      // Two terms: could be "firstName lastName" or "lastName firstName"
      const [term1, term2] = searchTerms;
      whereClause = or(
        // firstName matches term1 AND lastName matches term2
        and(
          like(patients.firstName, `%${term1}%`),
          like(patients.lastName, `%${term2}%`)
        ),
        // firstName matches term2 AND lastName matches term1 (reversed)
        and(
          like(patients.firstName, `%${term2}%`),
          like(patients.lastName, `%${term1}%`)
        ),
        // Either term in nationalId or phone
        like(patients.nationalId, `%${term1}%`),
        like(patients.nationalId, `%${term2}%`),
        like(patients.phone, `%${term1}%`),
        like(patients.phone, `%${term2}%`)
      );
    } else {
      // More than 2 terms: search each term in any field
      whereClause = or(
        ...searchTerms.flatMap((term) => [
          like(patients.firstName, `%${term}%`),
          like(patients.lastName, `%${term}%`),
          like(patients.nationalId, `%${term}%`),
          like(patients.phone, `%${term}%`)
        ])
      );
    }
  }

  // Get total count
  const [{ value: totalCount }] = await db
    .select({ value: count() })
    .from(patients)
    .where(whereClause);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get patients for current page
  const allPatients = await db
    .select()
    .from(patients)
    .where(whereClause)
    .orderBy(desc(patients.createdAt))
    .limit(ITEMS_PER_PAGE)
    .offset(offset);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Hastalar</h1>
          <p className='text-muted-foreground'>
            Hasta kayıtlarını yönetin ({totalCount} kayıt)
          </p>
        </div>
        <CreatePatientDialog>
          <Button className='w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Yeni Hasta
          </Button>
        </CreatePatientDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Hastalar</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <PatientSearch />
          <PatientsTable
            patients={allPatients}
            currentPage={page}
            totalPages={totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
