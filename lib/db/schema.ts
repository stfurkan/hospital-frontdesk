import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

// Users table (staff/admin)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(), // hashed with bcrypt
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['admin', 'receptionist'] })
    .notNull()
    .default('receptionist'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Departments table (Bölümler)
export const departments = sqliteTable('departments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Doctors table (Doktorlar)
export const doctors = sqliteTable('doctors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fullName: text('full_name').notNull(),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.id),
  phone: text('phone'),
  email: text('email'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Patients table (Hastalar)
export const patients = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nationalId: text('national_id').notNull().unique(), // T.C. Kimlik No
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Doctor Availability table (Doktor Müsaitlik Durumu)
export const doctorAvailability = sqliteTable('doctor_availability', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  doctorId: integer('doctor_id')
    .notNull()
    .references(() => doctors.id),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: text('start_time').notNull(), // HH:mm format (e.g., "09:00")
  endTime: text('end_time').notNull(), // HH:mm format (e.g., "17:00")
  isAvailable: integer('is_available', { mode: 'boolean' })
    .notNull()
    .default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Appointments table (Randevular)
export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id')
    .notNull()
    .references(() => patients.id),
  doctorId: integer('doctor_id')
    .notNull()
    .references(() => doctors.id),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.id),
  appointmentDate: integer('appointment_date', { mode: 'timestamp' }).notNull(),
  status: text('status', {
    enum: ['scheduled', 'completed', 'cancelled', 'no_show']
  })
    .notNull()
    .default('scheduled'),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Visits table (Gelişler - when patient arrives for appointment)
export const visits = sqliteTable('visits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  appointmentId: integer('appointment_id')
    .notNull()
    .references(() => appointments.id),
  patientId: integer('patient_id')
    .notNull()
    .references(() => patients.id),
  doctorId: integer('doctor_id')
    .notNull()
    .references(() => doctors.id),
  visitDate: integer('visit_date', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['checked_in', 'in_progress', 'completed'] })
    .notNull()
    .default('checked_in'),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Services table (Hizmetler - muayene hizmetleri)
export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  price: real('price').notNull(), // Fiyat bilgisi
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Visit Services table (Gelişe eklenen hizmetler)
export const visitServices = sqliteTable('visit_services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  visitId: integer('visit_id')
    .notNull()
    .references(() => visits.id),
  serviceId: integer('service_id')
    .notNull()
    .references(() => services.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: real('unit_price').notNull(), // Price at time of service
  totalPrice: real('total_price').notNull(), // quantity * unitPrice
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Payments table (Tahsilatlar)
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  visitId: integer('visit_id')
    .notNull()
    .references(() => visits.id),
  patientId: integer('patient_id')
    .notNull()
    .references(() => patients.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method', {
    enum: ['cash', 'credit_card', 'debit_card', 'insurance']
  })
    .notNull()
    .default('cash'),
  paymentDate: integer('payment_date', { mode: 'timestamp' }).notNull(),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type VisitService = typeof visitServices.$inferSelect;
export type NewVisitService = typeof visitServices.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type DoctorAvailability = typeof doctorAvailability.$inferSelect;
export type NewDoctorAvailability = typeof doctorAvailability.$inferInsert;
