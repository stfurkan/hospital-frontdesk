import { config } from 'dotenv';
import { db } from './index';
import {
  users,
  departments,
  doctors,
  patients,
  services,
  doctorAvailability
} from './schema';
import bcrypt from 'bcryptjs';

// Load environment variables
config();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      fullName: 'Sistem Yöneticisi',
      role: 'admin'
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // Create receptionist user
    const receptionistPassword = await bcrypt.hash('receptionist123', 10);

    await db.insert(users).values({
      username: 'resepsiyon',
      password: receptionistPassword,
      fullName: 'Resepsiyon Görevlisi',
      role: 'receptionist'
    });
    console.log(
      '✅ Receptionist user created (username: resepsiyon, password: receptionist123)'
    );

    // Create sample departments
    const [cardiology] = await db
      .insert(departments)
      .values({
        name: 'Kardiyoloji',
        description: 'Kalp ve damar hastalıkları'
      })
      .returning();

    const [neurology] = await db
      .insert(departments)
      .values({
        name: 'Nöroloji',
        description: 'Sinir sistemi hastalıkları'
      })
      .returning();

    const [orthopedics] = await db
      .insert(departments)
      .values({
        name: 'Ortopedi',
        description: 'Kemik ve eklem hastalıkları'
      })
      .returning();

    console.log('✅ Departments created');

    // Create sample doctors
    const doctorsList = await db
      .insert(doctors)
      .values([
        {
          fullName: 'Dr. Ahmet Yılmaz',
          departmentId: cardiology.id,
          phone: '0532 123 45 67',
          email: 'ahmet.yilmaz@hospital.com'
        },
        {
          fullName: 'Dr. Ayşe Demir',
          departmentId: neurology.id,
          phone: '0533 234 56 78',
          email: 'ayse.demir@hospital.com'
        },
        {
          fullName: 'Dr. Mehmet Kaya',
          departmentId: orthopedics.id,
          phone: '0534 345 67 89',
          email: 'mehmet.kaya@hospital.com'
        }
      ])
      .returning();
    console.log('✅ Doctors created');

    // Create default availability for all doctors (Monday-Friday, 9am-5pm)
    const defaultAvailability = doctorsList.flatMap((doctor) =>
      Array.from({ length: 5 }, (_, i) => ({
        doctorId: doctor.id,
        dayOfWeek: i + 1, // Monday = 1, Friday = 5
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      }))
    );

    await db.insert(doctorAvailability).values(defaultAvailability);
    console.log('✅ Doctor availability schedules created');

    // Create sample patient
    await db.insert(patients).values({
      nationalId: '34910186844',
      firstName: 'Test',
      lastName: 'Hasta',
      phone: '0535 456 78 90',
      address: 'İstanbul, Türkiye'
    });
    console.log('✅ Sample patient created');

    // Create sample services
    await db.insert(services).values([
      {
        name: 'Genel Muayene',
        description: 'Genel sağlık kontrolü',
        price: 150.0
      },
      {
        name: 'EKG',
        description: 'Elektrokardiyografi',
        price: 200.0
      },
      {
        name: 'Kan Tahlili',
        description: 'Tam kan sayımı',
        price: 100.0
      },
      {
        name: 'Röntgen',
        description: 'X-Ray görüntüleme',
        price: 250.0
      },
      {
        name: 'MR',
        description: 'Manyetik rezonans görüntüleme',
        price: 800.0
      }
    ]);
    console.log('✅ Services created');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
