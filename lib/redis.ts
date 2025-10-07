import { Redis } from '@upstash/redis';

// Redis client for appointment locking (optional for local dev)
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

// Lock an appointment slot for a short time to prevent double booking
export async function lockAppointmentSlot(
  doctorId: number,
  appointmentDate: Date
): Promise<boolean> {
  if (!redis) {
    // If Redis is not configured, skip locking (for local development)
    return true;
  }

  const key = `appointment:${doctorId}:${appointmentDate.toISOString()}`;
  const lockDuration = 30; // 30 seconds

  try {
    // Try to set the key with NX (only if it doesn't exist) and EX (expiration)
    const result = await redis.set(key, 'locked', {
      nx: true,
      ex: lockDuration
    });
    return result === 'OK';
  } catch (error) {
    console.error('Redis lock error:', error);
    // If Redis fails, allow the operation to proceed
    return true;
  }
}

// Unlock an appointment slot
export async function unlockAppointmentSlot(
  doctorId: number,
  appointmentDate: Date
): Promise<void> {
  if (!redis) return;

  const key = `appointment:${doctorId}:${appointmentDate.toISOString()}`;

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis unlock error:', error);
  }
}

