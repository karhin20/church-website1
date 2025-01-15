import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Loading from '@/admin/auth/Loading';
import { PWAPrompt } from '@/components/PWAPrompt';
import { LiveServiceSection } from "@/components/sections/LiveServiceSection";
import { OfflineServiceSection } from "@/components/sections/OfflineServiceSection";

// Lazy load components that need Firebase
const AuthProvider = lazy(() => import('@/admin/auth/useAuth').then(module => ({ default: module.AuthProvider })));
const ChatProviderLazy = lazy(() => import('@/contexts/ChatContext').then(module => ({ default: module.ChatProvider })));
const AdminLayout = lazy(() => import('@/components/layouts/AdminLayout'));
const DashboardOverview = lazy(() => import('@/pages/admin/DashboardOverview'));
const SermonManager = lazy(() => import('@/components/admin/SermonManager'));
const AnnouncementManager = lazy(() => import('@/components/admin/AnnouncementManager'));
const GalleryManager = lazy(() => import('@/components/admin/GalleryManager'));

import HymnPage from "./pages/HymnPage";
import Index from "./pages/Index";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Chat from './pages/Chat';
import HymnHome from './pages/hymnHome';
import BiblePage from './pages/Bible';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ChatProviderLazy>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/chat" element={<Chat />} />            
            <Route path="/hymn/:number" element={<HymnPage />} />
            <Route path="/hymns" element={<HymnHome />} />
            <Route path="/bible" element={<BiblePage />} />
            <Route path="/live" element={<OfflineServiceSection />} />
            {/*<Route path="/live" element={<LiveServiceSection />} />*/}

            {/* Protected routes */}
            <Route path="/admin/*" element={
              <Suspense fallback={<Loading />}>
                <AuthProvider>
                  <AdminLayout />
                </AuthProvider>
              </Suspense>
            }>
              <Route index element={<DashboardOverview />} />
              <Route path="sermons" element={<SermonManager />} />
              <Route path="announcements" element={<AnnouncementManager />} />
              <Route path="gallery" element={<GalleryManager />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <PWAPrompt />
        </ChatProviderLazy>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;