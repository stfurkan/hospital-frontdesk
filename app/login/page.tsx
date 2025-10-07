'use client';

import { useState, useTransition } from 'react';
import { login } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Loader2, LogIn, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      }
      // If no error, redirect() will be called by the server action
      // and will throw a NEXT_REDIRECT error which is expected
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4'>
      <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>
      <Card className='w-full max-w-md shadow-2xl border-2 border-blue-200 dark:border-blue-900 relative z-10'>
        <CardHeader className='space-y-2 pb-6 text-center'>
          <div className='mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-2'>
            <LogIn className='w-8 h-8 text-white' />
          </div>
          <CardTitle className='text-3xl font-bold text-blue-900 dark:text-blue-100'>
            Hastane Ön Büro Sistemi
          </CardTitle>
          <CardDescription className='text-base text-blue-700 dark:text-blue-300'>
            Kullanıcı bilgileriniz ile giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <form action={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='username'
                className='text-blue-900 dark:text-blue-100 font-medium flex items-center gap-2'
              >
                <User className='w-4 h-4' />
                Kullanıcı Adı
              </Label>
              <Input
                id='username'
                name='username'
                type='text'
                placeholder='Örn: admin'
                required
                autoComplete='username'
                className='h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/30 focus:bg-white dark:focus:bg-gray-950 shadow-sm hover:shadow-md focus:shadow-lg'
                disabled={isPending}
              />
            </div>
            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-blue-900 dark:text-blue-100 font-medium flex items-center gap-2'
              >
                <Lock className='w-4 h-4' />
                Şifre
              </Label>
              <Input
                id='password'
                name='password'
                type='password'
                placeholder='Şifrenizi girin'
                required
                autoComplete='current-password'
                className='h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-blue-500 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/30 focus:bg-white dark:focus:bg-gray-950 shadow-sm hover:shadow-md focus:shadow-lg'
                disabled={isPending}
              />
            </div>

            {error && (
              <div className='p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
                <p className='text-sm text-red-800 dark:text-red-300 text-center font-medium'>
                  {error}
                </p>
              </div>
            )}

            <Button
              type='submit'
              className='w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl'
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <LogIn className='w-5 h-5 mr-2' />
                  Giriş Yap
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster richColors position='top-center' />
    </div>
  );
}
