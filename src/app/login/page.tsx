
// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';

// --- Kredensial Admin ---
// PERINGATAN: Menyimpan kredensial di dalam kode sumber seperti ini tidak aman.
// Ini sebaiknya hanya digunakan untuk pengembangan.
const ADMIN_EMAIL = 'diandra.athasyah@gmail.com';
const ADMIN_PASS = 'rahasia090107';
const ACCESS_CODE = '090107';
// -------------------------

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code !== ACCESS_CODE) {
      const friendlyMessage = 'Kode akses salah. Silakan periksa kembali.';
      setError(friendlyMessage);
      toast({
        title: 'Login Gagal',
        description: friendlyMessage,
        variant: 'destructive',
      });
      return;
    }

    try {
      // Jika kode benar, login menggunakan kredensial admin yang sudah ditentukan
      await signIn(ADMIN_EMAIL, ADMIN_PASS);
      
      const redirectUrl = searchParams.get('redirect') || '/admin01';
      toast({
        title: 'Login Berhasil!',
        description: `Selamat datang kembali! Anda akan diarahkan ke ${redirectUrl}`,
      });
      router.push(redirectUrl);

    } catch (err: any) {
      let friendlyMessage = 'Terjadi kesalahan. Kredensial admin internal mungkin salah atau akun tidak ada.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        friendlyMessage = 'Kredensial admin internal salah. Hubungi developer.';
      }
      setError(friendlyMessage);
      toast({
        title: 'Login Gagal',
        description: friendlyMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <div className="inline-block">
                <Logo />
            </div>
            <p className="text-muted-foreground mt-2">Admin Panel Access</p>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Masukkan kode akses untuk masuk ke panel admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Kode Akses</Label>
                <Input
                  id="access-code"
                  type="password"
                  placeholder="******"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Masuk
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
