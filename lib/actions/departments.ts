'use server';

import { db } from '@/lib/db';
import { departments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createDepartment(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    return { error: 'Bölüm adı gereklidir' };
  }

  try {
    await db.insert(departments).values({
      name,
      description: description || null
    });

    revalidatePath('/departments');
    return { success: true };
  } catch (error) {
    console.error('Create department error:', error);
    return { error: 'Bölüm oluşturulurken bir hata oluştu' };
  }
}

export async function updateDepartment(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    return { error: 'Bölüm adı gereklidir' };
  }

  try {
    await db
      .update(departments)
      .set({
        name,
        description: description || null,
        updatedAt: new Date()
      })
      .where(eq(departments.id, id));

    revalidatePath('/departments');
    return { success: true };
  } catch (error) {
    console.error('Update department error:', error);
    return { error: 'Bölüm güncellenirken bir hata oluştu' };
  }
}

export async function toggleDepartmentStatus(id: number, isActive: boolean) {
  try {
    await db
      .update(departments)
      .set({
        isActive: !isActive,
        updatedAt: new Date()
      })
      .where(eq(departments.id, id));

    revalidatePath('/departments');
    return { success: true };
  } catch (error) {
    console.error('Toggle department status error:', error);
    return { error: 'Bölüm durumu değiştirilirken bir hata oluştu' };
  }
}

