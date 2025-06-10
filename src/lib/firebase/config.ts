
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
// import { getFirestore, type Firestore } from 'firebase/firestore'; // For later use with user data

// Construct Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBsup1LANccRepTNF0Y1CoBcfMjnqZGkyw",
  authDomain: "watchgraph-a91fd.firebaseapp.com",
  projectId: "watchgraph-a91fd",
  storageBucket: "watchgraph-a91fd.firebasestorage.app",
  messagingSenderId: "984650741137",
  appId: "1:984650741137:web:861fec7023fe4afbe5d630",
  measurementId: "G-8KZVYL1TGD",
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
  // Optionally, you could throw an error here or handle it gracefully
  // For now, we'll log an error, and Firebase initialization might fail or use undefined values.
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
// const db: Firestore = getFirestore(app); // For later use

export { app, auth }; // db
