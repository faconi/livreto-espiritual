-- =============================================
-- TRIGGERS PARA CONTROLE AUTOMÁTICO DE ESTOQUE
-- =============================================

-- Função para decrementar estoque quando empréstimo é ativado
CREATE OR REPLACE FUNCTION public.handle_loan_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Novo empréstimo ativado: decrementar estoque
  IF (TG_OP = 'INSERT' AND NEW.status = 'active') THEN
    UPDATE books 
    SET available_for_loan = GREATEST(0, available_for_loan - 1)
    WHERE id = NEW.book_id;
    RETURN NEW;
  END IF;

  -- Atualização de status
  IF (TG_OP = 'UPDATE') THEN
    -- Empréstimo recém ativado (de pending para active): decrementar
    IF (OLD.status = 'pending' AND NEW.status = 'active') THEN
      UPDATE books 
      SET available_for_loan = GREATEST(0, available_for_loan - 1)
      WHERE id = NEW.book_id;
    END IF;

    -- Empréstimo devolvido: incrementar estoque
    IF (OLD.status IN ('active', 'overdue', 'return_pending', 'renewal_pending') AND NEW.status = 'returned') THEN
      UPDATE books 
      SET available_for_loan = available_for_loan + 1
      WHERE id = NEW.book_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para empréstimos
DROP TRIGGER IF EXISTS trigger_loan_stock ON public.loans;
CREATE TRIGGER trigger_loan_stock
AFTER INSERT OR UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.handle_loan_stock();

-- =============================================
-- Função para atualizar estoque de vendas
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_sale_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nova venda criada com status pending ou confirmed: decrementar estoque
  IF (TG_OP = 'INSERT' AND NEW.status IN ('pending', 'confirmed')) THEN
    UPDATE books 
    SET available_for_sale = GREATEST(0, available_for_sale - NEW.quantity)
    WHERE id = NEW.book_id;
    RETURN NEW;
  END IF;

  -- Atualização de status
  IF (TG_OP = 'UPDATE') THEN
    -- Venda cancelada: devolver ao estoque
    IF (OLD.status IN ('pending', 'confirmed') AND NEW.status = 'cancelled') THEN
      UPDATE books 
      SET available_for_sale = available_for_sale + NEW.quantity
      WHERE id = NEW.book_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para vendas
DROP TRIGGER IF EXISTS trigger_sale_stock ON public.sales;
CREATE TRIGGER trigger_sale_stock
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_sale_stock();