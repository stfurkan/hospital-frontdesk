'use server';

import { db } from '@/lib/db';
import { doctorAvailability } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { WORKING_HOURS } from '@/lib/datetime';

export async function setDoctorAvailability(formData: FormData) {
  const doctorId = formData.get('doctorId') as string;
  const dayOfWeek = formData.get('dayOfWeek') as string;
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;
  const isAvailable = formData.get('isAvailable') === 'true';

  if (!doctorId || !dayOfWeek || !startTime || !endTime) {
    return { error: 'Tüm alanlar doldurulmalıdır' };
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return { error: 'Geçersiz saat formatı (HH:mm)' };
  }

  // Validate that end time is after start time
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    return { error: 'Bitiş saati başlangıç saatinden sonra olmalıdır' };
  }

  try {
    const day = parseInt(dayOfWeek);
    const docId = parseInt(doctorId);

    // Check if availability record exists
    const [existing] = await db
      .select()
      .from(doctorAvailability)
      .where(
        and(
          eq(doctorAvailability.doctorId, docId),
          eq(doctorAvailability.dayOfWeek, day)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing record
      await db
        .update(doctorAvailability)
        .set({
          startTime,
          endTime,
          isAvailable,
          updatedAt: new Date()
        })
        .where(eq(doctorAvailability.id, existing.id));
    } else {
      // Create new record
      await db.insert(doctorAvailability).values({
        doctorId: docId,
        dayOfWeek: day,
        startTime,
        endTime,
        isAvailable
      });
    }

    revalidatePath('/doctors');
    return { success: true };
  } catch (error) {
    console.error('Set doctor availability error:', error);
    return { error: 'Müsaitlik kaydedilirken bir hata oluştu' };
  }
}

export async function getDoctorAvailability(doctorId: number) {
  try {
    const availability = await db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.doctorId, doctorId));

    // If no availability is set, return default (Monday-Friday, 9am-5pm, available)
    if (availability.length === 0) {
      const defaultAvailability = Array.from({ length: 5 }, (_, i) => ({
        id: 0,
        doctorId,
        dayOfWeek: i + 1, // Monday = 1, Friday = 5
        startTime: WORKING_HOURS.START,
        endTime: WORKING_HOURS.END,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      return { availability: defaultAvailability };
    }

    return { availability };
  } catch (error) {
    console.error('Get doctor availability error:', error);
    return { availability: [] };
  }
}

export async function initializeDefaultAvailability(doctorId: number) {
  try {
    // Check if doctor already has availability records
    const existing = await db
      .select()
      .from(doctorAvailability)
      .where(eq(doctorAvailability.doctorId, doctorId))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, message: 'Availability already exists' };
    }

    // Create default availability for Monday-Friday
    const defaultAvailability = Array.from({ length: 5 }, (_, i) => ({
      doctorId,
      dayOfWeek: i + 1, // Monday = 1, Friday = 5
      startTime: WORKING_HOURS.START,
      endTime: WORKING_HOURS.END,
      isAvailable: true
    }));

    await db.insert(doctorAvailability).values(defaultAvailability);

    revalidatePath('/doctors');
    return { success: true };
  } catch (error) {
    console.error('Initialize default availability error:', error);
    return { error: 'Varsayılan müsaitlik oluşturulurken bir hata oluştu' };
  }
}
