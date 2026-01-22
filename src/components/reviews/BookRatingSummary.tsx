import { StarRating } from './StarRating';
import { useReviews } from '@/contexts/ReviewContext';

interface BookRatingSummaryProps {
  bookId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BookRatingSummary({ bookId, showCount = true, size = 'sm' }: BookRatingSummaryProps) {
  const { getBookAverageRating } = useReviews();
  const { average, count } = getBookAverageRating(bookId);

  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={average} size={size} />
      {showCount && (
        <span className="text-xs text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  );
}
