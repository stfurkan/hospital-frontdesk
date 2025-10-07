import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { User } from '@/lib/db/schema';

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'default-secret-key-please-change'
);

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionPayload = {
  userId: number;
  username: string;
  role: string;
  expiresAt: Date;
};

export async function createSession(user: User) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const session = await new SignJWT({
    userId: user.id,
    username: user.username,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(SESSION_SECRET);

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/'
  });

  return session;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(session, SESSION_SECRET);
    return {
      userId: payload.userId as number,
      username: payload.username as string,
      role: payload.role as string,
      expiresAt: new Date((payload.exp as number) * 1000)
    };
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

