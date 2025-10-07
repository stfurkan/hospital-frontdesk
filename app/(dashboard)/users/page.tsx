import { getSession } from '@/lib/auth/session';
import { canManageUsers } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/lib/actions/users';
import { CreateUserDialog } from '@/components/users/create-user-dialog';
import { UsersTable } from '@/components/users/users-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function UsersPage() {
  const session = await getSession();

  if (!canManageUsers(session)) {
    redirect('/');
  }

  const result = await getAllUsers();

  if ('error' in result) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center text-destructive'>{result.error}</div>
      </div>
    );
  }

  return (
    <main className='container mx-auto p-6'>
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold'>Kullanıcı Yönetimi</h1>
            <p className='text-muted-foreground'>
              Sistem kullanıcılarını yönetin
            </p>
          </div>
          <CreateUserDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tüm Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersTable users={result.users} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
