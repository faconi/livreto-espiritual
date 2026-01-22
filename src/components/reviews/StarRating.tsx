import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if ((e.key === 'Enter' || e.key === ' ') && interactive && onChange) {
      e.preventDefault();
      onChange(index + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const filled = index < Math.floor(rating);
        const halfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'transition-colors focus:outline-none',
              interactive && 'cursor-pointer hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary rounded',
              !interactive && 'cursor-default'
            )}
            aria-label={interactive ? `Dar ${index + 1} estrelas` : undefined}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled || halfFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted text-muted-foreground/40'
              )}
            />
          </button>
        );
      })}
      {showValue && rating > 0 && (
        <span className="ml-1.5 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
