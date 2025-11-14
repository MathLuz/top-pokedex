'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

interface PokemonPlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-6xl',
  md: 'text-8xl',
  lg: 'text-9xl',
  xl: 'text-[12rem]'
};

export function PokemonPlaceholder({ className, size = 'md' }: PokemonPlaceholderProps) {
  return (
    <div className={cn(
      'flex items-center justify-center w-full h-full',
      className
    )}>
      <FontAwesomeIcon
        icon={faQuestion}
        className={cn(
          sizeClasses[size],
          'text-gray-800 dark:text-gray-200 transition-colors'
        )}
      />
    </div>
  );
}
