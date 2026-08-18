import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBGz2sm0h2MFkRLdJfUtY3mn4ScmNSa3jo',
  authDomain: 'delphi-nexus.firebaseapp.com',
  projectId: 'delphi-nexus',
  storageBucket: 'delphi-nexus.firebasestorage.app',
  messagingSenderId: '107156751662',
  appId: '1:107156751662:web:404136098de0d32e61a6bf',
  measurementId: 'G-FCXVKYM8VF',
};

let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let analytics: Analytics | null = null;

try {
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Firebase not initialized.', error);
}

export { auth, db, googleProvider, analytics };
