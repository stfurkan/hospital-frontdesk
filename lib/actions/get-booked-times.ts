'use server';

import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { format } from 'date-fns';

export async function getBookedTimes(doctorId: number, date: string) {
  try {
    // Parse the date string to get start and end of day
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all appointments for this doctor on this date
    const bookedAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          sql`${appointments.appointmentDate} >= ${
            startOfDay.getTime() / 1000
          }`,
          sql`${appointments.appointmentDate} <= ${endOfDay.getTime() / 1000}`,
          sql`${appointments.status} != 'cancelled'` // Exclude cancelled appointments
        )
      );

    // Extract time strings from appointments (HH:mm format)
    const bookedTimes = bookedAppointments.map((apt) => {
      return format(apt.appointmentDate, 'HH:mm');
    });

    return bookedTimes;
  } catch (error) {
    console.error('Error getting booked times:', error);
    return [];
  }
}

