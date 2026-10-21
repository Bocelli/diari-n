# 📖 Il Grimorio delle Memorie (Diario Fantasy Personale)

Un'applicazione web accogliente, confortevole e immersiva ("cozy fantasy") pensata per essere il tuo diario personale interattivo.

---

## ✨ Caratteristiche Principali

1. **Design Fantasy & Atmosfera "Cozy"**:
   - Aspetto grafico da **antico libro rilegato in cuoio** con angolari dorati e segnalibro in velluto.
   - Pagine aperte con **texture di pergamena antica** e righe sottili da calligrafia.
   - **Camino scoppiettante procedurale** con suoni rilassanti del fuoco (Web Audio API a zero risorse esterne).
   - Suono autentico di **pagina sfogliata** e del **pennino d'oca** mentre scrivi.
   - Lucciole dorate e luce calda oscillante a lume di candela.

2. **Dettatura Vocale con Microfono (Web Speech API)**:
   - Premi la **Runa di Ascolto** (pulsante circolare con microfono in basso a sinistra).
   - Concedi l'autorizzazione al microfono nel browser.
   - Parla ad alta voce: le tue parole appariranno in tempo reale nel calamaio per poi essere scritte sulla pagina o affidate a Gemini!

3. **Integrazione Intelligente con Google Gemini & Prompt Personalizzati**:
   - **Personaggi / Spiriti Guida preimpostati**:
     - 🎻 **Il Bardo Epico**: Riscrive la tua giornata come una saga o ballata avventurosa.
     - 🕯️ **Il Custode del Focolare**: Uno spirito caldo, empatico e rassicurante che offre ascolto e riflessioni cozy.
     - 📜 **Il Saggio Alchimista**: Distilla insegnamenti profondi e prospettive filosofiche.
     - 🖋️ **L'Amanuense di Corte**: Trascrive fedelmente i tuoi pensieri vocali con prosa nobile e corretta.
   - **Rituali Personalizzati (Custom Prompts)**: Puoi creare e salvare i tuoi prompt di sistema specifici con istruzioni personalizzate.
   - Scelta del modello (Gemini 1.5 Flash, Gemini 2.0 Flash, Gemini 1.5 Pro).
   - Salvataggio sicuro della chiave API in locale nel tuo browser.

4. **Navigazione & Gestione Pagine ("Pagina dopo pagina")**:
   - Sfoglia indietro e avanti con i tasti `◀ Indietro` e `Avanti ▶`.
   - Crea una nuova pergamena intonsa con `📖 Volta Pagina`.
   - Assegna a ogni pagina uno **Stato d'Animo / Clima Interiore** (Magico, Radioso, Malinconico, Epico, Tempesta...).
   - **Indice Generale delle Memorie**: ricerca rapida tra date, testi, titoli e rimozione o riapertura dei capitoli.
   - **Stampa / Salva in PDF**: esporta il tuo diario in formato manoscritto cartaceo con un clic.

---

## 🚀 Come Avviare il Diario

Puoi avviare il diario in due modi semplicissimi su Windows:

### Metodo 1: Doppio Clic (Consigliato)
Fai doppio clic sul file **`avvia_diario.bat`**. 
Si aprirà automaticamente il tuo browser predefinito all'indirizzo `http://localhost:8080/`.

*(L'esecuzione su localhost garantisce che il browser abiliti subito l'uso del microfono per la dettatura vocale).*

### Metodo 2: Apertura Diretta
Puoi anche fare doppio clic direttamente su **`index.html`** per aprirlo in Google Chrome o Microsoft Edge.

---

## 🔑 Come Configurare Gemini (Opzionale)

1. Clicca in alto a destra su **`⚙️ Gemini & Rituali`**.
2. Incolla la tua chiave API (gratuita) ottenibile su [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Clicca su **`✓ Salva Impostazioni`**.
4. Ora puoi cliccare su **`✨ Parla con Gemini`** ogni volta che scrivi o detti un pensiero!
