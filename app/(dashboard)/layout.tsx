import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard-nav';
import { Toaster } from '@/components/ui/sonner';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950'>
      <DashboardNav session={session} />
      <main className='container mx-auto p-6'>{children}</main>
      <Toaster richColors position='top-right' />
    </div>
  );
}
