# Contenuto per: parsers/ai_analyzer.py
from groq import Groq
import json

class GroqAnalyzer:
    def __init__(self, api_key):
        if not api_key or "gsk_" not in api_key:
            self.client = None
            return
        self.client = Groq(api_key=api_key)

    def generate_ai_score(self, deal):
        if not self.client:
            return None, None # Restituisce None se il client non è inizializzato

        print(f"      -> 🧠 [Groq AI] Analisi per: '{deal.get('title')[:30]}...'")
        
        # Costruiamo un prompt dettagliato per l'AI
        prompt_content = f"""
        Analizza il seguente annuncio di un orologio usato e fornisci un punteggio da 0 a 100 e una breve motivazione.
        
        DATI DELL'ANNUNCIO:
        - Titolo: {deal.get('title')}
        - Marca: {deal.get('brand')}
        - Modello: {deal.get('model')}
        - Referenza: {deal.get('referenceNumber')}
        - Prezzo di vendita richiesto: {deal.get('listingPrice')} EUR
        - Valore di mercato stimato (da vendite passate): {deal.get('marketPrice')} EUR
        - Prezzo di listino/mercato grigio (se nuovo): {deal.get('retailPrice')} EUR
        - Fonte annuncio: {deal.get('source')}

        CRITERI DI VALUTAZIONE:
        1.  **Rapporto Prezzo/Valore (Peso maggiore):** Un prezzo di vendita significativamente inferiore al valore di mercato stimato è un ottimo affare e merita un punteggio alto.
        2.  **Liquidità della Marca/Modello:** Marche come Rolex, Patek, AP sono più liquide e l'affare è più "sicuro".
        3.  **Completezza dei Dati:** La presenza di un numero di referenza e di molte immagini aumenta l'affidabilità.

        Fornisci la tua risposta ESCLUSIVAMENTE in formato JSON, con questa struttura:
        {{
          "score": <numero intero da 0 a 100>,
          "rationale": "<una frase che spiega il punteggio, max 15 parole>"
        }}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "Sei un esperto di orologi di lusso. Il tuo compito è analizzare dati di annunci e assegnare un punteggio di 'qualità dell'affare' in modo oggettivo, rispondendo solo in formato JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt_content,
                    }
                ],
                model="llama3-8b-8192",
                temperature=0.2, # Bassa temperatura per risposte più consistenti
                max_tokens=100,
                top_p=1,
                stop=None,
                stream=False,
                response_format={"type": "json_object"}, # Chiede a Llama3 di rispondere in JSON
            )
            
            response_text = chat_completion.choices[0].message.content
            response_json = json.loads(response_text)
            
            score = response_json.get("score")
            rationale = response_json.get("rationale")
            
            print(f"      -> ✅ [Groq AI] Punteggio ricevuto: {score}/100. Motivazione: {rationale}")
            return score, rationale

        except Exception as e:
            print(f"      -> ❌ [Groq AI] Errore API: {e}")
            return None, None
