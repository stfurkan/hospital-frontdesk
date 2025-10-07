'use client';

import { Doctor, Department } from '@/lib/db/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Power, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toggleDoctorStatus } from '@/lib/actions/doctors';
import { toast } from 'sonner';
import { EditDoctorDialog } from './edit-doctor-dialog';
import { DoctorAvailabilityDialog } from './doctor-availability-dialog';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type DoctorWithDepartment = {
  doctor: Doctor;
  department: Department | null;
};

export function DoctorsTable({
  doctors,
  departments,
  currentPage,
  totalPages
}: {
  doctors: DoctorWithDepartment[];
  departments: Department[];
  currentPage?: number;
  totalPages?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingDoctor, setEditingDoctor] =
    useState<DoctorWithDepartment | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/doctors?${params.toString()}`);
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    const result = await toggleDoctorStatus(id, isActive);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        isActive ? 'Doktor devre dışı bırakıldı' : 'Doktor aktif edildi'
      );
    }
  };

  if (doctors.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        {searchParams.get('search')
          ? 'Arama kriterlerine uygun doktor bulunamadı'
          : 'Henüz doktor eklenmemiş'}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doktor Adı</TableHead>
            <TableHead>Bölüm</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className='text-right'>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map(({ doctor, department }) => (
            <TableRow key={doctor.id}>
              <TableCell className='font-medium'>{doctor.fullName}</TableCell>
              <TableCell>{department?.name || '-'}</TableCell>
              <TableCell>{doctor.phone || '-'}</TableCell>
              <TableCell>{doctor.email || '-'}</TableCell>
              <TableCell>
                {doctor.isActive ? (
                  <Badge variant='default'>Aktif</Badge>
                ) : (
                  <Badge variant='secondary'>Pasif</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className='flex items-center justify-end gap-1'>
                  <DoctorAvailabilityDialog doctor={doctor}>
                    <Button
                      variant='ghost'
                      size='sm'
                      title='Müsaitlik Yönetimi'
                    >
                      <Calendar className='h-4 w-4' />
                    </Button>
                  </DoctorAvailabilityDialog>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setEditingDoctor({ doctor, department })}
                    title='Düzenle'
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      handleToggleStatus(doctor.id, doctor.isActive)
                    }
                    title={doctor.isActive ? 'Devre Dışı Bırak' : 'Aktif Et'}
                  >
                    <Power className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages && totalPages > 1 && (
        <div className='flex items-center justify-between px-2 py-4'>
          <div className='text-sm text-muted-foreground'>
            Sayfa {currentPage} / {totalPages}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange((currentPage || 1) - 1)}
              disabled={!currentPage || currentPage <= 1}
            >
              <ChevronLeft className='h-4 w-4' />
              Önceki
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange((currentPage || 1) + 1)}
              disabled={!currentPage || currentPage >= totalPages}
            >
              Sonraki
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {editingDoctor && (
        <EditDoctorDialog
          doctor={editingDoctor.doctor}
          departments={departments}
          open={!!editingDoctor}
          onOpenChange={(open) => !open && setEditingDoctor(null)}
        />
      )}
    </>
  );
}
