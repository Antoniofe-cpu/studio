
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ATTENZIONE: Sostituisci questi segnaposto con i valori REALI
// della configurazione del tuo progetto Firebase "watchgraph".
// Troverai questi valori nella console Firebase:
// Impostazioni progetto > Generali > Le tue app > Seleziona la tua app Web > Configurazione SDK Firebase (opzione "Config").
const firebaseConfig = {
  apiKey: "AIzaSyBsup1LANccRepTNF0Y1CoBcfMjnqZGkyw",
  authDomain: "watchgraph-a91fd.firebaseapp.com",
  projectId: "watchgraph-a91fd",
  storageBucket: "watchgraph-a91fd.firebasestorage.app",
  messagingSenderId: "984650741137",
  appId: "1:984650741137:web:861fec7023fe4afbe5d630",
  measurementId: "G-8KZVYL1TGD" // Opzionale, ma se presente nella tua config, includilo
};

// Inizializza Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
