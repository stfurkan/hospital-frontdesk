'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  setDoctorAvailability,
  getDoctorAvailability,
  initializeDefaultAvailability
} from '@/lib/actions/doctor-availability';
import { toast } from 'sonner';
import { Doctor } from '@/lib/db/schema';
import {
  Calendar,
  Clock,
  Loader2,
  Zap,
  Sun,
  Sunrise,
  Sunset
} from 'lucide-react';
import { getTurkishDayName, generateTimeSlots } from '@/lib/datetime';

interface DoctorAvailabilityDialogProps {
  children: React.ReactNode;
  doctor: Doctor;
}

export function DoctorAvailabilityDialog({
  children,
  doctor
}: DoctorAvailabilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<
    Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>
  >([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAvailable, setIsAvailable] = useState(true);
  const timeSlots = generateTimeSlots();

  const loadAvailability = async () => {
    setLoading(true);
    const result = await getDoctorAvailability(doctor.id);
    if ('availability' in result) {
      setAvailability(result.availability);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    const dayAvailability = availability.find((a) => a.dayOfWeek === day);
    if (dayAvailability) {
      setStartTime(dayAvailability.startTime);
      setEndTime(dayAvailability.endTime);
      setIsAvailable(dayAvailability.isAvailable);
    } else {
      setStartTime('09:00');
      setEndTime('17:00');
      setIsAvailable(true);
    }
  };

  const handleSave = async () => {
    if (selectedDay === null) {
      toast.error('Lütfen bir gün seçin');
      return;
    }

    const formData = new FormData();
    formData.set('doctorId', doctor.id.toString());
    formData.set('dayOfWeek', selectedDay.toString());
    formData.set('startTime', startTime);
    formData.set('endTime', endTime);
    formData.set('isAvailable', isAvailable.toString());

    const result = await setDoctorAvailability(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Müsaitlik güncellendi');
      await loadAvailability();
      setSelectedDay(null);
    }
  };

  const handleInitialize = async () => {
    const result = await initializeDefaultAvailability(doctor.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Varsayılan müsaitlik oluşturuldu');
      await loadAvailability();
    }
  };

  const handleQuickSet = (preset: 'full-day' | 'morning' | 'afternoon') => {
    switch (preset) {
      case 'full-day':
        setStartTime('09:00');
        setEndTime('17:00');
        setIsAvailable(true);
        break;
      case 'morning':
        setStartTime('09:00');
        setEndTime('13:00');
        setIsAvailable(true);
        break;
      case 'afternoon':
        setStartTime('13:00');
        setEndTime('17:00');
        setIsAvailable(true);
        break;
    }
  };

  const handleSetAllWeekdays = async () => {
    if (
      !window.confirm(
        'Tüm hafta içi günleri aynı saatlerle ayarlamak istiyor musunuz?'
      )
    ) {
      return;
    }

    const weekdays = [1, 2, 3, 4, 5]; // Mon-Fri
    let successCount = 0;

    for (const day of weekdays) {
      const formData = new FormData();
      formData.set('doctorId', doctor.id.toString());
      formData.set('dayOfWeek', day.toString());
      formData.set('startTime', startTime);
      formData.set('endTime', endTime);
      formData.set('isAvailable', isAvailable.toString());

      const result = await setDoctorAvailability(formData);
      if (!result.error) {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} gün başarıyla güncellendi`);
      await loadAvailability();
      setSelectedDay(null);
    }
  };

  const days = [
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' }
  ];

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-blue-600' />
              Doktor Müsaitlik Yönetimi - {doctor.fullName}
            </DialogTitle>
            <DialogDescription>
              Doktorun çalışma günlerini ve saatlerini ayarlayın
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Current Availability Overview */}
              <div className='space-y-3'>
                <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
                  Mevcut Müsaitlik
                </h3>
                <div className='grid gap-2'>
                  {availability.length === 0 ? (
                    <div className='text-center py-4'>
                      <p className='text-sm text-muted-foreground mb-3'>
                        Henüz müsaitlik tanımlanmamış
                      </p>
                      <Button onClick={handleInitialize} size='sm'>
                        Varsayılan Müsaitlik Oluştur (Hafta İçi 9-17)
                      </Button>
                    </div>
                  ) : (
                    availability.map((avail) => (
                      <button
                        key={avail.dayOfWeek}
                        type='button'
                        onClick={() => handleDaySelect(avail.dayOfWeek)}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                          selectedDay === avail.dayOfWeek
                            ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50 shadow-md'
                            : 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/30 hover:border-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <Calendar className='h-4 w-4 text-blue-600' />
                          <span className='font-medium text-blue-900 dark:text-blue-100'>
                            {getTurkishDayName(avail.dayOfWeek)}
                          </span>
                        </div>
                        <div className='flex items-center gap-4'>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Clock className='h-4 w-4' />
                            <span>
                              {avail.startTime} - {avail.endTime}
                            </span>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              avail.isAvailable
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {avail.isAvailable ? 'Müsait' : 'Müsait Değil'}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Edit Availability */}
              {availability.length > 0 && (
                <>
                  <div className='border-t border-blue-200 dark:border-blue-800 pt-6'>
                    <div className='mb-4'>
                      <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
                        Müsaitlik Düzenle
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Yukarıdaki günlere tıklayarak veya aşağıdan seçerek
                        düzenleyebilirsiniz
                      </p>
                    </div>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label>Gün Seçin</Label>
                        <Select
                          value={selectedDay?.toString() || ''}
                          onValueChange={(value) =>
                            handleDaySelect(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Düzenlemek için gün seçin' />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem
                                key={day.value}
                                value={day.value.toString()}
                              >
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedDay !== null && (
                        <div className='mt-4 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900'>
                          <div className='flex items-center gap-2 mb-4 pb-3 border-b border-blue-200 dark:border-blue-800'>
                            <Calendar className='h-5 w-5 text-blue-600' />
                            <h4 className='font-semibold text-blue-900 dark:text-blue-100'>
                              {getTurkishDayName(selectedDay)} - Düzenleniyor
                            </h4>
                          </div>

                          {/* Quick Presets */}
                          <div className='space-y-2'>
                            <Label>Hızlı Seçim</Label>
                            <div className='grid grid-cols-3 gap-2'>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => handleQuickSet('full-day')}
                                className='flex items-center gap-2'
                              >
                                <Sun className='h-4 w-4' />
                                Tam Gün
                                <span className='text-xs text-muted-foreground'>
                                  (09:00-17:00)
                                </span>
                              </Button>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => handleQuickSet('morning')}
                                className='flex items-center gap-2'
                              >
                                <Sunrise className='h-4 w-4' />
                                Sabah
                                <span className='text-xs text-muted-foreground'>
                                  (09:00-13:00)
                                </span>
                              </Button>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => handleQuickSet('afternoon')}
                                className='flex items-center gap-2'
                              >
                                <Sunset className='h-4 w-4' />
                                Öğleden Sonra
                                <span className='text-xs text-muted-foreground'>
                                  (13:00-17:00)
                                </span>
                              </Button>
                            </div>
                          </div>

                          {/* Time Selection */}
                          <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                              <Label>Başlangıç Saati</Label>
                              <Select
                                value={startTime}
                                onValueChange={setStartTime}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className='max-h-[300px] overflow-y-auto'>
                                  {timeSlots.map((time) => (
                                    <SelectItem
                                      key={`start-${time}`}
                                      value={time}
                                    >
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label>Bitiş Saati</Label>
                              <Select
                                value={endTime}
                                onValueChange={setEndTime}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className='max-h-[300px] overflow-y-auto'>
                                  {timeSlots.map((time) => (
                                    <SelectItem
                                      key={`end-${time}`}
                                      value={time}
                                    >
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Availability Toggle */}
                          <div className='flex items-center justify-between p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50'>
                            <div>
                              <Label
                                htmlFor='available'
                                className='text-base cursor-pointer'
                              >
                                Randevu Alınabilir
                              </Label>
                              <p className='text-sm text-muted-foreground'>
                                {isAvailable
                                  ? 'Bu gün için randevu alınabilir'
                                  : 'Bu gün için randevu alınamaz'}
                              </p>
                            </div>
                            <Switch
                              id='available'
                              checked={isAvailable}
                              onCheckedChange={(checked) => {
                                setIsAvailable(checked);
                              }}
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className='flex gap-2'>
                            <Button onClick={handleSave} className='flex-1'>
                              <Clock className='mr-2 h-4 w-4' />
                              Sadece Bu Günü Kaydet
                            </Button>
                            <Button
                              onClick={handleSetAllWeekdays}
                              variant='secondary'
                              className='flex-1'
                            >
                              <Zap className='mr-2 h-4 w-4' />
                              Tüm Hafta İçi
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
