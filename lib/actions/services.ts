'use server';

import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createService(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;

  if (!name || !price) {
    return { error: 'Hizmet adı ve fiyat gereklidir' };
  }

  try {
    await db.insert(services).values({
      name,
      description: description || null,
      price: parseFloat(price)
    });

    revalidatePath('/services');
    return { success: true };
  } catch (error) {
    console.error('Create service error:', error);
    return { error: 'Hizmet oluşturulurken bir hata oluştu' };
  }
}

export async function updateService(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;

  if (!name || !price) {
    return { error: 'Hizmet adı ve fiyat gereklidir' };
  }

  try {
    await db
      .update(services)
      .set({
        name,
        description: description || null,
        price: parseFloat(price),
        updatedAt: new Date()
      })
      .where(eq(services.id, id));

    revalidatePath('/services');
    return { success: true };
  } catch (error) {
    console.error('Update service error:', error);
    return { error: 'Hizmet güncellenirken bir hata oluştu' };
  }
}

export async function toggleServiceStatus(id: number, isActive: boolean) {
  try {
    await db
      .update(services)
      .set({
        isActive: !isActive,
        updatedAt: new Date()
      })
      .where(eq(services.id, id));

    revalidatePath('/services');
    return { success: true };
  } catch (error) {
    console.error('Toggle service status error:', error);
    return { error: 'Hizmet durumu değiştirilirken bir hata oluştu' };
  }
}

