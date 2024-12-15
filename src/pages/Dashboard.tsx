import { useAuth } from '@/admin/auth/useAuth';
import { doSignOut } from '@/admin/auth/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await doSignOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-church-background">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-church-primary">Dashboard</h1>
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
        {/* Add your dashboard content here */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            {/* Dashboard content */}
          </div>
        </div>
      </main>
    </div>
  );
} 