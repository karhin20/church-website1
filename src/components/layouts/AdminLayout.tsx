import { useAuth } from '@/admin/auth/useAuth';
import { doSignOut } from '@/admin/auth/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await doSignOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-church-background">
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-church-primary">Admin Dashboard</h1>
            <nav className="hidden md:flex space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin')}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/sermons')}
              >
                Sermons
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/announcements')}
              >
                Announcements
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/gallery')}
              >
                Gallery
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.email} ({userRole})
            </span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
} 