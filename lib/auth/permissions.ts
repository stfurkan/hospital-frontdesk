import { SessionPayload } from './session';

/**
 * Check if user has admin role
 */
export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === 'admin';
}

/**
 * Check if user can access departments management
 */
export function canManageDepartments(session: SessionPayload | null): boolean {
  return isAdmin(session);
}

/**
 * Check if user can access doctors management
 */
export function canManageDoctors(session: SessionPayload | null): boolean {
  return isAdmin(session);
}

/**
 * Check if user can access services management
 */
export function canManageServices(session: SessionPayload | null): boolean {
  return isAdmin(session);
}

/**
 * Check if user can access patients management
 */
export function canManagePatients(session: SessionPayload | null): boolean {
  return !!session; // All authenticated users
}

/**
 * Check if user can access appointments
 */
export function canManageAppointments(session: SessionPayload | null): boolean {
  return !!session; // All authenticated users
}

/**
 * Check if user can access visits
 */
export function canManageVisits(session: SessionPayload | null): boolean {
  return !!session; // All authenticated users
}

/**
 * Check if user can access payments
 */
export function canManagePayments(session: SessionPayload | null): boolean {
  return !!session; // All authenticated users
}

/**
 * Check if user can access patient lookup
 */
export function canAccessLookup(session: SessionPayload | null): boolean {
  return !!session; // All authenticated users
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(session: SessionPayload | null): boolean {
  return isAdmin(session);
}

/**
 * Check if user can change their own password
 */
export function canChangePassword(session: SessionPayload | null): boolean {
  return !!session; // All authenticated users can change their own password
}
