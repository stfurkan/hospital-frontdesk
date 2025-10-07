import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServicesTable } from '@/components/services/services-table';
import { CreateServiceDialog } from '@/components/services/create-service-dialog';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { canManageServices } from '@/lib/auth/permissions';

export default async function ServicesPage() {
  const session = await getSession();

  if (!canManageServices(session)) {
    redirect('/');
  }
  const allServices = await db
    .select()
    .from(services)
    .orderBy(desc(services.createdAt));

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Hizmetler</h1>
          <p className='text-muted-foreground'>Muayene hizmetlerini yönetin</p>
        </div>
        <CreateServiceDialog>
          <Button className='w-full sm:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Yeni Hizmet
          </Button>
        </CreateServiceDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Hizmetler</CardTitle>
        </CardHeader>
        <CardContent>
          <ServicesTable services={allServices} />
        </CardContent>
      </Card>
    </div>
  );
}
