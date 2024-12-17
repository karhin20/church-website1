import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Loading from '@/admin/auth/Loading';

// Lazy load components that need Firebase
const AuthProvider = lazy(() => import('@/admin/auth/useAuth').then(module => ({ default: module.AuthProvider })));
const ChatProviderLazy = lazy(() => import('@/contexts/ChatContext').then(module => ({ default: module.ChatProvider })));
const AdminLayout = lazy(() => import('@/components/layouts/AdminLayout'));
const DashboardOverview = lazy(() => import('@/pages/admin/DashboardOverview'));
const SermonManager = lazy(() => import('@/components/admin/SermonManager'));
const AnnouncementManager = lazy(() => import('@/components/admin/AnnouncementManager'));
const GalleryManager = lazy(() => import('@/components/admin/GalleryManager'));

// Immediately load components that don't need Firebase
import Index from "./pages/Index";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Chat from './pages/Chat';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ChatProviderLazy>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/chat" element={<Chat />} />

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
        </ChatProviderLazy>
      </Router>
    </QueryClientProvider>
  );
}

export default App;