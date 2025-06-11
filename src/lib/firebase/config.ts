
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ATTENZIONE: Sostituisci questi segnaposto con i valori REALI
// della configurazione del tuo progetto Firebase "watchgraph".
// Troverai questi valori nella console Firebase:
// Impostazioni progetto > Generali > Le tue app > Seleziona la tua app Web > Configurazione SDK Firebase (opzione "Config").
const firebaseConfig = {
  apiKey: "INSERISCI_LA_TUA_API_KEY_QUI",
  authDomain: "INSERISCI_IL_TUO_PROJECT_ID_QUI.firebaseapp.com",
  projectId: "INSERISCI_IL_TUO_PROJECT_ID_QUI",
  storageBucket: "INSERISCI_IL_TUO_PROJECT_ID_QUI.appspot.com",
  messagingSenderId: "INSERISCI_IL_TUO_MESSAGING_SENDER_ID_QUI",
  appId: "INSERISCI_LA_TUA_APP_ID_QUI",
  measurementId: "INSERISCI_IL_TUO_MEASUREMENT_ID_QUI" // Opzionale, ma se presente nella tua config, includilo
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
