import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

class FirebaseService {
  private static instance: FirebaseService;
  private initialized = false;
  public auth: any;
  public firestore: any;
  public storage: any;
  public app: any;
  private analytics: any;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async initialize() {
    if (this.initialized) return;

    try {
      const response = await fetch('https://backend-church.vercel.app/config', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { config } = await response.json();
      
      this.app = initializeApp(config);
      this.analytics = getAnalytics(this.app);
      this.storage = getStorage(this.app);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

const firebaseService = FirebaseService.getInstance();

export const initializeFirebase = () => firebaseService.initialize();
export const getFirebaseAuth = () => firebaseService.auth;
export const getFirebaseFirestore = () => firebaseService.firestore;
export const getFirebaseStorage = () => firebaseService.storage;
export const isFirebaseInitialized = () => firebaseService.isInitialized(); 