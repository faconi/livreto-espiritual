import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 40, text: 'text-3xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
        <div className="relative gradient-primary p-2 rounded-full">
          <Leaf className="text-primary-foreground" size={sizes[size].icon} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn('font-serif font-bold text-primary', sizes[size].text)}>
            Evangelho
          </span>
          <span className="text-xs text-muted-foreground -mt-0.5">
            de Cristo
          </span>
        </div>
      )}
    </div>
  );
}
