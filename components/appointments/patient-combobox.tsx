'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { getRecentPatients, searchPatients } from '@/lib/actions/patients';

export interface PatientOption {
  id: number;
  firstName: string;
  lastName: string;
  nationalId: string;
}

interface PatientComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function PatientCombobox({
  value,
  onValueChange,
  placeholder = 'Hasta seçin'
}: PatientComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [patients, setPatients] = React.useState<PatientOption[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedPatient, setSelectedPatient] =
    React.useState<PatientOption | null>(null);

  // Load recent patients on mount and when popover opens
  React.useEffect(() => {
    if (open && searchQuery === '') {
      loadRecentPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounced search
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      loadRecentPatients();
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPatients(searchQuery, 10);
      setPatients(results);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRecentPatients = async () => {
    setIsSearching(true);
    const recent = await getRecentPatients(5);
    setPatients(recent);
    setIsSearching(false);
  };

  // Update selected patient when value changes
  React.useEffect(() => {
    if (value && patients.length > 0) {
      const patient = patients.find((p) => p.id.toString() === value);
      if (patient) {
        setSelectedPatient(patient);
      }
    } else if (!value) {
      setSelectedPatient(null);
    }
  }, [value, patients]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
        >
          {selectedPatient ? (
            <span>
              {selectedPatient.firstName} {selectedPatient.lastName}{' '}
              <span className='text-muted-foreground'>
                ({selectedPatient.nationalId})
              </span>
            </span>
          ) : (
            <span className='text-muted-foreground'>{placeholder}</span>
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[400px] p-0 border-2 border-blue-200 dark:border-blue-900 bg-white dark:bg-gray-950 shadow-2xl'
        align='start'
      >
        <div className='flex items-center border-b border-border px-3 transition-all duration-200 focus-within:bg-accent/50 focus-within:border-blue-400 dark:focus-within:border-blue-600'>
          {isSearching ? (
            <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin opacity-50' />
          ) : (
            <Search className='mr-2 h-4 w-4 shrink-0 opacity-50 transition-opacity focus-within:opacity-100' />
          )}
          <Input
            placeholder='Ad, soyad veya TC Kimlik ile ara...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='h-11 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 outline-none ring-0'
            autoFocus
          />
        </div>
        <div className='max-h-[300px] overflow-y-auto p-1'>
          {patients.length === 0 ? (
            <div className='py-6 text-center text-sm text-muted-foreground'>
              {searchQuery ? 'Hasta bulunamadı' : 'Son eklenen hasta yok'}
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                  value === patient.id.toString() && 'bg-accent'
                )}
                onClick={() => {
                  onValueChange(patient.id.toString());
                  setSelectedPatient(patient);
                  setOpen(false);
                  setSearchQuery('');
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === patient.id.toString()
                      ? 'opacity-100'
                      : 'opacity-0'
                  )}
                />
                <div className='flex-1'>
                  <div className='font-medium'>
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    TC: {patient.nationalId}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {patients.length > 0 && (
          <div className='border-t p-2 text-xs text-muted-foreground text-center'>
            {searchQuery
              ? `${patients.length} hasta bulundu`
              : `Son ${patients.length} hasta gösteriliyor`}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
