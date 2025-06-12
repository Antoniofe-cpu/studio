# test_firebase.py
print("--> 1. Script di test avviato.")

try:
    print("--> 2. Importo le librerie di Firebase...")
    import firebase_admin
    from firebase_admin import credentials
    from firebase_admin import firestore
    print("--> 3. Librerie importate con successo.")

    SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json"
    print(f"--> 4. Uso il file della chiave: '{SERVICE_ACCOUNT_KEY_PATH}'")

    print("--> 5. Sto per leggere il file del certificato...")
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    print("--> 6. File del certificato letto con successo.")

    print("--> 7. Sto per inizializzare l'app Firebase...")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
        print("--> 8. App Firebase inizializzata.")
    else:
        print("--> 8. App Firebase era già inizializzata.")

    print("--> 9. Sto per ottenere il client di Firestore...")
    db = firestore.client()
    print("--> 10. ✅ Connessione a Firestore RIUSCITA!")

except Exception as e:
    print("\n\n❌ ERRORE! Lo script si è bloccato.")
    print("L'ultimo passaggio riuscito è stato quello precedente a questo messaggio.")
    print(f"\nDettagli dell'errore:\n{e}\n")

print("\n--> 11. Script di test terminato.")
