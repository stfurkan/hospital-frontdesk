export default function DashboardLoading() {
  return (
    <main className='container mx-auto p-6 min-h-[calc(100vh-4rem)] flex items-center justify-center'>
      <div className='flex flex-col items-center gap-6'>
        {/* Animated pulse dots */}
        <div className='flex gap-3'>
          <div
            className='w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse-dot'
            style={{ animationDelay: '0ms' }}
          />
          <div
            className='w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse-dot'
            style={{ animationDelay: '150ms' }}
          />
          <div
            className='w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 animate-pulse-dot'
            style={{ animationDelay: '300ms' }}
          />
        </div>

        {/* Loading text with animation */}
        <div className='flex items-center gap-2'>
          <p className='text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-pulse'>
            Yükleniyor
          </p>
          <span className='flex gap-1'>
            <span className='animate-dot-flashing'>.</span>
            <span
              className='animate-dot-flashing'
              style={{ animationDelay: '0.2s' }}
            >
              .
            </span>
            <span
              className='animate-dot-flashing'
              style={{ animationDelay: '0.4s' }}
            >
              .
            </span>
          </span>
        </div>

        {/* Decorative animated circles */}
        <div className='relative w-24 h-24'>
          <div className='absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900' />
          <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 animate-spin' />
          <div className='absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin-slow' />
          <div className='absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 dark:border-t-purple-400 animate-spin-reverse' />
        </div>
      </div>
    </main>
  );
}
