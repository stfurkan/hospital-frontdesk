'use server';

import { db } from '@/lib/db';
import { visits, appointments, visitServices, services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';

export async function createVisit(appointmentId: number) {
  const session = await getSession();
  if (!session) {
    return { error: 'Oturum bulunamadı' };
  }

  try {
    // Get the appointment
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      return { error: 'Randevu bulunamadı' };
    }

    if (appointment.status !== 'scheduled') {
      return { error: 'Bu randevu için geliş kaydı zaten oluşturulmuş' };
    }

    // Check if visit already exists
    const [existingVisit] = await db
      .select()
      .from(visits)
      .where(eq(visits.appointmentId, appointmentId))
      .limit(1);

    if (existingVisit) {
      return { error: 'Bu randevu için zaten geliş kaydı mevcut' };
    }

    // Create the visit
    await db.insert(visits).values({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      visitDate: new Date(),
      status: 'checked_in',
      createdBy: session.userId
    });

    // Update appointment status
    await db
      .update(appointments)
      .set({
        status: 'completed',
        updatedAt: new Date()
      })
      .where(eq(appointments.id, appointmentId));

    revalidatePath('/visits');
    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error('Create visit error:', error);
    return { error: 'Geliş kaydı oluşturulurken bir hata oluştu' };
  }
}

export async function addServiceToVisit(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Oturum bulunamadı' };
  }

  const visitId = formData.get('visitId') as string;
  const serviceId = formData.get('serviceId') as string;
  const quantity = formData.get('quantity') as string;

  if (!visitId || !serviceId || !quantity) {
    return { error: 'Tüm alanlar gereklidir' };
  }

  try {
    // Get the service price
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, parseInt(serviceId)))
      .limit(1);

    if (!service) {
      return { error: 'Hizmet bulunamadı' };
    }

    const qty = parseInt(quantity);
    const totalPrice = service.price * qty;

    // Add service to visit
    await db.insert(visitServices).values({
      visitId: parseInt(visitId),
      serviceId: parseInt(serviceId),
      quantity: qty,
      unitPrice: service.price,
      totalPrice,
      createdBy: session.userId
    });

    revalidatePath('/visits');
    return { success: true };
  } catch (error) {
    console.error('Add service to visit error:', error);
    return { error: 'Hizmet eklenirken bir hata oluştu' };
  }
}

export async function removeServiceFromVisit(visitServiceId: number) {
  try {
    await db.delete(visitServices).where(eq(visitServices.id, visitServiceId));

    revalidatePath('/visits');
    return { success: true };
  } catch (error) {
    console.error('Remove service from visit error:', error);
    return { error: 'Hizmet silinirken bir hata oluştu' };
  }
}

export async function completeVisit(visitId: number) {
  try {
    await db
      .update(visits)
      .set({
        status: 'completed',
        updatedAt: new Date()
      })
      .where(eq(visits.id, visitId));

    revalidatePath('/visits');
    return { success: true };
  } catch (error) {
    console.error('Complete visit error:', error);
    return { error: 'Geliş tamamlanırken bir hata oluştu' };
  }
}
