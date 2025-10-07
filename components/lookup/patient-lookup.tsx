'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { searchPatientByNationalId } from '@/lib/actions/lookup';
import { toast } from 'sonner';
import { PatientDetails, PatientDetailsData } from './patient-details';

export function PatientLookup() {
  const [nationalId, setNationalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<PatientDetailsData | null>(
    null
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nationalId.length !== 11) {
      toast.error('T.C. Kimlik No 11 haneli olmalıdır');
      return;
    }

    setLoading(true);
    const result = await searchPatientByNationalId(nationalId);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      setPatientData(null);
    } else if (result.data) {
      setPatientData(result.data);
    }
  };

  return (
    <div className='space-y-6'>
      <form onSubmit={handleSearch} className='flex gap-4'>
        <div className='flex-1 space-y-2'>
          <Label htmlFor='nationalId'>T.C. Kimlik No</Label>
          <Input
            id='nationalId'
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder='12345678900'
            maxLength={11}
            pattern='\d{11}'
          />
        </div>
        <div className='flex items-end'>
          <Button type='submit' disabled={loading} className='gap-2'>
            <Search className='h-4 w-4' />
            {loading ? 'Aranıyor...' : 'Sorgula'}
          </Button>
        </div>
      </form>

      {patientData && <PatientDetails data={patientData} />}
    </div>
  );
}
