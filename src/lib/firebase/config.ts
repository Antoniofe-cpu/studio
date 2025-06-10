
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Construct Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env."AIzaSyBsup1LANccRepTNF0Y1CoBcfMjnqZGkyw",
  authDomain: process.env."watchgraph-a91fd.firebaseapp.com",
  projectId: process.env."watchgraph-a91fd",
  storageBucket: process.env."watchgraph-a91fd.firebasestorage.app",
  messagingSenderId: process.env."984650741137",
  appId: process.env."1:984650741137:web:861fec7023fe4afbe5d630",
  measurementId: process.env."G-8KZVYL1TGD",
};

// Validate that all required Firebase config values are present
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  console.error(
    'Firebase configuration is incomplete. Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_ variables are set.'
  );
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use getApp() if already initialized
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
