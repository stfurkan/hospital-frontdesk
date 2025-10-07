'use server';

import { db } from '@/lib/db';
import { payments, visits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';

export async function createPayment(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Oturum bulunamadı' };
  }

  const visitId = formData.get('visitId') as string;
  const amount = formData.get('amount') as string;
  const paymentMethod = formData.get('paymentMethod') as string;
  const notes = formData.get('notes') as string;

  if (!visitId || !amount || !paymentMethod) {
    return { error: 'Geliş, tutar ve ödeme yöntemi gereklidir' };
  }

  try {
    // Get visit to get patient ID
    const [visit] = await db
      .select()
      .from(visits)
      .where(eq(visits.id, parseInt(visitId)))
      .limit(1);

    if (!visit) {
      return { error: 'Geliş bulunamadı' };
    }

    await db.insert(payments).values({
      visitId: parseInt(visitId),
      patientId: visit.patientId,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod as
        | 'cash'
        | 'credit_card'
        | 'debit_card'
        | 'insurance',
      paymentDate: new Date(),
      notes: notes || null,
      createdBy: session.userId
    });

    revalidatePath('/payments');
    revalidatePath('/visits');
    return { success: true };
  } catch (error) {
    console.error('Create payment error:', error);
    return { error: 'Tahsilat eklenirken bir hata oluştu' };
  }
}
