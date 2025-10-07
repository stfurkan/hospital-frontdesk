'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PatientCombobox } from '@/components/appointments/patient-combobox';
import { createAppointment } from '@/lib/actions/appointments';
import { getDoctorAvailability } from '@/lib/actions/doctor-availability';
import { getBookedTimes } from '@/lib/actions/get-booked-times';
import { toast } from 'sonner';
import { Doctor, Department } from '@/lib/db/schema';
import { generateTimeSlots, getMinAppointmentDate } from '@/lib/datetime';
import { AlertCircle } from 'lucide-react';

export function CreateAppointmentDialog({
  children,
  doctors,
  departments
}: {
  children: React.ReactNode;
  doctors: { doctor: Doctor; department: Department | null }[];
  departments: Department[];
}) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Filter doctors by selected department
  const filteredDoctors = selectedDepartment
    ? doctors.filter(
        (d) => d.doctor.departmentId === parseInt(selectedDepartment)
      )
    : doctors;

  // Get selected department and doctor names
  const selectedDepartmentName = departments.find(
    (d) => d.id.toString() === selectedDepartment
  )?.name;

  const selectedDoctorName = doctors.find(
    (d) => d.doctor.id.toString() === selectedDoctor
  )?.doctor.fullName;

  // Load available time slots when doctor and date are selected
  const loadAvailableTimeSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    setLoadingTimes(true);
    try {
      const availability = await getDoctorAvailability(parseInt(doctorId));
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();

      const dayAvailability = availability.find(
        (a) => a.dayOfWeek === dayOfWeek && a.isAvailable
      );

      if (!dayAvailability) {
        setAvailableTimeSlots([]);
        toast.warning('Seçili doktor bu gün için müsait değil');
        return;
      }

      const bookedTimes = await getBookedTimes(parseInt(doctorId), date);
      const allSlots = generateTimeSlots();
      const availableSlots = allSlots.filter((slot) => {
        const isInWorkingHours =
          slot >= dayAvailability.startTime && slot < dayAvailability.endTime;
        const isNotBooked = !bookedTimes.includes(slot);
        return isInWorkingHours && isNotBooked;
      });

      setAvailableTimeSlots(availableSlots);

      if (availableSlots.length === 0 && bookedTimes.length > 0) {
        toast.info('Tüm saatler dolu, lütfen başka bir gün seçin');
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      setAvailableTimeSlots([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient('');
    setSelectedDepartment('');
    setSelectedDoctor('');
    setSelectedTime('');
    setAppointmentDate('');
    setNotes('');
    setAvailableTimeSlots([]);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fieldErrors: Record<string, string> = {};

    if (!selectedPatient) fieldErrors.patient = 'Hasta seçmelisiniz';
    if (!selectedDepartment) fieldErrors.department = 'Bölüm seçmelisiniz';
    if (!selectedDoctor) fieldErrors.doctor = 'Doktor seçmelisiniz';
    if (!appointmentDate) fieldErrors.date = 'Randevu tarihi girmelisiniz';
    if (!selectedTime) fieldErrors.time = 'Randevu saati seçmelisiniz';

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set('patientId', selectedPatient);
    formData.set('doctorId', selectedDoctor);
    formData.set('departmentId', selectedDepartment);
    formData.set('appointmentTime', selectedTime);

    const result = await createAppointment(formData);
    if (result.error) {
      toast.error(result.error);
      setErrors({ general: result.error });
    } else {
      toast.success('Randevu başarıyla oluşturuldu');
      resetForm();
      setOpen(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
            <DialogDescription>Hasta için randevu oluşturun</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {errors.general && (
              <div className='flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
                <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400 mt-0.5' />
                <p className='text-sm text-red-800 dark:text-red-300'>
                  {errors.general}
                </p>
              </div>
            )}
            <div className='space-y-2'>
              <Label htmlFor='patientId'>Hasta *</Label>
              <PatientCombobox
                value={selectedPatient}
                onValueChange={setSelectedPatient}
                placeholder='Ad, soyad veya TC Kimlik ile ara...'
              />
              <p className='text-xs text-muted-foreground'>
                💡 Ad, soyad veya TC Kimlik numarası ile arama yapabilirsiniz
              </p>
              {errors.patient && (
                <p className='text-xs text-red-600 dark:text-red-400'>
                  {errors.patient}
                </p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='departmentId'>Bölüm *</Label>
                <Select
                  value={selectedDepartment}
                  onValueChange={(value) => {
                    setSelectedDepartment(value);
                    setSelectedDoctor('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Bölüm seçin'>
                      {selectedDepartmentName || 'Bölüm seçin'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className='text-xs text-red-600 dark:text-red-400'>
                    {errors.department}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='doctorId'>Doktor *</Label>
                <Select
                  value={selectedDoctor}
                  onValueChange={(value) => {
                    setSelectedDoctor(value);
                    setSelectedTime('');
                    if (appointmentDate) {
                      loadAvailableTimeSlots(value, appointmentDate);
                    }
                  }}
                  disabled={!selectedDepartment || filteredDoctors.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Önce bölüm seçin'>
                      {selectedDoctorName ||
                        (!selectedDepartment
                          ? 'Önce bölüm seçin'
                          : filteredDoctors.length === 0
                          ? 'Bu bölümde müsait doktor yok'
                          : 'Doktor seçin')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map(({ doctor }) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDepartment && filteredDoctors.length === 0 && (
                  <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'>
                    <AlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0' />
                    <div>
                      <p className='text-sm font-medium text-amber-800 dark:text-amber-300'>
                        {selectedDepartmentName} bölümünde müsait doktor
                        bulunmuyor
                      </p>
                      <p className='text-xs text-amber-700 dark:text-amber-400 mt-1'>
                        Lütfen başka bir bölüm seçin veya doktor ekleyin.
                      </p>
                    </div>
                  </div>
                )}
                {errors.doctor && (
                  <p className='text-xs text-red-600 dark:text-red-400'>
                    {errors.doctor}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='appointmentDate'>Randevu Tarihi *</Label>
                <Input
                  id='appointmentDate'
                  name='appointmentDate'
                  type='date'
                  min={getMinAppointmentDate()}
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    setSelectedTime('');
                    if (selectedDoctor) {
                      loadAvailableTimeSlots(selectedDoctor, e.target.value);
                    }
                  }}
                  required
                />
                {errors.date && (
                  <p className='text-xs text-red-600 dark:text-red-400'>
                    {errors.date}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='appointmentTime'>Randevu Saati *</Label>
                <Select
                  value={selectedTime}
                  onValueChange={setSelectedTime}
                  disabled={!selectedDoctor || !appointmentDate || loadingTimes}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingTimes
                          ? 'Yükleniyor...'
                          : !selectedDoctor
                          ? 'Önce doktor seçin'
                          : !appointmentDate
                          ? 'Önce tarih seçin'
                          : availableTimeSlots.length === 0
                          ? 'Müsait saat yok'
                          : 'Saat seçin'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.time && (
                  <p className='text-xs text-red-600 dark:text-red-400'>
                    {errors.time}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='notes'>Notlar</Label>
              <Textarea
                id='notes'
                name='notes'
                placeholder='Notlar...'
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button type='submit'>Randevu Oluştur</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
