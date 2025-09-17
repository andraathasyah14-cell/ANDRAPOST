
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Auth } from 'firebase/auth';
import {
  getAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
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

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(clientAuth, email, pass);
    // onIdTokenChanged will handle setting the user and loading state
  };

  const signOut = async () => {
    setLoading(true);
    await firebaseSignOut(clientAuth);
    // onIdTokenChanged will handle setting the user to null and loading state
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
