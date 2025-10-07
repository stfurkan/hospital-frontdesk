'use client';

import { Service } from '@/lib/db/schema';
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
import { toggleServiceStatus } from '@/lib/actions/services';
import { toast } from 'sonner';
import { EditServiceDialog } from './edit-service-dialog';
import { useState } from 'react';

export function ServicesTable({ services }: { services: Service[] }) {
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    const result = await toggleServiceStatus(id, isActive);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        isActive ? 'Hizmet devre dışı bırakıldı' : 'Hizmet aktif edildi'
      );
    }
  };

  if (services.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        Henüz hizmet eklenmemiş
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hizmet Adı</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead>Fiyat</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className='text-right'>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className='font-medium'>{service.name}</TableCell>
              <TableCell>{service.description || '-'}</TableCell>
              <TableCell>₺{service.price.toFixed(2)}</TableCell>
              <TableCell>
                {service.isActive ? (
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
                    onClick={() => setEditingService(service)}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      handleToggleStatus(service.id, service.isActive)
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
      {editingService && (
        <EditServiceDialog
          service={editingService}
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
        />
      )}
    </>
  );
}
