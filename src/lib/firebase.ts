// Contenuto per: src/lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// La tua configurazione Firebase dal frontend
const firebaseConfig = {
  apiKey: "AIzaSyBsup1LANccRepTNF0Y1CoBcfMjnqZGkyw",
  authDomain: "watchgraph-a91fd.firebaseapp.com",
  projectId: "watchgraph-a91fd",
  storageBucket: "watchgraph-a91fd.firebasestorage.app",
  messagingSenderId: "984650741137",
  appId: "1:984650741137:web:861fec7023fe4afbe5d630",
  measurementId: "G-8KZVYL1TGD"
};

// Inizializza Firebase solo se non è già stato fatto
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

export { db };