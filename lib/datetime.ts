/**
 * Date and time utilities for Turkey timezone (Europe/Istanbul)
 */

// Turkey timezone
export const TURKEY_TZ = 'Europe/Istanbul';

/**
 * Get current date/time in Turkey timezone
 */
export function getTurkeyTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TURKEY_TZ }));
}

/**
 * Format date to Turkey locale
 */
export function formatTurkeyDate(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: TURKEY_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(date);
}

/**
 * Format time to Turkey locale
 */
export function formatTurkeyTime(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: TURKEY_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

/**
 * Format date and time to Turkey locale
 */
export function formatTurkeyDateTime(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: TURKEY_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

/**
 * Convert date to Turkey timezone Date object
 */
export function toTurkeyDate(date: Date | string | number): Date {
  const d = new Date(date);
  return new Date(d.toLocaleString('en-US', { timeZone: TURKEY_TZ }));
}

/**
 * Working hours configuration
 */
export const WORKING_HOURS = {
  START: '09:00',
  END: '17:00',
  SLOT_DURATION: 15 // minutes
};

/**
 * Generate 15-minute time slots between start and end time
 * @param startTime Format: "HH:mm" (e.g., "09:00")
 * @param endTime Format: "HH:mm" (e.g., "17:00")
 * @returns Array of time slots in "HH:mm" format
 */
export function generateTimeSlots(
  startTime: string = WORKING_HOURS.START,
  endTime: string = WORKING_HOURS.END
): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(
      `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`
    );
    currentMinutes += WORKING_HOURS.SLOT_DURATION;
  }

  return slots;
}

/**
 * Check if a time slot is available
 * @param date The date to check
 * @param time Time slot in "HH:mm" format
 * @param existingAppointments Array of existing appointment times
 */
export function isSlotAvailable(
  date: Date,
  time: string,
  existingAppointments: Date[]
): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes, 0, 0);

  // Check if slot is in the past
  const now = getTurkeyTime();
  if (slotDate <= now) {
    return false;
  }

  // Check if slot conflicts with existing appointments
  return !existingAppointments.some((apt) => {
    const aptTime = new Date(apt);
    return Math.abs(slotDate.getTime() - aptTime.getTime()) < 15 * 60 * 1000; // Within 15 minutes
  });
}

/**
 * Get day of week in Turkish
 */
export function getTurkishDayName(dayIndex: number): string {
  const days = [
    'Pazar',
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi'
  ];
  return days[dayIndex] || '';
}

/**
 * Check if a date is a workday (Monday-Friday)
 */
export function isWorkday(date: Date): boolean {
  const turkeyDate = toTurkeyDate(date);
  const day = turkeyDate.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
}

/**
 * Get next available workday
 */
export function getNextWorkday(date: Date = new Date()): Date {
  const turkeyDate = toTurkeyDate(date);
  // eslint-disable-next-line prefer-const
  let nextDate = new Date(turkeyDate);
  nextDate.setDate(nextDate.getDate() + 1);

  while (!isWorkday(nextDate)) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}

/**
 * Format date for input[type="date"]
 */
export function formatDateForInput(date: Date): string {
  const turkeyDate = toTurkeyDate(date);
  const year = turkeyDate.getFullYear();
  const month = String(turkeyDate.getMonth() + 1).padStart(2, '0');
  const day = String(turkeyDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get minimum date for appointment (next workday)
 */
export function getMinAppointmentDate(): string {
  return formatDateForInput(getNextWorkday());
}
