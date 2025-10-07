'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Kullanıcı adı ve şifre gereklidir' };
  }

  try {
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return { error: 'Kullanıcı adı veya şifre hatalı' };
    }

    // Check if user is active
    if (!user.isActive) {
      return { error: 'Bu hesap devre dışı bırakılmış' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { error: 'Kullanıcı adı veya şifre hatalı' };
    }

    // Create session
    await createSession(user);
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Giriş yapılırken bir hata oluştu' };
  }

  // Redirect after successful login
  redirect('/');
}

export async function logout() {
  const { deleteSession } = await import('@/lib/auth/session');
  await deleteSession();
  redirect('/login');
}
