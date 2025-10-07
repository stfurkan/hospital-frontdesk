import { z } from 'zod';

/**
 * Turkish TC Kimlik No (Turkish Identification Number) validator
 * Rules:
 * - Must be exactly 11 digits
 * - First digit cannot be 0
 * - 10th digit is calculated using odd and even positioned digits
 * - 11th digit is calculated using all first 10 digits
 */
export function validateTCKimlikNo(tcNo: string): boolean {
  if (!tcNo || tcNo.length !== 11) return false;

  const digits = tcNo.split('').map(Number);

  // First digit cannot be 0
  if (digits[0] === 0) return false;

  // Check if all characters are digits
  if (digits.some(isNaN)) return false;

  // Calculate 10th digit
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (oddSum * 7 - evenSum) % 10;

  if (digits[9] !== digit10) return false;

  // Calculate 11th digit
  const sum = digits.slice(0, 10).reduce((acc, val) => acc + val, 0);
  const digit11 = sum % 10;

  if (digits[10] !== digit11) return false;

  return true;
}

/**
 * Turkish phone number validator
 * Accepts formats:
 * - 05XX XXX XX XX
 * - 05XXXXXXXXX
 * - +905XXXXXXXXX
 * - 905XXXXXXXXX
 */
export function validateTurkishPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Check for Turkish mobile phone patterns
  const patterns = [
    /^05\d{9}$/, // 05XXXXXXXXX
    /^\+905\d{9}$/, // +905XXXXXXXXX
    /^905\d{9}$/ // 905XXXXXXXXX
  ];

  return patterns.some((pattern) => pattern.test(cleaned));
}

/**
 * Format phone number to Turkish standard (05XX XXX XX XX)
 */
export function formatTurkishPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');

  // Remove leading 90 if present
  let digits = cleaned;
  if (cleaned.startsWith('90')) {
    digits = cleaned.substring(2);
  }

  // Ensure it starts with 0
  if (!digits.startsWith('0')) {
    digits = '0' + digits;
  }

  // Format as 05XX XXX XX XX
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(
      7,
      9
    )} ${digits.slice(9, 11)}`;
  }

  return digits;
}

// Zod schemas for Turkish validation
export const tcKimlikNoSchema = z
  .string()
  .length(11, 'TC Kimlik No 11 haneli olmalıdır')
  .regex(/^\d+$/, 'TC Kimlik No sadece rakamlardan oluşmalıdır')
  .refine(validateTCKimlikNo, 'Geçersiz TC Kimlik No');

export const turkishPhoneSchema = z
  .string()
  .min(10, 'Telefon numarası en az 10 haneli olmalıdır')
  .refine(
    validateTurkishPhone,
    'Geçersiz telefon numarası formatı (Örn: 05XX XXX XX XX)'
  );

export const nameSchema = z
  .string()
  .min(2, 'İsim en az 2 karakter olmalıdır')
  .max(100, 'İsim en fazla 100 karakter olabilir')
  .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harflerden oluşmalıdır');

export const addressSchema = z
  .string()
  .min(10, 'Adres en az 10 karakter olmalıdır')
  .max(500, 'Adres en fazla 500 karakter olabilir');

