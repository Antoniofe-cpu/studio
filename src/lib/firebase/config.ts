
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsup1LANccRepTNF0Y1CoBcfMjnqZGkyw",
  authDomain: "watchgraph-a91fd.firebaseapp.com",
  projectId: "watchgraph-a91fd",
  storageBucket: "watchgraph-a91fd.firebasestorage.app",
  messagingSenderId: "984650741137",
  appId: "1:984650741137:web:861fec7023fe4afbe5d630",
  measurementId: "G-8KZVYL1TGD"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
