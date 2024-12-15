import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
};

// Helper function to get user role
export const getUserRole = async (uid: string): Promise<string | null> => {
  const firestore = getFirebaseFirestore();
  const userDoc = await getDoc(doc(firestore, "users", uid));
  if (!userDoc.exists()) return null;
  return userDoc.data().role;
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const doSignInWithGoogle = async () => {
  try {
    await signOut(getFirebaseAuth());
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    const userDoc = await getDoc(doc(getFirebaseFirestore(), 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(getFirebaseFirestore(), 'users', result.user.uid), {
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
  const result = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  const userDoc = await getDoc(doc(getFirebaseFirestore(), 'users', result.user.uid));
  return { user: result.user, role: userDoc.data()?.role || ROLES.MEMBER };
};

export const doSignOut = () => signOut(getFirebaseAuth());

export const doCreateUserWithEmailAndPassword = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  
  // Create user document
  await setDoc(doc(getFirebaseFirestore(), 'users', userCredential.user.uid), {
    email,
    role: ROLES.MEMBER,
    createdAt: new Date().toISOString(),
  });

  return { user: userCredential.user, role: ROLES.MEMBER };
}; 