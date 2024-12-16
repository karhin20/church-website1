import { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth, initializeFirebase, isFirebaseInitialized } from './firebase';
import { getUserRole } from './auth';
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  initialized: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isFirebaseInitialized()) {
        await initializeFirebase();
      }
      setInitialized(true);
    };

    init();
  }, []);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initialized]);

  const value = {
    user,
    userRole,
    loading,
    initialized,
  };

  if (!initialized || loading) {
    return null;
  }

  console.log('Initialized:', initialized);
  console.log('Loading:', loading);
  console.log('User:', user);
  console.log('User Role:', userRole);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 