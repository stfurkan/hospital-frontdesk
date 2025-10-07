'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { createUser } from '@/lib/actions/users';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'receptionist'>('receptionist');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setRole('receptionist');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!username || username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (!fullName || fullName.length < 2) {
      newErrors.fullName = 'Ad Soyad en az 2 karakter olmalıdır';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('fullName', fullName);
    formData.append('role', role);

    const result = await createUser(formData);

    setIsLoading(false);

    if (result.error) {
      setErrors({ general: result.error });
      toast.error(result.error);
    } else {
      toast.success('Kullanıcı başarıyla oluşturuldu');
      resetForm();
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className='w-full sm:w-auto'>
        <Button className='w-full sm:w-auto gap-2'>
          <UserPlus className='h-4 w-4' />
          Yeni Kullanıcı
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
            <DialogDescription>
              Sisteme yeni kullanıcı ekleyin
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {errors.general && (
              <div className='flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm'>
                <AlertCircle className='h-4 w-4' />
                <span>{errors.general}</span>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='username'>
                Kullanıcı Adı <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='kullaniciadi'
                disabled={isLoading}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className='text-sm text-destructive'>{errors.username}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='fullName'>
                Ad Soyad <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='fullName'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder='Ahmet Yılmaz'
                disabled={isLoading}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className='text-sm text-destructive'>{errors.fullName}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='role'>
                Rol <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={role}
                onValueChange={(value: 'admin' | 'receptionist') =>
                  setRole(value)
                }
                disabled={isLoading}
              >
                <SelectTrigger id='role'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='receptionist'>Resepsiyonist</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>
                Şifre <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='En az 6 karakter'
                disabled={isLoading}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className='text-sm text-destructive'>{errors.password}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>
                Şifre Tekrar <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Şifreyi tekrar giriniz'
                disabled={isLoading}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className='text-sm text-destructive'>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
                disabled={isLoading}
                className='flex-1'
              >
                İptal
              </Button>
              <Button type='submit' disabled={isLoading} className='flex-1'>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Oluştur
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
