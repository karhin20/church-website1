import { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth, initializeFirebase, isFirebaseInitialized } from './firebase';
import { getUserRole } from './auth';
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeFirebase();
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

      return unsubscribe;
    };

    init();
  }, []);

  const value = {
    user,
    userRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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