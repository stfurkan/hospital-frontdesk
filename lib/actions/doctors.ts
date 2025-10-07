'use server';

import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createDoctor(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const departmentId = formData.get('departmentId') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;

  if (!fullName || !departmentId) {
    return { error: 'Doktor adı ve bölüm gereklidir' };
  }

  try {
    await db.insert(doctors).values({
      fullName,
      departmentId: parseInt(departmentId),
      phone: phone || null,
      email: email || null
    });

    revalidatePath('/doctors');
    return { success: true };
  } catch (error) {
    console.error('Create doctor error:', error);
    return { error: 'Doktor oluşturulurken bir hata oluştu' };
  }
}

export async function updateDoctor(id: number, formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const departmentId = formData.get('departmentId') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;

  if (!fullName || !departmentId) {
    return { error: 'Doktor adı ve bölüm gereklidir' };
  }

  try {
    await db
      .update(doctors)
      .set({
        fullName,
        departmentId: parseInt(departmentId),
        phone: phone || null,
        email: email || null,
        updatedAt: new Date()
      })
      .where(eq(doctors.id, id));

    revalidatePath('/doctors');
    return { success: true };
  } catch (error) {
    console.error('Update doctor error:', error);
    return { error: 'Doktor güncellenirken bir hata oluştu' };
  }
}

export async function toggleDoctorStatus(id: number, isActive: boolean) {
  try {
    await db
      .update(doctors)
      .set({
        isActive: !isActive,
        updatedAt: new Date()
      })
      .where(eq(doctors.id, id));

    revalidatePath('/doctors');
    return { success: true };
  } catch (error) {
    console.error('Toggle doctor status error:', error);
    return { error: 'Doktor durumu değiştirilirken bir hata oluştu' };
  }
}

