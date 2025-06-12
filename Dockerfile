# Immagine base ufficiale di Playwright con Python, aggiornata alla versione corretta
FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy

# Imposta la cartella di lavoro
WORKDIR /app

# Copia e installa le dipendenze
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il resto del codice
COPY . .

# Comando di avvio
CMD ["python3", "orchestrator.py"]
