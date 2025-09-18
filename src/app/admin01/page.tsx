
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogout } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const onLogout = async () => {
    await handleLogout();
    router.push('/login');
  };
  
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold">Selamat Datang, Admin!</h1>
        <p className="text-muted-foreground mt-4">
          Anda berhasil masuk ke Panel Admin. Di sini Anda akan dapat mengelola semua konten website.
        </p>
        <p className="mt-2">Email: {user.email}</p>
        
        <div className="mt-8">
          <Button onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
