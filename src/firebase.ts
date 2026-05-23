import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBGz2sm0h2MFkRLdJfUtY3mn4ScmNSa3jo",
  authDomain: "delphi-nexus.firebaseapp.com",
  projectId: "delphi-nexus",
  storageBucket: "delphi-nexus.firebasestorage.app",
  messagingSenderId: "107156751662",
  appId: "1:107156751662:web:404136098de0d32e61a6bf",
  measurementId: "G-FCXVKYM8VF"
};

let app, auth: any = null, db: any = null, googleProvider: any = null, analytics: any = null;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn("Firebase not initialized.", error);
}

export { auth, db, googleProvider, analytics };