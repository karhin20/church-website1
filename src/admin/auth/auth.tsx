import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Custom error for unauthorized roles
export class UnauthorizedRoleError extends Error {
  constructor(message = "Unauthorized role") {
    super(message);
    this.name = "UnauthorizedRoleError";
  }
}

// Roles configuration
export const ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const doSignInWithGoogle = async () => {
  try {
    const auth = getFirebaseAuth();
    const firestore = getFirebaseFirestore();
    
    await signOut(auth);
    const result = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(firestore, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(firestore, 'users', result.user.uid), {
        email: result.user.email,
        role: ROLES.MEMBER,
        createdAt: new Date().toISOString(),
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      });
      return { user: result.user, role: ROLES.MEMBER };
    }
    
    return { user: result.user, role: userDoc.data().role };
  } catch (error: any) {
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in popup was closed. Please try again.');
    }
    throw error;
  }
};

export const doSignInWithEmailAndPassword = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();
  
  const result = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(firestore, 'users', result.user.uid));
  return { user: result.user, role: userDoc.data()?.role || ROLES.MEMBER };
};

export const doSignOut = () => {
  const auth = getFirebaseAuth();
  return signOut(auth);
};

export const doCreateUserWithEmailAndPassword = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create user document
  await setDoc(doc(firestore, 'users', userCredential.user.uid), {
    email,
    role: ROLES.MEMBER,
    createdAt: new Date().toISOString(),
  });

  return { user: userCredential.user, role: ROLES.MEMBER };
};

// Helper function to check if user has required role
export const checkUserRole = async (uid: string, allowedRoles: string[]): Promise<boolean> => {
  const firestore = getFirebaseFirestore();
  const userDoc = await getDoc(doc(firestore, "users", uid));
  if (!userDoc.exists()) return false;
  
  const userData = userDoc.data();
  return allowedRoles.includes(userData.role);
};

// Helper function to get user role
export const getUserRole = async (uid: string): Promise<string | null> => {
  const firestore = getFirebaseFirestore();
  const userDoc = await getDoc(doc(firestore, "users", uid));
  if (!userDoc.exists()) return null;
  
  return userDoc.data().role;
};
