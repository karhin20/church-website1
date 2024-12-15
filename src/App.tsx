import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatProvider } from '@/contexts/ChatContext';
import { AuthProvider } from '@/admin/auth/useAuth';
import ChatInterface from '@/components/ChatInterface';
import { initializeFirebase } from '@/admin/auth/firebase';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import { ProtectedRoute } from './admin/auth/ProtectedRoute';
import { ROLES } from './admin/auth/auth';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from '@/components/layouts/AdminLayout';
import DashboardOverview from '@/pages/admin/DashboardOverview';
import SermonManager from '@/components/admin/SermonManager';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import GalleryManager from '@/components/admin/GalleryManager';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

function App() {
  useEffect(() => {
    const init = async () => {
      try {
        await initializeFirebase();
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
      }
    };
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.MEMBER,ROLES.ADMIN]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="sermons" element={<SermonManager />} />
                <Route path="announcements" element={<AnnouncementManager />} />
                <Route path="gallery" element={<GalleryManager />} />
                <Route path="chat" element={<ChatInterface />} />
              </Route>

              {/* Member Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={[ROLES.MEMBER, ROLES.ADMIN]}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;