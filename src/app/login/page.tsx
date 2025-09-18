
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';
import { createSession } from '@/lib/actions';
import { auth } from '@/lib/firebase-client';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const formData = new FormData();
      formData.append('idToken', idToken);

      const sessionResult = await createSession(null, formData);

      if (sessionResult.success) {
        toast({
          title: 'Login Berhasil',
          description: 'Anda akan diarahkan ke panel admin.',
        });
        // This sequence ensures the page state is updated with the new cookie
        // before navigating to the protected route.
        router.refresh();
        router.push('/admin01');

      } else {
        throw new Error(sessionResult.message || 'Gagal membuat sesi di server.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Email atau password salah.';
            break;
          default:
            errorMessage = 'Gagal login. Periksa kembali kredensial Anda.';
        }
      } else if (error.message) {
          errorMessage = error.message;
      }
      setError(errorMessage);
      toast({
        title: 'Login Gagal',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false); // Only set loading to false on error
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
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Masuk dengan email dan password admin Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="******"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
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
