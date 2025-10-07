'use server';

import { db } from '@/lib/db';
import {
  patients,
  visits,
  appointments,
  doctors,
  departments,
  visitServices,
  services,
  payments
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function searchPatientByNationalId(nationalId: string) {
  try {
    // Get patient
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.nationalId, nationalId))
      .limit(1);

    if (!patient) {
      return { error: 'Bu T.C. Kimlik No ile kayıtlı hasta bulunamadı' };
    }

    // Get all appointments for this patient
    const patientAppointments = await db
      .select({
        appointment: appointments,
        doctor: doctors,
        department: departments
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(departments, eq(appointments.departmentId, departments.id))
      .where(eq(appointments.patientId, patient.id))
      .orderBy(desc(appointments.appointmentDate));

    // Get all visits for this patient
    const patientVisits = await db
      .select({
        visit: visits,
        doctor: doctors,
        department: departments
      })
      .from(visits)
      .leftJoin(doctors, eq(visits.doctorId, doctors.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(eq(visits.patientId, patient.id))
      .orderBy(desc(visits.visitDate));

    // Get all visit services with service details
    const visitsWithServices = await Promise.all(
      patientVisits.map(async (visitData) => {
        const visitSvcs = await db
          .select({
            visitService: visitServices,
            service: services
          })
          .from(visitServices)
          .leftJoin(services, eq(visitServices.serviceId, services.id))
          .where(eq(visitServices.visitId, visitData.visit.id));

        return {
          ...visitData,
          services: visitSvcs
        };
      })
    );

    // Get all payments
    const allPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.patientId, patient.id))
      .orderBy(desc(payments.paymentDate));

    // Calculate totals
    let totalServices = 0;
    let totalPayments = 0;

    for (const visitData of visitsWithServices) {
      totalServices += visitData.services.reduce(
        (sum, vs) => sum + vs.visitService.totalPrice,
        0
      );
    }

    totalPayments = allPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      data: {
        patient,
        appointments: patientAppointments,
        visits: visitsWithServices,
        payments: allPayments,
        totalServices,
        totalPayments,
        remainingBalance: totalServices - totalPayments
      }
    };
  } catch (error) {
    console.error('Search patient error:', error);
    return { error: 'Hasta sorgulanırken bir hata oluştu' };
  }
}
