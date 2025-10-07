'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset loading state when pathname changes
    setIsLoading(false);
    setProgress(0);
  }, [pathname]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      // Auto complete after 3 seconds max
      timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => setIsLoading(false), 200);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isLoading]);

  // Listen for link clicks to start loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.target) {
        const url = new URL(link.href);
        // Only show loader for internal navigation
        if (
          url.origin === window.location.origin &&
          url.pathname !== pathname
        ) {
          setIsLoading(true);
          setProgress(20);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* Smooth Loading Bar */}
      <div className='fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent'>
        <div
          className='h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out shadow-lg shadow-blue-500/50'
          style={{
            width: `${progress}%`,
            opacity: isLoading ? 1 : 0
          }}
        />
      </div>

      {/* Minimal overlay - no spinner, just subtle blur */}
      {isLoading && (
        <div className='fixed inset-0 z-[9998] bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 backdrop-blur-[2px] pointer-events-none' />
      )}
    </>
  );
}
