# Hospital Front Desk System

A comprehensive hospital patient registration and management system built with Next.js 15, TypeScript, and Drizzle ORM.

## Features

- 🏥 **Department & Doctor Management** - Define and manage departments and doctors
- 👤 **Patient Registration** - Register patients with Turkish ID (T.C.), name, phone, and address
- 📅 **Appointment Scheduling** - Book appointments for patients with doctors
- 🏨 **Visit Management** - Register patient arrivals for appointments
- 💊 **Service Management** - Add medical services with pricing to visits
- 💰 **Payment Collection** - Record payments for services
- 🔍 **Patient Lookup** - Search by Turkish ID to view patient history, visits, and payment status

## Tech Stack

- **Framework**: Next.js 15 with App Router and Server Actions
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Database**: Drizzle ORM with SQLite (Turso for production)
- **Authentication**: Custom auth with bcryptjs
- **Reservation Locking**: Upstash Redis (optional, for production)
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns

## Getting Started

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

For **local development**, use these settings in `.env`:

```env
DATABASE_URL=file:
DATABASE_AUTH_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SESSION_SECRET=
```

For **production with Turso**:

1. Sign up at [turso.tech](https://turso.tech/)
2. Create a database and get your credentials
3. Update `DATABASE_URL` and `DATABASE_AUTH_TOKEN`

For **Redis locking** (optional for local dev):

1. Sign up at [upstash.com](https://upstash.com/)
2. Create a Redis database
3. Add your `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 3. Initialize Database

Push the database schema:

```bash
npm run db:push
```

Seed the database with initial data:

```bash
npm run db:seed
```

This will create:

- Admin user: `admin` / `admin123`
- Receptionist user: `resepsiyon` / `receptionist123`
- Sample departments, doctors, services, and a test patient

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Users

After seeding, you can login with:

- **Admin**:
  - Username: `admin`
  - Password: `admin123`
- **Receptionist**:
  - Username: `resepsiyon`
  - Password: `receptionist123`

## Database Scripts

- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed database with initial data

## Project Structure

```markdown
/app # Next.js app directory
/(auth) # Authentication pages
/login
/(dashboard) # Protected dashboard pages
/departments
/doctors
/patients
/appointments
/visits
/payments
/lookup
/components # React components
/ui # Shadcn/ui components
/lib # Utilities and libraries
/db # Database schema and connection
/auth # Authentication utilities
/actions # Server actions
/validations # Zod schemas
```
