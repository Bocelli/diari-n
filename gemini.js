/**
 * Gemini API Client per il Grimorio Fantasy
 * Gestisce l'interazione con Google Gemini API e i prompt personalizzati
 */

class FantasyGeminiClient {
    constructor() {
        this.storageKey = 'fantasy_diary_gemini_key';
        this.modelKey = 'fantasy_diary_gemini_model';
        this.promptsKey = 'fantasy_diary_custom_prompts';
        this.activePromptKey = 'fantasy_diary_active_prompt_id';

        this.apiKey = localStorage.getItem(this.storageKey) || '';
        this.selectedModel = localStorage.getItem(this.modelKey) || 'gemini-1.5-flash';

        this.defaultPersonas = [
            {
                id: 'bard',
                name: 'Il Bardo Epico',
                icon: '🎻',
                description: 'Trasforma la tua giornata in una cronaca avventurosa, epica e poetica.',
                systemPrompt: `Sei il Bardo Cantore di un antico regno fantasy. Il tuo compito è prendere i pensieri, le confessioni o la cronaca quotidiana dell'utente e trasformarli in una splendida pagina di diario o cronaca fantasy. Usa un tono suggestivo, avventuroso ed evocativo, ma mantieni fedeli le emozioni e le sfide reali espresse dall'utente (es. lavoro, studio, fatica o gioie trasformate in metafore epiche). Concludi con un augurio o una riflessione poetica. Rispondi in italiano.`
            },
            {
                id: 'cozy_spirit',
                name: 'Il Custode del Focolare (Cozy)',
                icon: '🕯️',
                description: 'Uno spirito caloroso, empatico e rassicurante che lenisce i tuoi pensieri.',
                systemPrompt: `Sei il Custode del Focolare, uno spirito buono e saggio che vive tra le pagine di questo diario fatato. Parla con calore, dolcezza ed empatia. Ascolta ciò che l'utente ha raccontato, rielabora con cura i suoi sentimenti, offri comprensione sincera, una tazza di tisana metaforica e una riflessione rincuorante per la notte. Rispondi in italiano.`
            },
            {
                id: 'sage_philosopher',
                name: 'Il Saggio Alchimista',
                icon: '📜',
                description: 'Estrae lezioni profonde, riflessioni stoiche ed evoluzione interiore.',
                systemPrompt: `Sei un antico studioso ermetico e alchimista dello spirito. Leggi le parole dell'utente e aiutalo a distillare 'l'oro' dalle fatiche della vita quotidiana. Estrai una riflessione filosofica profonda, una massima di saggezza o una prospettiva illuminante sugli accadimenti descritti. Rispondi in italiano con tono nobile e profondo.`
            },
            {
                id: 'amanuensis',
                name: 'L\'Amanuense di Corte',
                icon: '🖋️',
                description: 'Trascrizione fedele, raffinata e formattata con stile calligrafico nobiliare.',
                systemPrompt: `Sei l'amanuense personale dell'autore. Il tuo compito è prendere il flusso di pensieri o la trascrizione vocale dell'utente e formattarla in modo impeccabile, chiaro e letterario, senza stravolgere minimamente il significato né aggiungere elementi di fantasia se non richiesti. Organizza il testo in paragrafi fluidi, correggi refusi orali e restituisci una prosa elegante e leggibile. Rispondi in italiano.`
            }
        ];

        this.customPrompts = this.loadCustomPrompts();
        this.activePromptId = localStorage.getItem(this.activePromptKey) || 'bard';
    }

    setApiKey(key) {
        this.apiKey = (key || '').trim();
        localStorage.setItem(this.storageKey, this.apiKey);
    }

    getApiKey() {
        return this.apiKey;
    }

    setModel(model) {
        this.selectedModel = model;
        localStorage.setItem(this.modelKey, model);
    }

    getModel() {
        return this.selectedModel;
    }

    loadCustomPrompts() {
        try {
            const saved = localStorage.getItem(this.promptsKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveCustomPrompts(prompts) {
        this.customPrompts = prompts;
        localStorage.setItem(this.promptsKey, JSON.stringify(prompts));
    }

    getAllPersonas() {
        return [...this.defaultPersonas, ...this.customPrompts];
    }

    getActivePersona() {
        const all = this.getAllPersonas();
        return all.find(p => p.id === this.activePromptId) || this.defaultPersonas[0];
    }

    setActivePersona(id) {
        this.activePromptId = id;
        localStorage.setItem(this.activePromptKey, id);
    }

    addCustomPrompt(name, systemPrompt, description = '') {
        const id = 'custom_' + Date.now();
        const newPersona = {
            id,
            name,
            icon: '✨',
            description: description || 'Rituale personalizzato',
            systemPrompt,
            isCustom: true
        };
        const updated = [...this.customPrompts, newPersona];
        this.saveCustomPrompts(updated);
        return newPersona;
    }

    deleteCustomPrompt(id) {
        const updated = this.customPrompts.filter(p => p.id !== id);
        this.saveCustomPrompts(updated);
        if (this.activePromptId === id) {
            this.setActivePersona('bard');
        }
    }

    async generateDiaryEntry(userInput, context = {}) {
        if (!this.apiKey) {
            throw new Error('Chiave API di Gemini non configurata. Clicca sull\'icona dell\'ingranaggio in alto per inserirla.');
        }

        const persona = this.getActivePersona();
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

        const currentDateStr = context.date || new Date().toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const promptText = `
Data corrente del diario: ${currentDateStr}
Stato d'animo selezionato: ${context.mood || 'Naturale'}
Pensieri / Parole dell'utente:
"""
${userInput}
"""

Scrivi ora la pagina del diario secondo il tuo ruolo. Formatta il testo in paragrafi curati e accattivanti.
        `.trim();

        const payload = {
            system_instruction: {
                parts: [{ text: persona.systemPrompt }]
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: promptText }]
                }
            ],
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 1200
            }
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const msg = errData?.error?.message || `Errore HTTP ${response.status}: ${response.statusText}`;
                throw new Error(msg);
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                throw new Error('Risposta vuota o non valida ricevuta da Gemini.');
            }

            return {
                text: textResponse.trim(),
                personaName: persona.name,
                personaIcon: persona.icon
            };
        } catch (error) {
            console.error('Errore chiamata Gemini:', error);
            throw error;
        }
    }
}

window.fantasyGemini = new FantasyGeminiClient();
