import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 dark:from-blue-950/50 dark:via-blue-900/50 dark:to-blue-950/50',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
