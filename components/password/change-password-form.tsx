'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/lib/actions/users';
import { AlertCircle, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function ChangePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Mevcut şifrenizi giriniz';
    }

    if (!newPassword || newPassword.length < 6) {
      newErrors.newPassword = 'Yeni şifre en az 6 karakter olmalıdır';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Yeni şifreler eşleşmiyor';
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = 'Yeni şifre mevcut şifreden farklı olmalıdır';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const result = await changePassword(formData);

    setIsLoading(false);

    if (result.error) {
      setErrors({ general: result.error });
      toast.error(result.error);
    } else {
      toast.success('Şifreniz başarıyla değiştirildi');
      resetForm();
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {errors.general && (
        <div className='flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm'>
          <AlertCircle className='h-4 w-4' />
          <span>{errors.general}</span>
        </div>
      )}

      <div className='space-y-2'>
        <Label htmlFor='currentPassword'>
          Mevcut Şifre <span className='text-destructive'>*</span>
        </Label>
        <div className='relative'>
          <Input
            id='currentPassword'
            type={showPasswords.current ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder='Mevcut şifrenizi giriniz'
            disabled={isLoading}
            aria-invalid={!!errors.currentPassword}
            className='pr-10'
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
            onClick={() =>
              setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
            }
          >
            {showPasswords.current ? (
              <EyeOff className='h-4 w-4 text-muted-foreground' />
            ) : (
              <Eye className='h-4 w-4 text-muted-foreground' />
            )}
          </Button>
        </div>
        {errors.currentPassword && (
          <p className='text-sm text-destructive'>{errors.currentPassword}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='newPassword'>
          Yeni Şifre <span className='text-destructive'>*</span>
        </Label>
        <div className='relative'>
          <Input
            id='newPassword'
            type={showPasswords.new ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder='En az 6 karakter'
            disabled={isLoading}
            aria-invalid={!!errors.newPassword}
            className='pr-10'
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
            onClick={() =>
              setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
            }
          >
            {showPasswords.new ? (
              <EyeOff className='h-4 w-4 text-muted-foreground' />
            ) : (
              <Eye className='h-4 w-4 text-muted-foreground' />
            )}
          </Button>
        </div>
        {errors.newPassword && (
          <p className='text-sm text-destructive'>{errors.newPassword}</p>
        )}
        {newPassword && newPassword.length >= 6 && !errors.newPassword && (
          <p className='text-sm text-green-600 flex items-center gap-1'>
            <CheckCircle2 className='h-3 w-3' />
            Güçlü şifre
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='confirmPassword'>
          Yeni Şifre Tekrar <span className='text-destructive'>*</span>
        </Label>
        <div className='relative'>
          <Input
            id='confirmPassword'
            type={showPasswords.confirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Yeni şifreyi tekrar giriniz'
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
            className='pr-10'
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
            onClick={() =>
              setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
            }
          >
            {showPasswords.confirm ? (
              <EyeOff className='h-4 w-4 text-muted-foreground' />
            ) : (
              <Eye className='h-4 w-4 text-muted-foreground' />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className='text-sm text-destructive'>{errors.confirmPassword}</p>
        )}
        {confirmPassword &&
          newPassword === confirmPassword &&
          !errors.confirmPassword && (
            <p className='text-sm text-green-600 flex items-center gap-1'>
              <CheckCircle2 className='h-3 w-3' />
              Şifreler eşleşiyor
            </p>
          )}
      </div>

      <div className='pt-4'>
        <Button type='submit' disabled={isLoading} className='w-full'>
          {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Şifreyi Değiştir
        </Button>
      </div>
    </form>
  );
}
