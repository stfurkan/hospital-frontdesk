'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function PatientSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || ''
  );

  // Debounce search - wait 500ms after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        params.set('search', searchValue);
        params.set('page', '1'); // Reset to first page on new search
      } else {
        params.delete('search');
      }

      startTransition(() => {
        router.push(`/patients?${params.toString()}`);
      });
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchValue, router, searchParams]);

  return (
    <div className='relative'>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
      <Input
        placeholder='İsim, TC Kimlik No veya telefon ile ara...'
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className='pl-10 pr-4'
        disabled={isPending}
      />
      {isPending && (
        <div className='absolute right-3 top-1/2 -translate-y-1/2'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
        </div>
      )}
    </div>
  );
}
