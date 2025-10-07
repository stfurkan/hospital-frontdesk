'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

export function AppointmentSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  );
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        params.set('search', searchValue);
        params.set('page', '1'); // Reset to first page on new search
      } else {
        params.delete('search');
      }

      router.push(`/appointments?${params.toString()}`);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, router, searchParams]);

  return (
    <div className='relative w-full sm:w-80'>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
      <Input
        type='text'
        placeholder='Hasta, doktor veya bölüm ara...'
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className='pl-10 pr-10'
      />
      {isSearching && (
        <Loader2 className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin' />
      )}
    </div>
  );
}
