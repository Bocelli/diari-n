/**
 * Audio Engine per il Diario Fantasy
 * Generazione procedurale di suoni ambientali ed effetti sonori tramite Web Audio API
 * 100% autonomo (nessun file audio esterno da scaricare, funziona anche offline)
 */

class FantasyAudioEngine {
    constructor() {
        this.ctx = null;
        this.isAmbiencePlaying = false;
        this.ambienceGain = null;
        this.fireSource = null;
        this.isMuted = false;
    }

    init() {
        try {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        } catch (e) {
            console.warn('AudioContext init error:', e);
        }
    }

    // Suono realistico di una pagina sfogliata (page turn rustle)
    playPageFlip() {
        if (this.isMuted) return;
        try {
            this.init();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const duration = 0.35;

            // Rumore bianco filtrato con inviluppo rapido
            const bufferSize = Math.floor(this.ctx.sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(300, now + duration);
            filter.Q.value = 1.8;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(now);
        } catch (err) {
            console.warn('Audio playPageFlip error:', err);
        }
    }

    // Suono graffiante delicato del pennino d'oca (quill stroke)
    playQuillScratch() {
        if (this.isMuted) return;
        try {
            this.init();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const duration = 0.04;

            const bufferSize = Math.floor(this.ctx.sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2200 + Math.random() * 800, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(now);
        } catch (err) {
            // Silenzioso per evitare log ad ogni battitura
        }
    }

    // Rintocco magico quando Gemini risponde o si compie un incanto
    playMagicChime() {
        if (this.isMuted) return;
        try {
            this.init();
            if (!this.ctx) return;

            const notes = [523.25, 659.25, 783.99, 1046.50]; // Accordo C, E, G, C
            const now = this.ctx.currentTime;

            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0.001, now + idx * 0.08);
                gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.9);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 1.0);
            });
        } catch (err) {
            console.warn('Audio playMagicChime error:', err);
        }
    }

    // Toggle atmosfera accogliente (camino acceso con legna scoppiettante)
    toggleFireplaceAmbience(enable) {
        this.init();
        if (!this.ctx) return false;

        if (enable === undefined) {
            this.isAmbiencePlaying = !this.isAmbiencePlaying;
        } else {
            this.isAmbiencePlaying = enable;
        }

        if (this.isAmbiencePlaying) {
            this.startFireplace();
        } else {
            this.stopFireplace();
        }

        return this.isAmbiencePlaying;
    }

    startFireplace() {
        if (!this.ctx) return;
        this.stopFireplace();

        // Generatore di crepitio del fuoco con filtro passa-basso e scoppiettii casuali
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Pink noise filtering
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
            b6 = white * 0.115926;
        }

        this.fireSource = this.ctx.createBufferSource();
        this.fireSource.buffer = noiseBuffer;
        this.fireSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.ambienceGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);

        this.fireSource.connect(filter);
        filter.connect(this.ambienceGain);
        this.ambienceGain.connect(this.ctx.destination);

        this.fireSource.start(0);

        // Timer per i "crackles" casuali del fuoco
        this.crackleTimer = setInterval(() => {
            if (!this.isAmbiencePlaying || !this.ctx) return;
            if (Math.random() > 0.4) {
                this.playCrackle();
            }
        }, 120);
    }

    playCrackle() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const dur = 0.005 + Math.random() * 0.02;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150 + Math.random() * 400, now);

        gain.gain.setValueAtTime(0.03 + Math.random() * 0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + dur);
    }

    stopFireplace() {
        if (this.crackleTimer) {
            clearInterval(this.crackleTimer);
            this.crackleTimer = null;
        }
        if (this.ambienceGain && this.ctx) {
            try {
                this.ambienceGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
                setTimeout(() => {
                    if (this.fireSource) {
                        try { this.fireSource.stop(); } catch (e) {}
                        this.fireSource.disconnect();
                        this.fireSource = null;
                    }
                }, 850);
            } catch (e) {
                if (this.fireSource) {
                    try { this.fireSource.stop(); } catch (err) {}
                    this.fireSource = null;
                }
            }
        }
    }
}

window.fantasyAudio = new FantasyAudioEngine();
