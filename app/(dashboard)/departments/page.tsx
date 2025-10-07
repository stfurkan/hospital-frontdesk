import { db } from '@/lib/db';
import { departments } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DepartmentsTable } from '@/components/departments/departments-table';
import { CreateDepartmentDialog } from '@/components/departments/create-department-dialog';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { canManageDepartments } from '@/lib/auth/permissions';

export default async function DepartmentsPage() {
  const session = await getSession();

  if (!canManageDepartments(session)) {
    redirect('/');
  }
  const allDepartments = await db
    .select()
    .from(departments)
    .orderBy(desc(departments.createdAt));

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Bölümler</h1>
          <p className='text-muted-foreground'>Hastane bölümlerini yönetin</p>
        </div>
        <CreateDepartmentDialog>
          <Button className='w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Yeni Bölüm
          </Button>
        </CreateDepartmentDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Bölümler</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentsTable departments={allDepartments} />
        </CardContent>
      </Card>
    </div>
  );
}
