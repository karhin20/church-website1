import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const isDevelopment = import.meta.env.DEV;
const API_URL = isDevelopment ? '' : (import.meta.env.VITE_API_URL || 'https://backend-church.vercel.app');

class FirebaseService {
  private static instance: FirebaseService;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
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

  public initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initialized) {
      return Promise.resolve();
    }

    this.initializationPromise = this.initializeFirebase();
    return this.initializationPromise;
  }

  private async initializeFirebase(): Promise<void> {
    try {
      const url = isDevelopment ? '/api/auth/config' : 'https://backend-church.vercel.app/api/auth/config';
      
      console.log('Fetching Firebase config from:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { config } = await response.json();
      
      if (!config) {
        throw new Error('No config received from server');
      }

      console.log('Received Firebase config');
      
      this.app = initializeApp(config);
      this.analytics = getAnalytics(this.app);
      this.storage = getStorage(this.app);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      
      this.initialized = true;
    } catch (error) {
      this.initializationPromise = null;
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