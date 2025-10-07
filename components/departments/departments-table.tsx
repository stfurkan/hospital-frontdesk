'use client';

import { Department } from '@/lib/db/schema';
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
import { Edit, Power } from 'lucide-react';
import { toggleDepartmentStatus } from '@/lib/actions/departments';
import { toast } from 'sonner';
import { EditDepartmentDialog } from './edit-department-dialog';
import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function DepartmentsTable({
  departments
}: {
  departments: Department[];
}) {
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    const result = await toggleDepartmentStatus(id, isActive);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        isActive ? 'Bölüm devre dışı bırakıldı' : 'Bölüm aktif edildi'
      );
    }
  };

  if (departments.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        Henüz bölüm eklenmemiş
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bölüm Adı</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Oluşturulma</TableHead>
            <TableHead className='text-right'>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              <TableCell className='font-medium'>{department.name}</TableCell>
              <TableCell>{department.description || '-'}</TableCell>
              <TableCell>
                {department.isActive ? (
                  <Badge variant='default'>Aktif</Badge>
                ) : (
                  <Badge variant='secondary'>Pasif</Badge>
                )}
              </TableCell>
              <TableCell>
                {format(department.createdAt, 'dd MMMM yyyy', { locale: tr })}
              </TableCell>
              <TableCell>
                <div className='flex items-center justify-end gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setEditingDepartment(department)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      handleToggleStatus(department.id, department.isActive)
                    }
                  >
                    <Power className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingDepartment && (
        <EditDepartmentDialog
          department={editingDepartment}
          open={!!editingDepartment}
          onOpenChange={(open) => !open && setEditingDepartment(null)}
        />
      )}
    </>
  );
}
