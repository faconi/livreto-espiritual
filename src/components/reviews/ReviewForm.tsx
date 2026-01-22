import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { useReviews } from '@/contexts/ReviewContext';
import { useAuth } from '@/contexts/AuthContext';
import { BookReview } from '@/types';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReviewFormProps {
  bookId: string;
  existingReview?: BookReview;
}

export function ReviewForm({ bookId, existingReview }: ReviewFormProps) {
  const { user } = useAuth();
  const { addReview, updateReview, deleteReview } = useReviews();
  
  const [isEditing, setIsEditing] = useState(!existingReview);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      if (existingReview) {
        updateReview(existingReview.id, { rating, comment });
        setIsEditing(false);
      } else {
        addReview({
          bookId,
          userId: user.id,
          userName: user.socialName || user.fullName,
          userAvatarUrl: user.avatarUrl,
          rating,
          comment,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (existingReview) {
      deleteReview(existingReview.id);
    }
    setDeleteDialogOpen(false);
  };

  const handleCancel = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setIsEditing(false);
    } else {
      setRating(0);
      setComment('');
    }
  };

  // Show existing review in view mode
  if (existingReview && !isEditing) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Sua avaliação</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={14} className="mr-1" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StarRating rating={existingReview.rating} size="md" />
          <p className="mt-2 text-sm text-muted-foreground">{existingReview.comment}</p>
        </CardContent>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir avaliação?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Sua avaliação será removida permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare size={16} />
          {existingReview ? 'Editar avaliação' : 'Deixe sua avaliação'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Classificação *</label>
            <StarRating
              rating={rating}
              interactive
              onChange={setRating}
              size="lg"
            />
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">Clique nas estrelas para avaliar</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comentário (opcional)
            </label>
            <Textarea
              id="comment"
              placeholder="Compartilhe sua experiência com este livro..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            {existingReview && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Publicando...' : existingReview ? 'Atualizar' : 'Publicar avaliação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
