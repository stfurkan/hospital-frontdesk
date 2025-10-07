'use server';

import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { lockAppointmentSlot, unlockAppointmentSlot } from '@/lib/redis';
import {
  getTurkeyTime,
  toTurkeyDate,
  isWorkday,
  WORKING_HOURS
} from '@/lib/datetime';
import { getSession } from '@/lib/auth/session';

export async function createAppointment(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Oturum bulunamadı' };
  }

  const patientId = formData.get('patientId') as string;
  const doctorId = formData.get('doctorId') as string;
  const departmentId = formData.get('departmentId') as string;
  const appointmentDate = formData.get('appointmentDate') as string;
  const appointmentTime = formData.get('appointmentTime') as string;
  const notes = formData.get('notes') as string;

  if (
    !patientId ||
    !doctorId ||
    !departmentId ||
    !appointmentDate ||
    !appointmentTime
  ) {
    return { error: 'Tüm zorunlu alanlar doldurulmalıdır' };
  }

  // Combine date and time and convert to Turkey timezone
  const appointmentDateTime = new Date(
    `${appointmentDate}T${appointmentTime}:00`
  );
  const turkeyDateTime = toTurkeyDate(appointmentDateTime);

  // Check if the appointment is in the past (Turkey time)
  const now = getTurkeyTime();
  if (turkeyDateTime <= now) {
    return { error: 'Geçmiş tarihli randevu oluşturamazsınız' };
  }

  // Check if the date is a workday (Monday-Friday)
  if (!isWorkday(turkeyDateTime)) {
    return { error: 'Randevu sadece hafta içi günler için oluşturulabilir' };
  }

  // Validate time is in 15-minute intervals
  const minutes = turkeyDateTime.getMinutes();
  if (minutes % 15 !== 0) {
    return { error: 'Randevu saatleri 15 dakika aralıklarla olmalıdır' };
  }

  // Validate time is within working hours (9:00-17:00)
  const timeStr = appointmentTime;
  const [hours] = timeStr.split(':').map(Number);
  const [startHour] = WORKING_HOURS.START.split(':').map(Number);
  const [endHour] = WORKING_HOURS.END.split(':').map(Number);

  if (hours < startHour || hours >= endHour) {
    return {
      error: `Randevu saatleri ${WORKING_HOURS.START}-${WORKING_HOURS.END} arasında olmalıdır`
    };
  }

  // Try to lock the appointment slot
  const locked = await lockAppointmentSlot(
    parseInt(doctorId),
    appointmentDateTime
  );

  if (!locked) {
    return { error: 'Bu saat için randevu dolu, lütfen başka bir saat seçin' };
  }

  try {
    // Check if there's already an appointment for this doctor at this time
    const [existingAppointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, parseInt(doctorId)),
          eq(appointments.appointmentDate, appointmentDateTime),
          eq(appointments.status, 'scheduled')
        )
      )
      .limit(1);

    if (existingAppointment) {
      await unlockAppointmentSlot(parseInt(doctorId), appointmentDateTime);
      return { error: 'Bu doktorun seçilen saatte randevusu bulunmaktadır' };
    }

    // Create the appointment
    await db.insert(appointments).values({
      patientId: parseInt(patientId),
      doctorId: parseInt(doctorId),
      departmentId: parseInt(departmentId),
      appointmentDate: appointmentDateTime,
      notes: notes || null,
      status: 'scheduled',
      createdBy: session.userId
    });

    // Unlock after successful creation
    await unlockAppointmentSlot(parseInt(doctorId), appointmentDateTime);

    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error('Create appointment error:', error);
    await unlockAppointmentSlot(parseInt(doctorId), appointmentDateTime);
    return { error: 'Randevu oluşturulurken bir hata oluştu' };
  }
}

export async function cancelAppointment(id: number) {
  try {
    await db
      .update(appointments)
      .set({
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(appointments.id, id));

    revalidatePath('/appointments');
    return { success: true };
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return { error: 'Randevu iptal edilirken bir hata oluştu' };
  }
}
