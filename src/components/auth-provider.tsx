
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Auth } from 'firebase/auth';
import {
  getAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInOrSignUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInOrSignUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(clientAuth, async (user) => {
      setUser(user);
      setLoading(false);

      // Sync token with server-side session
      if (user) {
        const token = await user.getIdToken();
        fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        fetch('/api/auth/logout', { method: 'POST' });
      }
    });

    return () => unsubscribe();
  }, []);

  const signInOrSignUp = async (email: string, pass: string) => {
    setLoading(true);
    try {
        await signInWithEmailAndPassword(clientAuth, email, pass);
    } catch (error: any) {
        // If the user doesn't exist, create a new account.
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                await createUserWithEmailAndPassword(clientAuth, email, pass);
            } catch (signUpError) {
                console.error("Sign up failed after sign in failed:", signUpError);
                setLoading(false);
                throw signUpError; // Re-throw the sign-up error
            }
        } else {
            console.error("Sign in failed with an unexpected error:", error);
            setLoading(false);
            throw error; // Re-throw other sign-in errors
        }
    }
    // onIdTokenChanged will handle setting the user and loading state
  };

  const signOut = async () => {
    setLoading(true);
    await firebaseSignOut(clientAuth);
    // onIdTokenChanged will handle setting the user to null and loading state
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInOrSignUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
