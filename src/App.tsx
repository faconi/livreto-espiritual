import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ActivityProvider } from "@/contexts/ActivityContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import BookDetail from "./pages/BookDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import MyBooks from "./pages/MyBooks";
import MyActivities from "./pages/MyActivities";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLoans from "./pages/admin/AdminLoans";
import AdminSales from "./pages/admin/AdminSales";
import AdminPendingConfirmations from "./pages/admin/AdminPendingConfirmations";
import AdminSettings from "./pages/admin/AdminSettings";
import BookForm from "./pages/admin/BookForm";
import BookDrafts from "./pages/admin/BookDrafts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/catalogo" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
      <Route path="/livro/:id" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
      <Route path="/carrinho" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/meus-livros" element={<ProtectedRoute><MyBooks /></ProtectedRoute>} />
      <Route path="/meus-emprestimos" element={<Navigate to="/meus-livros" replace />} />
      <Route path="/minhas-atividades" element={<ProtectedRoute><MyActivities /></ProtectedRoute>} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/livros" element={<AdminRoute><AdminBooks /></AdminRoute>} />
      <Route path="/admin/livros/novo" element={<AdminRoute><BookForm /></AdminRoute>} />
      <Route path="/admin/livros/:id/editar" element={<AdminRoute><BookForm /></AdminRoute>} />
      <Route path="/admin/usuarios" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/emprestimos" element={<AdminRoute><AdminLoans /></AdminRoute>} />
      <Route path="/admin/vendas" element={<AdminRoute><AdminSales /></AdminRoute>} />
      <Route path="/admin/pendencias" element={<AdminRoute><AdminPendingConfirmations /></AdminRoute>} />
      <Route path="/admin/configuracoes" element={<AdminRoute><AdminSettings /></AdminRoute>} />
      <Route path="/admin/livros/rascunhos" element={<AdminRoute><BookDrafts /></AdminRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <ActivityProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ActivityProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
