'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toggleUserStatus } from '@/lib/actions/users';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Shield, User, Power } from 'lucide-react';
import { toast } from 'sonner';

type User = {
  id: number;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

export function UsersTable({ users }: { users: User[] }) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleToggleStatus = async (userId: number) => {
    setTogglingId(userId);
    const result = await toggleUserStatus(userId);
    setTogglingId(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Kullanıcı durumu güncellendi');
      router.refresh();
    }
  };

  if (users.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        Henüz kullanıcı bulunmamaktadır
      </div>
    );
  }

  return (
    <div className='relative w-full overflow-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanıcı Adı</TableHead>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Oluşturulma</TableHead>
            <TableHead className='text-right'>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className='font-medium'>{user.username}</TableCell>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {user.role === 'admin' ? (
                    <>
                      <Shield className='h-4 w-4 text-amber-500' />
                      <Badge variant='default' className='bg-amber-500'>
                        Admin
                      </Badge>
                    </>
                  ) : (
                    <>
                      <User className='h-4 w-4 text-blue-500' />
                      <Badge variant='secondary'>Resepsiyonist</Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.isActive ? (
                  <Badge className='bg-green-500'>Aktif</Badge>
                ) : (
                  <Badge variant='destructive'>Pasif</Badge>
                )}
              </TableCell>
              <TableCell>
                {format(user.createdAt, 'dd MMMM yyyy', { locale: tr })}
              </TableCell>
              <TableCell>
                <div className='flex items-center justify-end gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleToggleStatus(user.id)}
                    disabled={togglingId === user.id}
                    title={
                      user.isActive
                        ? 'Kullanıcıyı pasif yap'
                        : 'Kullanıcıyı aktif yap'
                    }
                  >
                    <Power
                      className={`h-4 w-4 ${
                        user.isActive ? 'text-green-500' : 'text-gray-400'
                      }`}
                    />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
