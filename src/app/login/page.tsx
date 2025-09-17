
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';
import { handleLogin } from '@/lib/actions';
import Cookies from 'js-cookie';

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
  const [state, formAction] = useActionState(handleLogin, initialState);
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (Cookies.get('__session') === 'true') {
      router.replace('/admin01');
    }
  }, [router]);

  // Handle form submission result
  useEffect(() => {
    if (state.success) {
      // Set cookie on success and redirect
      Cookies.set('__session', 'true', { expires: 5, path: '/' }); 
      router.push('/admin01');
      router.refresh(); 
    } else if (state.message && !state.success) {
      // Show error toast on failure
      toast({
        title: 'Login Gagal',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, router, toast]);
  
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
            <CardDescription>Masukkan kode akses 090107 untuk masuk ke panel admin.</CardDescription>
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
