import { getSession } from '@/lib/auth/session';
import { canChangePassword } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';
import { ChangePasswordForm } from '@/components/password/change-password-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

export default async function PasswordPage() {
  const session = await getSession();

  if (!canChangePassword(session)) {
    redirect('/login');
  }

  return (
    <main className='container mx-auto p-6'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Şifre Değiştir</h1>
          <p className='text-muted-foreground'>
            Hesap güvenliğiniz için şifrenizi güncelleyin
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Şifre Güncelleme</CardTitle>
            <CardDescription>
              Güvenli bir şifre seçiniz. En az 6 karakter olmalıdır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
