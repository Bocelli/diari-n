/**
 * Speech-to-Text Engine per il Diario Fantasy
 * Utilizza la Web Speech API per dettare pensieri a voce con il microfono
 */

class FantasySpeechEngine {
    constructor() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.isSupported = !!SpeechRecognition;
        this.recognition = null;
        this.isListening = false;
        this.language = 'it-IT';
        this.onResultCallback = null;
        this.onStatusChangeCallback = null;
        this.onErrorCallback = null;
        this.interimTranscript = '';
        this.finalTranscript = '';

        if (this.isSupported) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.language;

            this.setupListeners();
        }
    }

    setupListeners() {
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onStatusChangeCallback) {
                this.onStatusChangeCallback({ status: 'listening', message: 'Il microfono è aperto... parla pure.' });
            }
        };

        this.recognition.onresult = (event) => {
            let interim = '';
            let newFinal = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    newFinal += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }

            if (newFinal) {
                this.finalTranscript += newFinal;
            }
            this.interimTranscript = interim;

            if (this.onResultCallback) {
                this.onResultCallback({
                    final: this.finalTranscript,
                    interim: this.interimTranscript,
                    fullCurrent: (this.finalTranscript + ' ' + this.interimTranscript).trim(),
                    latestFinalChunk: newFinal.trim()
                });
            }
        };

        this.recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            let userMsg = 'Errore microfono: ' + event.error;
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                userMsg = 'Accesso al microfono negato. Concedi il permesso nelle impostazioni del browser.';
            } else if (event.error === 'no-speech') {
                userMsg = 'Nessuna voce rilevata. Riprova a parlare più vicino al microfono.';
            }
            if (this.onErrorCallback) {
                this.onErrorCallback(userMsg, event.error);
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onStatusChangeCallback) {
                this.onStatusChangeCallback({ status: 'idle', message: 'In ascolto terminato.' });
            }
        };
    }

    start(onResult, onStatusChange, onError) {
        if (!this.isSupported) {
            if (onError) onError('Il tuo browser non supporta il riconoscimento vocale Web Speech (usa Google Chrome o Microsoft Edge).', 'unsupported');
            return false;
        }

        this.onResultCallback = onResult;
        this.onStatusChangeCallback = onStatusChange;
        this.onErrorCallback = onError;
        this.interimTranscript = '';
        this.finalTranscript = '';

        try {
            this.recognition.lang = this.language;
            this.recognition.start();
            return true;
        } catch (err) {
            console.error('Errore avvio microfono:', err);
            // Se era già attivo, lo fermiamo
            if (this.isListening) {
                this.stop();
            }
            return false;
        }
    }

    stop() {
        if (!this.recognition) return;
        try {
            this.recognition.stop();
        } catch (e) {
            console.warn(e);
        }
        this.isListening = false;
    }

    toggle(onResult, onStatusChange, onError) {
        if (this.isListening) {
            this.stop();
            return false;
        } else {
            return this.start(onResult, onStatusChange, onError);
        }
    }

    setLanguage(langCode) {
        this.language = langCode;
        if (this.recognition) {
            this.recognition.lang = langCode;
        }
    }
}

window.fantasySpeech = new FantasySpeechEngine();
