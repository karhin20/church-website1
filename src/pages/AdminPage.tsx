import { useState } from 'react';
import { useAuth } from '@/admin/auth/useAuth';
import { doSignOut } from '@/admin/auth/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SermonManager from '@/components/admin/SermonManager';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import GalleryManager from '@/components/admin/GalleryManager';

export default function AdminPage() {
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
          <h1 className="text-3xl font-bold text-church-primary">Admin Dashboard</h1>
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
        <Tabs defaultValue="sermons" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sermons">Sermons</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          <TabsContent value="sermons">
            <SermonManager />
          </TabsContent>
          <TabsContent value="announcements">
            <AnnouncementManager />
          </TabsContent>
          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 