'use server';

import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import {
  validateTCKimlikNo,
  validateTurkishPhone,
  formatTurkishPhone
} from '@/lib/validation';

export async function createPatient(formData: FormData) {
  const nationalId = formData.get('nationalId') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;

  if (!nationalId || !firstName || !lastName || !phone) {
    return { error: 'T.C., ad, soyad ve telefon gereklidir' };
  }

  // Validate Turkish ID
  if (!validateTCKimlikNo(nationalId)) {
    return {
      error:
        'Geçersiz T.C. Kimlik No. Lütfen 11 haneli geçerli bir TC kimlik numarası girin.'
    };
  }

  // Check if TC Kimlik No already exists BEFORE attempting to insert
  const [existingPatient] = await db
    .select()
    .from(patients)
    .where(eq(patients.nationalId, nationalId))
    .limit(1);

  if (existingPatient) {
    return {
      error: `Bu T.C. Kimlik No zaten kayıtlı (${existingPatient.firstName} ${existingPatient.lastName})`
    };
  }

  // Validate phone number
  if (!validateTurkishPhone(phone)) {
    return {
      error:
        'Geçersiz telefon numarası. Türk cep telefonu gerekli (Örn: 0532 123 45 67)'
    };
  }

  // Validate name (only Turkish letters and spaces)
  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(firstName)) {
    return { error: 'İsim sadece Türkçe ve İngilizce harflerden oluşmalıdır' };
  }

  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(lastName)) {
    return {
      error: 'Soyisim sadece Türkçe ve İngilizce harflerden oluşmalıdır'
    };
  }

  try {
    // Format phone number before saving
    const formattedPhone = formatTurkishPhone(phone);

    await db.insert(patients).values({
      nationalId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: formattedPhone,
      address: address?.trim() || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
    });

    revalidatePath('/patients');
    return { success: true };
  } catch (error) {
    console.error('Create patient error:', error);
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('UNIQUE constraint')) {
      return { error: 'Bu hasta bilgileri ile bir kayıt zaten mevcut' };
    }
    return {
      error:
        'Hasta kaydı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
    };
  }
}

export async function updatePatient(id: number, formData: FormData) {
  const nationalId = formData.get('nationalId') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;

  if (!nationalId || !firstName || !lastName || !phone) {
    return { error: 'T.C., ad, soyad ve telefon gereklidir' };
  }

  // Validate Turkish ID
  if (!validateTCKimlikNo(nationalId)) {
    return {
      error:
        'Geçersiz T.C. Kimlik No. Lütfen 11 haneli geçerli bir TC kimlik numarası girin.'
    };
  }

  // Check if TC Kimlik No is being used by another patient
  const [existingPatient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.nationalId, nationalId), ne(patients.id, id)))
    .limit(1);

  if (existingPatient) {
    return {
      error: `Bu T.C. Kimlik No başka bir hasta tarafından kullanılıyor (${existingPatient.firstName} ${existingPatient.lastName})`
    };
  }

  // Validate phone number
  if (!validateTurkishPhone(phone)) {
    return {
      error:
        'Geçersiz telefon numarası. Türk cep telefonu gerekli (Örn: 0532 123 45 67)'
    };
  }

  // Validate name (only Turkish letters and spaces)
  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(firstName)) {
    return { error: 'İsim sadece Türkçe ve İngilizce harflerden oluşmalıdır' };
  }

  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(lastName)) {
    return {
      error: 'Soyisim sadece Türkçe ve İngilizce harflerden oluşmalıdır'
    };
  }

  try {
    // Format phone number before saving
    const formattedPhone = formatTurkishPhone(phone);

    await db
      .update(patients)
      .set({
        nationalId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: formattedPhone,
        address: address?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        updatedAt: new Date()
      })
      .where(eq(patients.id, id));

    revalidatePath('/patients');
    return { success: true };
  } catch (error) {
    console.error('Update patient error:', error);
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('UNIQUE constraint')) {
      return {
        error: 'Bu hasta bilgileri ile bir kayıt zaten mevcut'
      };
    }
    return {
      error: 'Hasta güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
    };
  }
}

export async function getPatientByNationalId(nationalId: string) {
  try {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.nationalId, nationalId))
      .limit(1);

    return patient || null;
  } catch (error) {
    console.error('Get patient by national ID error:', error);
    return null;
  }
}

export async function getRecentPatients(limit: number = 5) {
  try {
    const recentPatients = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        nationalId: patients.nationalId
      })
      .from(patients)
      .orderBy(desc(patients.createdAt))
      .limit(limit);

    return recentPatients;
  } catch (error) {
    console.error('Get recent patients error:', error);
    return [];
  }
}

export async function searchPatients(query: string, limit: number = 10) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();

    // Get all patients and filter in memory
    // This is necessary because SQLite doesn't support ILIKE or case-insensitive search easily
    const allPatients = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        nationalId: patients.nationalId
      })
      .from(patients);

    // Filter by search term
    const filtered = allPatients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const reverseName =
        `${patient.lastName} ${patient.firstName}`.toLowerCase();
      const nationalId = patient.nationalId.toLowerCase();

      return (
        fullName.includes(searchTerm) ||
        reverseName.includes(searchTerm) ||
        nationalId.includes(searchTerm) ||
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm)
      );
    });

    return filtered.slice(0, limit);
  } catch (error) {
    console.error('Search patients error:', error);
    return [];
  }
}
