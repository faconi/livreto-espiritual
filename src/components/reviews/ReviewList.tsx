import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from './StarRating';
import { BookReview } from '@/types';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { useReviews } from '@/contexts/ReviewContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReviewListProps {
  bookId: string;
  currentUserId?: string;
}

export function ReviewList({ bookId, currentUserId }: ReviewListProps) {
  const { getBookReviews, getBookAverageRating, markHelpful } = useReviews();
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  const reviews = getBookReviews(bookId);
  const { average, count } = getBookAverageRating(bookId);

  // Filter out current user's review (shown separately in ReviewForm)
  const otherReviews = reviews.filter(r => r.userId !== currentUserId);

  const handleHelpful = (reviewId: string) => {
    if (helpfulClicked.has(reviewId)) return;
    
    markHelpful(reviewId);
    setHelpfulClicked(prev => new Set([...prev, reviewId]));
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
        <p className="text-sm">Nenhuma avaliação ainda.</p>
        <p className="text-xs mt-1">Seja o primeiro a avaliar este livro!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
        <div className="text-center">
          <p className="text-3xl font-bold">{average.toFixed(1)}</p>
          <StarRating rating={average} size="sm" />
          <p className="text-xs text-muted-foreground mt-1">
            {count} {count === 1 ? 'avaliação' : 'avaliações'}
          </p>
        </div>
        <div className="flex-1">
          <RatingDistribution reviews={reviews} />
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {otherReviews.map((review) => (
          <Card key={review.id} className="border-muted">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={review.userAvatarUrl} />
                  <AvatarFallback className="text-xs">
                    {review.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium text-sm">{review.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  <StarRating rating={review.rating} size="sm" className="mt-1" />
                  
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={helpfulClicked.has(review.id)}
                      onClick={() => handleHelpful(review.id)}
                    >
                      <ThumbsUp size={12} className="mr-1" />
                      Útil {review.helpful ? `(${review.helpful})` : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RatingDistribution({ reviews }: { reviews: BookReview[] }) {
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: (reviews.filter(r => r.rating === stars).length / reviews.length) * 100,
  }));

  return (
    <div className="space-y-1">
      {distribution.map(({ stars, count, percentage }) => (
        <div key={stars} className="flex items-center gap-2 text-xs">
          <span className="w-3">{stars}</span>
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="w-6 text-muted-foreground">{count}</span>
        </div>
      ))}
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
