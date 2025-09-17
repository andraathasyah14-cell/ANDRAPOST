
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

// This user type is now a simple object, not a Firebase User
interface User {
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isInitiallyLoading: boolean; // Renamed for clarity
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isInitiallyLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitiallyLoading, setInitiallyLoading] = useState(true);

  useEffect(() => {
    // Check for the session cookie on initial load
    const sessionCookie = Cookies.get('__session');
    if (sessionCookie) {
      // In a real app, you might want to verify this cookie against a server endpoint
      // For this simplified version, its presence is enough to assume the user is an admin
      setUser({ isAdmin: true });
    }
    setInitiallyLoading(false);

    // This listener ensures that if the cookie is set/cleared in another tab,
    // the auth state is updated across all tabs.
    const handleStorageChange = () => {
        const sessionCookie = Cookies.get('__session');
        if (sessionCookie) {
            setUser({ isAdmin: true });
        } else {
            setUser(null);
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, []);


  return (
    <AuthContext.Provider value={{ user, isInitiallyLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
