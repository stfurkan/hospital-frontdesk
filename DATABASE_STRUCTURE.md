# 🗄️ Database Structure

Complete database schema documentation for the Hospital Front Desk System.

## 📊 Tables Overview

The system uses **10 tables** with the following relationships:

```markdown
users (staff/admin)
└── created appointments, visits, visit_services, payments

departments
├── doctors (many-to-one)
└── appointments (many-to-one)

doctors
├── belongs to department (many-to-one)
├── doctor_availability (one-to-many)
├── appointments (one-to-many)
└── visits (one-to-many)

patients
├── appointments (one-to-many)
├── visits (one-to-many)
└── payments (one-to-many)

appointments
├── belongs to patient (many-to-one)
├── belongs to doctor (many-to-one)
├── belongs to department (many-to-one)
└── visits (one-to-one or one-to-many)

visits
├── belongs to appointment (many-to-one)
├── belongs to patient (many-to-one)
├── belongs to doctor (many-to-one)
├── visit_services (one-to-many)
└── payments (one-to-many)

services
└── visit_services (one-to-many)

visit_services (junction table)
├── belongs to visit (many-to-one)
└── belongs to service (many-to-one)

payments
├── belongs to visit (many-to-one)
└── belongs to patient (many-to-one)

doctor_availability
└── belongs to doctor (many-to-one)
```

---

## 📋 Table Definitions

### 1. **users** - Staff & Admin Accounts

| Field        | Type      | Constraints                            | Description                        |
| ------------ | --------- | -------------------------------------- | ---------------------------------- |
| `id`         | integer   | PRIMARY KEY, AUTO INCREMENT            | Unique user ID                     |
| `username`   | text      | NOT NULL, UNIQUE                       | Login username                     |
| `password`   | text      | NOT NULL                               | Hashed password (bcrypt)           |
| `full_name`  | text      | NOT NULL                               | Full name of user                  |
| `role`       | text      | NOT NULL, ENUM, DEFAULT 'receptionist' | User role: `admin`, `receptionist` |
| `is_active`  | boolean   | NOT NULL, DEFAULT true                 | Active status                      |
| `created_at` | timestamp | NOT NULL, DEFAULT now()                | Creation timestamp                 |
| `updated_at` | timestamp | NOT NULL, DEFAULT now()                | Last update timestamp              |

**Relations:**

- Creates appointments (via `appointments.created_by`)
- Creates visits (via `visits.created_by`)
- Creates visit services (via `visit_services.created_by`)
- Creates payments (via `payments.created_by`)

---

### 2. **departments** - Hospital Departments (Bölümler)

| Field         | Type      | Constraints                 | Description            |
| ------------- | --------- | --------------------------- | ---------------------- |
| `id`          | integer   | PRIMARY KEY, AUTO INCREMENT | Unique department ID   |
| `name`        | text      | NOT NULL, UNIQUE            | Department name        |
| `description` | text      | -                           | Department description |
| `is_active`   | boolean   | NOT NULL, DEFAULT true      | Active status          |
| `created_at`  | timestamp | NOT NULL, DEFAULT now()     | Creation timestamp     |
| `updated_at`  | timestamp | NOT NULL, DEFAULT now()     | Last update timestamp  |

**Relations:**

- Has many doctors (`doctors.department_id → departments.id`)
- Has many appointments (`appointments.department_id → departments.id`)

---

### 3. **doctors** - Doctor Profiles (Doktorlar)

| Field           | Type      | Constraints                 | Description                 |
| --------------- | --------- | --------------------------- | --------------------------- |
| `id`            | integer   | PRIMARY KEY, AUTO INCREMENT | Unique doctor ID            |
| `full_name`     | text      | NOT NULL                    | Doctor's full name          |
| `department_id` | integer   | NOT NULL, FOREIGN KEY       | References `departments.id` |
| `phone`         | text      | -                           | Contact phone               |
| `email`         | text      | -                           | Contact email               |
| `is_active`     | boolean   | NOT NULL, DEFAULT true      | Active status               |
| `created_at`    | timestamp | NOT NULL, DEFAULT now()     | Creation timestamp          |
| `updated_at`    | timestamp | NOT NULL, DEFAULT now()     | Last update timestamp       |

**Relations:**

- Belongs to department (`department_id → departments.id`) - Many-to-One
- Has many availability slots (`doctor_availability.doctor_id → doctors.id`) - One-to-Many
- Has many appointments (`appointments.doctor_id → doctors.id`) - One-to-Many
- Has many visits (`visits.doctor_id → doctors.id`) - One-to-Many

---

### 4. **patients** - Patient Records (Hastalar)

| Field           | Type      | Constraints                 | Description                |
| --------------- | --------- | --------------------------- | -------------------------- |
| `id`            | integer   | PRIMARY KEY, AUTO INCREMENT | Unique patient ID          |
| `national_id`   | text      | NOT NULL, UNIQUE            | T.C. Kimlik No (11 digits) |
| `first_name`    | text      | NOT NULL                    | First name                 |
| `last_name`     | text      | NOT NULL                    | Last name                  |
| `phone`         | text      | NOT NULL                    | Contact phone              |
| `address`       | text      | -                           | Address                    |
| `date_of_birth` | timestamp | -                           | Date of birth              |
| `is_active`     | boolean   | NOT NULL, DEFAULT true      | Active status              |
| `created_at`    | timestamp | NOT NULL, DEFAULT now()     | Creation timestamp         |
| `updated_at`    | timestamp | NOT NULL, DEFAULT now()     | Last update timestamp      |

**Relations:**

- Has many appointments (`appointments.patient_id → patients.id`)
- Has many visits (`visits.patient_id → patients.id`)
- Has many payments (`payments.patient_id → patients.id`)

---

### 5. **doctor_availability** - Doctor Availability Schedule

| Field          | Type      | Constraints                 | Description                              |
| -------------- | --------- | --------------------------- | ---------------------------------------- |
| `id`           | integer   | PRIMARY KEY, AUTO INCREMENT | Unique availability ID                   |
| `doctor_id`    | integer   | NOT NULL, FOREIGN KEY       | References `doctors.id`                  |
| `day_of_week`  | integer   | NOT NULL                    | Day: 0-6 (Sunday-Saturday)               |
| `start_time`   | text      | NOT NULL                    | Start time (HH:mm format, e.g., "09:00") |
| `end_time`     | text      | NOT NULL                    | End time (HH:mm format, e.g., "17:00")   |
| `is_available` | boolean   | NOT NULL, DEFAULT true      | Availability flag                        |
| `created_at`   | timestamp | NOT NULL, DEFAULT now()     | Creation timestamp                       |
| `updated_at`   | timestamp | NOT NULL, DEFAULT now()     | Last update timestamp                    |

**Relations:**

- Belongs to doctor (`doctor_id → doctors.id`) - Many-to-One

---

### 6. **appointments** - Appointment Bookings (Randevular)

| Field              | Type      | Constraints                         | Description                                              |
| ------------------ | --------- | ----------------------------------- | -------------------------------------------------------- |
| `id`               | integer   | PRIMARY KEY, AUTO INCREMENT         | Unique appointment ID                                    |
| `patient_id`       | integer   | NOT NULL, FOREIGN KEY               | References `patients.id`                                 |
| `doctor_id`        | integer   | NOT NULL, FOREIGN KEY               | References `doctors.id`                                  |
| `department_id`    | integer   | NOT NULL, FOREIGN KEY               | References `departments.id`                              |
| `appointment_date` | timestamp | NOT NULL                            | Appointment date & time                                  |
| `status`           | text      | NOT NULL, ENUM, DEFAULT 'scheduled' | Status: `scheduled`, `completed`, `cancelled`, `no_show` |
| `notes`            | text      | -                                   | Appointment notes                                        |
| `created_by`       | integer   | FOREIGN KEY                         | References `users.id`                                    |
| `created_at`       | timestamp | NOT NULL, DEFAULT now()             | Creation timestamp                                       |
| `updated_at`       | timestamp | NOT NULL, DEFAULT now()             | Last update timestamp                                    |

**Relations:**

- Belongs to patient (`patient_id → patients.id`) - Many-to-One
- Belongs to doctor (`doctor_id → doctors.id`) - Many-to-One
- Belongs to department (`department_id → departments.id`) - Many-to-One
- Created by user (`created_by → users.id`) - Many-to-One
- Has one or many visits (`visits.appointment_id → appointments.id`) - One-to-Many

**Status Enum:** `scheduled`, `completed`, `cancelled`, `no_show`

---

### 7. **visits** - Patient Visits (Gelişler)

| Field            | Type      | Constraints                          | Description                                      |
| ---------------- | --------- | ------------------------------------ | ------------------------------------------------ |
| `id`             | integer   | PRIMARY KEY, AUTO INCREMENT          | Unique visit ID                                  |
| `appointment_id` | integer   | NOT NULL, FOREIGN KEY                | References `appointments.id`                     |
| `patient_id`     | integer   | NOT NULL, FOREIGN KEY                | References `patients.id`                         |
| `doctor_id`      | integer   | NOT NULL, FOREIGN KEY                | References `doctors.id`                          |
| `visit_date`     | timestamp | NOT NULL                             | Visit date & time                                |
| `status`         | text      | NOT NULL, ENUM, DEFAULT 'checked_in' | Status: `checked_in`, `in_progress`, `completed` |
| `notes`          | text      | -                                    | Visit notes                                      |
| `created_by`     | integer   | FOREIGN KEY                          | References `users.id`                            |
| `created_at`     | timestamp | NOT NULL, DEFAULT now()              | Creation timestamp                               |
| `updated_at`     | timestamp | NOT NULL, DEFAULT now()              | Last update timestamp                            |

**Relations:**

- Belongs to appointment (`appointment_id → appointments.id`) - Many-to-One
- Belongs to patient (`patient_id → patients.id`) - Many-to-One
- Belongs to doctor (`doctor_id → doctors.id`) - Many-to-One
- Created by user (`created_by → users.id`) - Many-to-One
- Has many visit services (`visit_services.visit_id → visits.id`) - One-to-Many
- Has many payments (`payments.visit_id → visits.id`) - One-to-Many

**Status Enum:** `checked_in`, `in_progress`, `completed`

---

### 8. **services** - Medical Services (Hizmetler)

| Field         | Type      | Constraints                 | Description           |
| ------------- | --------- | --------------------------- | --------------------- |
| `id`          | integer   | PRIMARY KEY, AUTO INCREMENT | Unique service ID     |
| `name`        | text      | NOT NULL, UNIQUE            | Service name          |
| `description` | text      | -                           | Service description   |
| `price`       | real      | NOT NULL                    | Service price (₺)     |
| `is_active`   | boolean   | NOT NULL, DEFAULT true      | Active status         |
| `created_at`  | timestamp | NOT NULL, DEFAULT now()     | Creation timestamp    |
| `updated_at`  | timestamp | NOT NULL, DEFAULT now()     | Last update timestamp |

**Relations:**

- Has many visit services (`visit_services.service_id → services.id`)

---

### 9. **visit_services** - Services Added to Visits (Junction Table)

| Field         | Type      | Constraints                 | Description                         |
| ------------- | --------- | --------------------------- | ----------------------------------- |
| `id`          | integer   | PRIMARY KEY, AUTO INCREMENT | Unique visit service ID             |
| `visit_id`    | integer   | NOT NULL, FOREIGN KEY       | References `visits.id`              |
| `service_id`  | integer   | NOT NULL, FOREIGN KEY       | References `services.id`            |
| `quantity`    | integer   | NOT NULL, DEFAULT 1         | Quantity of service                 |
| `unit_price`  | real      | NOT NULL                    | Price per unit (at time of service) |
| `total_price` | real      | NOT NULL                    | Total price (quantity × unit_price) |
| `created_by`  | integer   | FOREIGN KEY                 | References `users.id`               |
| `created_at`  | timestamp | NOT NULL, DEFAULT now()     | Creation timestamp                  |

**Relations:**

- Belongs to visit (`visit_id → visits.id`) - Many-to-One
- Belongs to service (`service_id → services.id`) - Many-to-One
- Created by user (`created_by → users.id`) - Many-to-One

---

### 10. **payments** - Payment Records (Tahsilatlar)

| Field            | Type      | Constraints                    | Description                                                      |
| ---------------- | --------- | ------------------------------ | ---------------------------------------------------------------- |
| `id`             | integer   | PRIMARY KEY, AUTO INCREMENT    | Unique payment ID                                                |
| `visit_id`       | integer   | NOT NULL, FOREIGN KEY          | References `visits.id`                                           |
| `patient_id`     | integer   | NOT NULL, FOREIGN KEY          | References `patients.id`                                         |
| `amount`         | real      | NOT NULL                       | Payment amount (₺)                                               |
| `payment_method` | text      | NOT NULL, ENUM, DEFAULT 'cash' | Payment method: `cash`, `credit_card`, `debit_card`, `insurance` |
| `payment_date`   | timestamp | NOT NULL                       | Payment date & time                                              |
| `notes`          | text      | -                              | Payment notes                                                    |
| `created_by`     | integer   | FOREIGN KEY                    | References `users.id`                                            |
| `created_at`     | timestamp | NOT NULL, DEFAULT now()        | Creation timestamp                                               |

**Relations:**

- Belongs to visit (`visit_id → visits.id`) - Many-to-One
- Belongs to patient (`patient_id → patients.id`) - Many-to-One
- Created by user (`created_by → users.id`) - Many-to-One

**Payment Method Enum:** `cash`, `credit_card`, `debit_card`, `insurance`

---

## 🔗 Relationships Summary

### One-to-Many Relationships

| Parent Table   | Child Table           | Foreign Key      | Description                        |
| -------------- | --------------------- | ---------------- | ---------------------------------- |
| `departments`  | `doctors`             | `department_id`  | Department has many doctors        |
| `departments`  | `appointments`        | `department_id`  | Department has many appointments   |
| `doctors`      | `doctor_availability` | `doctor_id`      | Doctor has many availability slots |
| `doctors`      | `appointments`        | `doctor_id`      | Doctor has many appointments       |
| `doctors`      | `visits`              | `doctor_id`      | Doctor has many visits             |
| `patients`     | `appointments`        | `patient_id`     | Patient has many appointments      |
| `patients`     | `visits`              | `patient_id`     | Patient has many visits            |
| `patients`     | `payments`            | `patient_id`     | Patient has many payments          |
| `appointments` | `visits`              | `appointment_id` | Appointment has one or many visits |
| `visits`       | `visit_services`      | `visit_id`       | Visit has many services            |
| `visits`       | `payments`            | `visit_id`       | Visit has many payments            |
| `services`     | `visit_services`      | `service_id`     | Service has many visit usages      |
| `users`        | `appointments`        | `created_by`     | User creates many appointments     |
| `users`        | `visits`              | `created_by`     | User creates many visits           |
| `users`        | `visit_services`      | `created_by`     | User creates many visit services   |
| `users`        | `payments`            | `created_by`     | User creates many payments         |

### Many-to-Many Relationship

| Table 1  | Junction Table   | Table 2    | Description                                                   |
| -------- | ---------------- | ---------- | ------------------------------------------------------------- |
| `visits` | `visit_services` | `services` | Visits can have many services, services can be in many visits |

---

## 📝 Data Flow

### Typical Workflow

1. **Patient Registration**

   - Create patient record in `patients` table

2. **Appointment Booking**

   - Check doctor availability in `doctor_availability`
   - Create appointment in `appointments` table
   - Link to `patient`, `doctor`, `department`

3. **Patient Check-in (Visit)**

   - Create visit record in `visits` table
   - Link to `appointment`, `patient`, `doctor`
   - Add services via `visit_services` table

4. **Service Addition**

   - Add multiple services to visit via `visit_services`
   - Calculate totals (quantity × unit_price)

5. **Payment Collection**
   - Record payment in `payments` table
   - Link to `visit` and `patient`
   - Track payment method and amount

---

## 🔒 Constraints & Validations

### Unique Constraints

- `users.username` - Unique usernames
- `departments.name` - Unique department names
- `patients.national_id` - Unique T.C. Kimlik No
- `services.name` - Unique service names

### Enums

- `users.role`: `admin`, `receptionist`
- `appointments.status`: `scheduled`, `completed`, `cancelled`, `no_show`
- `visits.status`: `checked_in`, `in_progress`, `completed`
- `payments.payment_method`: `cash`, `credit_card`, `debit_card`, `insurance`

### Timestamps

- All tables have `created_at` (auto-set on creation)
- Most tables have `updated_at` (auto-updated on modification)

### Soft Deletes

- Uses `is_active` boolean flag for departments, doctors, patients, and services
- No hard deletes to preserve historical data

---

## 💾 Database Type

**SQLite** (via Drizzle ORM)

- Development: Local SQLite file
- Production: Compatible with Turso (libSQL)

---

**Generated from Drizzle Schema** - Last updated: 2025
