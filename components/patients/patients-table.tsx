'use client';

import { Patient } from '@/lib/db/schema';
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
import { Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditPatientDialog } from './edit-patient-dialog';
import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRouter, useSearchParams } from 'next/navigation';

export function PatientsTable({
  patients,
  currentPage,
  totalPages
}: {
  patients: Patient[];
  currentPage: number;
  totalPages: number;
}) {
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/patients?${params.toString()}`);
  };

  if (patients.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        {searchParams.get('search')
          ? 'Arama kriterlerine uygun hasta bulunamadı'
          : 'Henüz hasta eklenmemiş'}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>T.C. Kimlik No</TableHead>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Adres</TableHead>
            <TableHead>Doğum Tarihi</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className='text-right'>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className='font-medium'>
                {patient.nationalId}
              </TableCell>
              <TableCell>
                {patient.firstName} {patient.lastName}
              </TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.address || '-'}</TableCell>
              <TableCell>
                {patient.dateOfBirth
                  ? format(patient.dateOfBirth, 'dd MMMM yyyy', { locale: tr })
                  : '-'}
              </TableCell>
              <TableCell>
                {patient.isActive ? (
                  <Badge variant='default'>Aktif</Badge>
                ) : (
                  <Badge variant='secondary'>Pasif</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className='flex items-center justify-end gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setEditingPatient(patient)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className='flex items-center justify-between pt-4'>
          <p className='text-sm text-muted-foreground'>
            Sayfa {currentPage} / {totalPages}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Önceki
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sonraki
              <ChevronRight className='h-4 w-4 ml-1' />
            </Button>
          </div>
        </div>
      )}

      {editingPatient && (
        <EditPatientDialog
          patient={editingPatient}
          open={!!editingPatient}
          onOpenChange={(open) => !open && setEditingPatient(null)}
        />
      )}
    </>
  );
}
