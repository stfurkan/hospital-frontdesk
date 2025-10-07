import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, UserCog, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { departments, doctors, patients, appointments } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export default async function DashboardPage() {
  const [departmentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(departments)
    .where(eq(departments.isActive, true));

  const [doctorCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(doctors)
    .where(eq(doctors.isActive, true));

  const [patientCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patients)
    .where(eq(patients.isActive, true));

  const [appointmentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(eq(appointments.status, 'scheduled'));

  const stats = [
    {
      title: 'Aktif Bölümler',
      value: departmentCount.count,
      icon: Building2,
      href: '/departments'
    },
    {
      title: 'Aktif Doktorlar',
      value: doctorCount.count,
      icon: UserCog,
      href: '/doctors'
    },
    {
      title: 'Kayıtlı Hastalar',
      value: patientCount.count,
      icon: Users,
      href: '/patients'
    },
    {
      title: 'Bekleyen Randevular',
      value: appointmentCount.count,
      icon: Calendar,
      href: '/appointments'
    }
  ];

  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-indigo-500 to-purple-600',
    'from-purple-500 to-pink-600',
    'from-pink-500 to-rose-600'
  ];

  return (
    <div className='space-y-8'>
      <div className='bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
          Hoş Geldiniz
        </h1>
        <p className='text-blue-600 dark:text-blue-400 mt-2 text-lg'>
          Hastane ön büro yönetim sistemi
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className='hover:scale-105 transition-all duration-200 cursor-pointer border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden group'>
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[index]} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}
                ></div>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-semibold text-blue-700 dark:text-blue-300'>
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-md`}
                  >
                    <Icon className='h-5 w-5 text-white' />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
