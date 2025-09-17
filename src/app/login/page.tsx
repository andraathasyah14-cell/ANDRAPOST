
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';
import { handleLogin } from '@/lib/actions';
import Cookies from 'js-cookie';
import { useAuth } from '@/components/auth-provider';

const initialState = {
    success: false,
    message: '',
    errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
     <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="mr-2 h-4 w-4" />
        )}
        Masuk
      </Button>
  );
}


export default function LoginPage() {
  const { user, isInitiallyLoading } = useAuth();
  const [state, formAction] = useActionState(handleLogin, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (isInitiallyLoading) {
      return; // Wait until auth state is confirmed
    }

    // 1. If user is already authenticated (e.g., from a previous session), redirect them.
    if (user?.isAdmin) {
      router.replace('/admin01');
      return;
    }

    // 2. Handle the result of the login form submission.
    if (state.success) {
      // Set the session cookie. The AuthProvider will detect this change and update the user state.
      Cookies.set('__session', 'true', { expires: 5, path: '/' }); 
      
      // Now redirect.
      const redirectUrl = searchParams.get('redirect') || '/admin01';
      router.push(redirectUrl);
      router.refresh(); // Crucial to update server-recognized state and re-render header, etc.
    } else if (state.message) {
      // 3. If there's an error message from the server, show it.
      toast({
        title: 'Login Gagal',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, user, isInitiallyLoading, router, searchParams, toast]);
  

  // Show a loading state or nothing until auth is checked
  if (isInitiallyLoading || user) {
     return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
            <CardTitle>Login Admin</CardTitle>
            <CardDescription>Masukkan kode akses untuk masuk ke panel admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Kode Akses</Label>
                <Input
                  id="code"
                  name="code"
                  type="password"
                  placeholder="******"
                  required
                />
                 {state?.errors?.code && <p className="text-sm text-destructive">{state.errors.code[0]}</p>}
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
