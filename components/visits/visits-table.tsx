'use client';

import React from 'react';
import { Visit, Patient, Doctor, VisitService, Service } from '@/lib/db/schema';
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
import { Plus, Trash2, Check } from 'lucide-react';
import { useState } from 'react';
import { AddServiceDialog } from './add-service-dialog';
import { removeServiceFromVisit, completeVisit } from '@/lib/actions/visits';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type VisitWithRelations = {
  visit: Visit;
  patient: Patient | null;
  doctor: Doctor | null;
};

type VisitServiceWithRelations = {
  visitService: VisitService;
  service: Service | null;
};

export function VisitsTable({
  visits,
  visitServices,
  services
}: {
  visits: VisitWithRelations[];
  visitServices: VisitServiceWithRelations[];
  services: Service[];
}) {
  const [expandedVisitId, setExpandedVisitId] = useState<number | null>(null);
  const [addingServiceToVisit, setAddingServiceToVisit] = useState<
    number | null
  >(null);

  const getVisitServices = (visitId: number) => {
    return visitServices.filter((vs) => vs.visitService.visitId === visitId);
  };

  const getVisitTotal = (visitId: number) => {
    return getVisitServices(visitId).reduce(
      (sum, vs) => sum + vs.visitService.totalPrice,
      0
    );
  };

  const handleRemoveService = async (visitServiceId: number) => {
    const result = await removeServiceFromVisit(visitServiceId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Hizmet silindi');
    }
  };

  const handleCompleteVisit = async (visitId: number) => {
    const result = await completeVisit(visitId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Geliş tamamlandı');
    }
  };

  if (visits.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        Henüz geliş kaydı eklenmemiş
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked_in':
        return <Badge variant='default'>Giriş Yapıldı</Badge>;
      case 'in_progress':
        return <Badge className='bg-blue-500'>Devam Ediyor</Badge>;
      case 'completed':
        return <Badge className='bg-green-500'>Tamamlandı</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Geliş Tarihi</TableHead>
            <TableHead>Hasta</TableHead>
            <TableHead>Doktor</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Toplam Tutar</TableHead>
            <TableHead className='text-right'>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map(({ visit, patient, doctor }) => {
            const isExpanded = expandedVisitId === visit.id;
            const services = getVisitServices(visit.id);
            const total = getVisitTotal(visit.id);

            return (
              <React.Fragment key={visit.id}>
                <TableRow>
                  <TableCell className='font-medium'>
                    {format(visit.visitDate, 'dd MMMM yyyy HH:mm', {
                      locale: tr
                    })}
                  </TableCell>
                  <TableCell>
                    {patient ? `${patient.firstName} ${patient.lastName}` : '-'}
                  </TableCell>
                  <TableCell>{doctor?.fullName || '-'}</TableCell>
                  <TableCell>{getStatusBadge(visit.status)}</TableCell>
                  <TableCell>₺{total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          setExpandedVisitId(isExpanded ? null : visit.id)
                        }
                      >
                        {isExpanded ? 'Gizle' : 'Detay'}
                      </Button>
                      {visit.status !== 'completed' && (
                        <>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setAddingServiceToVisit(visit.id)}
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleCompleteVisit(visit.id)}
                          >
                            <Check className='h-4 w-4' />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={6} className='bg-muted/50'>
                      <div className='p-4'>
                        <h4 className='font-medium mb-3'>Eklenen Hizmetler</h4>
                        {services.length === 0 ? (
                          <p className='text-sm text-muted-foreground'>
                            Henüz hizmet eklenmemiş
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Hizmet</TableHead>
                                <TableHead>Adet</TableHead>
                                <TableHead>Birim Fiyat</TableHead>
                                <TableHead>Toplam</TableHead>
                                <TableHead className='text-right'>
                                  İşlem
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {services.map(({ visitService, service }) => (
                                <TableRow key={visitService.id}>
                                  <TableCell>
                                    {service?.name || 'Bilinmeyen Hizmet'}
                                  </TableCell>
                                  <TableCell>{visitService.quantity}</TableCell>
                                  <TableCell>
                                    ₺{visitService.unitPrice.toFixed(2)}
                                  </TableCell>
                                  <TableCell>
                                    ₺{visitService.totalPrice.toFixed(2)}
                                  </TableCell>
                                  <TableCell className='text-right'>
                                    {visit.status !== 'completed' && (
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          handleRemoveService(visitService.id)
                                        }
                                      >
                                        <Trash2 className='h-4 w-4' />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {addingServiceToVisit && (
        <AddServiceDialog
          visitId={addingServiceToVisit}
          services={services}
          open={!!addingServiceToVisit}
          onOpenChange={(open) => !open && setAddingServiceToVisit(null)}
        />
      )}
    </>
  );
}
