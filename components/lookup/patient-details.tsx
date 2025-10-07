'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  User,
  Calendar,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export type PatientDetailsData = {
  patient: {
    id: number;
    nationalId: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string | null;
  };
  appointments: Array<{
    appointment: {
      id: number;
      appointmentDate: Date;
      status: string;
      notes: string | null;
    };
    doctor: { fullName: string } | null;
    department: { name: string } | null;
  }>;
  visits: Array<{
    visit: {
      id: number;
      visitDate: Date;
      status: string;
    };
    doctor: { fullName: string } | null;
    department: { name: string } | null;
    services: Array<{
      visitService: {
        id: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      };
      service: { name: string } | null;
    }>;
  }>;
  payments: Array<{
    id: number;
    paymentDate: Date;
    amount: number;
    paymentMethod: string;
    notes: string | null;
  }>;
  totalServices: number;
  totalPayments: number;
  remainingBalance: number;
};

export function PatientDetails({ data }: { data: PatientDetailsData }) {
  const {
    patient,
    appointments,
    visits,
    payments,
    totalServices,
    totalPayments,
    remainingBalance
  } = data;

  const [expandedVisitId, setExpandedVisitId] = useState<number | null>(null);

  return (
    <div className='space-y-6'>
      {/* Patient Info */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Hasta Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <div className='text-sm text-muted-foreground'>
                T.C. Kimlik No
              </div>
              <div className='font-medium'>{patient.nationalId}</div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>Ad Soyad</div>
              <div className='font-medium'>
                {patient.firstName} {patient.lastName}
              </div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>Telefon</div>
              <div className='font-medium'>{patient.phone}</div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>Adres</div>
              <div className='font-medium'>{patient.address || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Finansal Özet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            <div className='p-4 bg-blue-50 dark:bg-blue-950 rounded-lg'>
              <div className='text-sm text-muted-foreground'>Toplam Hizmet</div>
              <div className='text-2xl font-bold'>
                ₺{totalServices.toFixed(2)}
              </div>
            </div>
            <div className='p-4 bg-green-50 dark:bg-green-950 rounded-lg'>
              <div className='text-sm text-muted-foreground'>Ödenen</div>
              <div className='text-2xl font-bold'>
                ₺{totalPayments.toFixed(2)}
              </div>
            </div>
            <div className='p-4 bg-orange-50 dark:bg-orange-950 rounded-lg'>
              <div className='text-sm text-muted-foreground'>Kalan</div>
              <div className='text-2xl font-bold'>
                ₺{remainingBalance.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Randevular ({appointments.length} Kayıt)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              Henüz randevu kaydı bulunmamaktadır
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Doktor</TableHead>
                  <TableHead>Bölüm</TableHead>
                  <TableHead>Notlar</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map(({ appointment, doctor, department }) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {format(
                        appointment.appointmentDate,
                        'dd MMMM yyyy HH:mm',
                        {
                          locale: tr
                        }
                      )}
                    </TableCell>
                    <TableCell>{doctor?.fullName || '-'}</TableCell>
                    <TableCell>{department?.name || '-'}</TableCell>
                    <TableCell>{appointment.notes || '-'}</TableCell>
                    <TableCell>
                      {appointment.status === 'scheduled' ? (
                        <Badge variant='default'>Planlandı</Badge>
                      ) : appointment.status === 'completed' ? (
                        <Badge className='bg-green-500'>Tamamlandı</Badge>
                      ) : appointment.status === 'cancelled' ? (
                        <Badge variant='destructive'>İptal Edildi</Badge>
                      ) : (
                        <Badge variant='secondary'>Gelmedi</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Visit History */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Geliş Geçmişi ({visits.length} Kayıt)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              Henüz geliş kaydı bulunmamaktadır
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Doktor</TableHead>
                  <TableHead>Bölüm</TableHead>
                  <TableHead>Hizmetler</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map(({ visit, doctor, department, services }) => {
                  const isExpanded = expandedVisitId === visit.id;
                  const totalAmount = services.reduce(
                    (sum, s) => sum + s.visitService.totalPrice,
                    0
                  );

                  return (
                    <React.Fragment key={visit.id}>
                      <TableRow>
                        <TableCell>
                          {format(visit.visitDate, 'dd MMMM yyyy HH:mm', {
                            locale: tr
                          })}
                        </TableCell>
                        <TableCell>{doctor?.fullName || '-'}</TableCell>
                        <TableCell>{department?.name || '-'}</TableCell>
                        <TableCell>
                          {services.length > 0 ? (
                            <span className='text-sm'>
                              {services.length} hizmet - ₺
                              {totalAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className='text-sm text-muted-foreground'>
                              Hizmet yok
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.status === 'completed' ? (
                            <Badge className='bg-green-500'>Tamamlandı</Badge>
                          ) : visit.status === 'checked_in' ? (
                            <Badge variant='default'>Giriş Yapıldı</Badge>
                          ) : (
                            <Badge>{visit.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {services.length > 0 && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                setExpandedVisitId(isExpanded ? null : visit.id)
                              }
                            >
                              {isExpanded ? (
                                <ChevronDown className='h-4 w-4' />
                              ) : (
                                <ChevronRight className='h-4 w-4' />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className='bg-muted/50'>
                            <div className='p-4'>
                              <h4 className='font-medium mb-3'>
                                Alınan Hizmetler
                              </h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Hizmet</TableHead>
                                    <TableHead>Adet</TableHead>
                                    <TableHead>Birim Fiyat</TableHead>
                                    <TableHead>Toplam</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {services.map(({ visitService, service }) => (
                                    <TableRow key={visitService.id}>
                                      <TableCell>
                                        {service?.name || 'Bilinmeyen Hizmet'}
                                      </TableCell>
                                      <TableCell>
                                        {visitService.quantity}
                                      </TableCell>
                                      <TableCell>
                                        ₺{visitService.unitPrice.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        ₺{visitService.totalPrice.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow className='bg-blue-50 dark:bg-blue-950/50 font-semibold'>
                                    <TableCell
                                      colSpan={3}
                                      className='text-right'
                                    >
                                      Toplam:
                                    </TableCell>
                                    <TableCell>
                                      ₺{totalAmount.toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Ödeme Geçmişi ({payments.length} Kayıt)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              Henüz ödeme kaydı bulunmamaktadır
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Yöntem</TableHead>
                  <TableHead>Notlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(payment.paymentDate, 'dd MMMM yyyy HH:mm', {
                        locale: tr
                      })}
                    </TableCell>
                    <TableCell className='font-semibold'>
                      ₺{payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {payment.paymentMethod === 'cash'
                        ? 'Nakit'
                        : payment.paymentMethod === 'credit_card'
                        ? 'Kredi Kartı'
                        : payment.paymentMethod === 'debit_card'
                        ? 'Banka Kartı'
                        : 'Sigorta'}
                    </TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
