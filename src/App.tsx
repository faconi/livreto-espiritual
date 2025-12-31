import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import BookDetail from "./pages/BookDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import MyLoans from "./pages/MyLoans";
import AdminDashboard from "./pages/admin/AdminDashboard";
import BookForm from "./pages/admin/BookForm";
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
      <Route path="/catalogo" element={
        <ProtectedRoute><Catalog /></ProtectedRoute>
      } />
      <Route path="/livro/:id" element={
        <ProtectedRoute><BookDetail /></ProtectedRoute>
      } />
      <Route path="/carrinho" element={
        <ProtectedRoute><Cart /></ProtectedRoute>
      } />
      <Route path="/perfil" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/meus-emprestimos" element={
        <ProtectedRoute><MyLoans /></ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
      <Route path="/admin/livros/novo" element={
        <AdminRoute><BookForm /></AdminRoute>
      } />
      
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
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
