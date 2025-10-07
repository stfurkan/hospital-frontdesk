import { db } from '@/lib/db';
import { payments, visits, patients, visitServices } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PaymentsTable } from '@/components/payments/payments-table';
import { CreatePaymentDialog } from '@/components/payments/create-payment-dialog';

export default async function PaymentsPage() {
  // Get all payments with relations
  const allPayments = await db
    .select({
      payment: payments,
      patient: patients,
      visit: visits
    })
    .from(payments)
    .leftJoin(patients, eq(payments.patientId, patients.id))
    .leftJoin(visits, eq(payments.visitId, visits.id))
    .orderBy(desc(payments.paymentDate));

  // Get visits that need payment (have services but no/partial payment)
  const visitsWithServices = await db
    .select({
      visit: visits,
      patient: patients,
      totalServices: sql<number>`COALESCE(SUM(${visitServices.totalPrice}), 0)`,
      totalPayments: sql<number>`COALESCE((
        SELECT SUM(amount) FROM ${payments} WHERE visit_id = ${visits.id}
      ), 0)`
    })
    .from(visits)
    .leftJoin(patients, eq(visits.patientId, patients.id))
    .leftJoin(visitServices, eq(visitServices.visitId, visits.id))
    .groupBy(visits.id, patients.id)
    .orderBy(desc(visits.visitDate));

  // Filter visits that have pending payments
  const visitsNeedingPayment = visitsWithServices.filter(
    (v) => v.totalServices > v.totalPayments
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Tahsilatlar</h1>
          <p className='text-muted-foreground'>Hasta ödemelerini yönetin</p>
        </div>
        {visitsNeedingPayment.length > 0 && (
          <CreatePaymentDialog visits={visitsNeedingPayment}>
            <Button className='w-full sm:w-auto'>
              <Plus className='mr-2 h-4 w-4' />
              Yeni Tahsilat
            </Button>
          </CreatePaymentDialog>
        )}
      </div>

      {visitsNeedingPayment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ödeme Bekleyen Gelişler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {visitsNeedingPayment.map((item) => {
                const remaining = item.totalServices - item.totalPayments;
                return (
                  <div
                    key={item.visit.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex-1'>
                      <div className='font-medium'>
                        {item.patient
                          ? `${item.patient.firstName} ${item.patient.lastName}`
                          : 'Hasta bulunamadı'}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Toplam: ₺{item.totalServices.toFixed(2)} - Ödenen: ₺
                        {item.totalPayments.toFixed(2)} - Kalan: ₺
                        {remaining.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tüm Tahsilatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable payments={allPayments} />
        </CardContent>
      </Card>
    </div>
  );
}
