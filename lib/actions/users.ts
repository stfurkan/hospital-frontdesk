'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth/session';
import { canManageUsers } from '@/lib/auth/permissions';

/**
 * Create a new user (admin only)
 */
export async function createUser(formData: FormData) {
  try {
    const session = await getSession();

    if (!canManageUsers(session)) {
      return { error: 'Bu işlemi yapmaya yetkiniz yok' };
    }

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as 'admin' | 'receptionist';

    // Validation
    if (!username || username.length < 3) {
      return { error: 'Kullanıcı adı en az 3 karakter olmalıdır' };
    }

    if (!password || password.length < 6) {
      return { error: 'Şifre en az 6 karakter olmalıdır' };
    }

    if (!fullName || fullName.length < 2) {
      return { error: 'Ad Soyad en az 2 karakter olmalıdır' };
    }

    if (!role || !['admin', 'receptionist'].includes(role)) {
      return { error: 'Geçerli bir rol seçiniz' };
    }

    // Check if username already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      return { error: 'Bu kullanıcı adı zaten kullanılıyor' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db.insert(users).values({
      username,
      password: hashedPassword,
      fullName,
      role
    });

    return { success: true };
  } catch (error) {
    console.error('Create user error:', error);
    return { error: 'Kullanıcı oluşturulurken bir hata oluştu' };
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    const session = await getSession();

    if (!canManageUsers(session)) {
      return { error: 'Bu işlemi yapmaya yetkiniz yok' };
    }

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(users.createdAt);

    return { users: allUsers };
  } catch (error) {
    console.error('Get all users error:', error);
    return { error: 'Kullanıcılar getirilirken bir hata oluştu' };
  }
}

/**
 * Toggle user active status (admin only)
 */
export async function toggleUserStatus(userId: number) {
  try {
    const session = await getSession();

    if (!canManageUsers(session)) {
      return { error: 'Bu işlemi yapmaya yetkiniz yok' };
    }

    // Don't allow deactivating self
    if (session?.userId === userId) {
      return { error: 'Kendi hesabınızı devre dışı bırakamazsınız' };
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { error: 'Kullanıcı bulunamadı' };
    }

    await db
      .update(users)
      .set({ isActive: !user.isActive })
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error('Toggle user status error:', error);
    return { error: 'Kullanıcı durumu güncellenirken bir hata oluştu' };
  }
}

/**
 * Change password (all authenticated users)
 */
export async function changePassword(formData: FormData) {
  try {
    const session = await getSession();

    if (!session) {
      return { error: 'Oturum açmanız gerekiyor' };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validation
    if (!currentPassword) {
      return { error: 'Mevcut şifrenizi giriniz' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { error: 'Yeni şifre en az 6 karakter olmalıdır' };
    }

    if (newPassword !== confirmPassword) {
      return { error: 'Yeni şifreler eşleşmiyor' };
    }

    if (currentPassword === newPassword) {
      return { error: 'Yeni şifre mevcut şifreden farklı olmalıdır' };
    }

    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return { error: 'Kullanıcı bulunamadı' };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return { error: 'Mevcut şifre yanlış' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, session.userId));

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'Şifre değiştirilirken bir hata oluştu' };
  }
}
