'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon: IconDefinition;
  title: string;
  subtitle?: string;
  iconColor?: string;
  centered?: boolean;
  className?: string;
}

export function PageHeader({ 
  icon, 
  title, 
  subtitle, 
  iconColor = 'text-blue-500',
  centered = false,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', centered && 'text-center', className)}>
      <h1 className={cn(
        'text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-3',
        centered && 'justify-center'
      )}>
        <FontAwesomeIcon icon={icon} className={iconColor} />
        {title}
      </h1>
      {subtitle && (
        <p className={cn(
          'text-zinc-600 dark:text-zinc-400',
          centered ? 'text-lg max-w-2xl mx-auto' : 'text-base'
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
