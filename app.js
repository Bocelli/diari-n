/**
 * Grimorio delle Memorie - Applicazione Principale
 * Gestisce lo stato delle pagine, salvataggio locale, interazione vocale e AI
 */

class FantasyDiaryApp {
    constructor() {
        this.storageKey = 'fantasy_diary_pages_v1';
        this.pages = this.loadPages();
        this.currentPageIndex = this.pages.length > 0 ? this.pages.length - 1 : 0;
        
        // Elementi DOM principali
        this.dom = {
            // Pagina Destra
            pageDate: document.getElementById('pageDate'),
            pageNumber: document.getElementById('pageNumber'),
            pageTitle: document.getElementById('pageTitle'),
            pageContent: document.getElementById('pageContent'),
            moodSelect: document.getElementById('moodSelect'),
            wordCount: document.getElementById('wordCount'),
            saveStatus: document.getElementById('saveStatus'),
            
            // Pagina Sinistra
            guardianPanel: document.getElementById('guardianPanel'),
            guardianName: document.getElementById('guardianName'),
            guardianBadge: document.getElementById('guardianBadge'),
            guardianMessage: document.getElementById('guardianMessage'),
            memoriesList: document.getElementById('memoriesList'),
            
            // Barra di Input
            promptInput: document.getElementById('promptInput'),
            btnMic: document.getElementById('btnMic'),
            listeningBanner: document.getElementById('listeningBanner'),
            listeningText: document.getElementById('listeningText'),
            personaQuickSelect: document.getElementById('personaQuickSelect'),
            btnAddDirect: document.getElementById('btnAddDirect'),
            btnGeminiWeave: document.getElementById('btnGeminiWeave'),
            
            // Navigazione
            btnPrevPage: document.getElementById('btnPrevPage'),
            btnNextPage: document.getElementById('btnNextPage'),
            btnNewPage: document.getElementById('btnNewPage'),
            pageIndicator: document.getElementById('pageIndicator'),
            
            // Header
            btnAmbience: document.getElementById('btnAmbience'),
            btnIndex: document.getElementById('btnIndex'),
            btnSettings: document.getElementById('btnSettings'),
            btnPrint: document.getElementById('btnPrint'),
            
            // Modali
            settingsModal: document.getElementById('settingsModal'),
            indexModal: document.getElementById('indexModal'),
            
            // Elementi Backup & Ripristino
            btnExportJson: document.getElementById('btnExportJson'),
            btnExportMd: document.getElementById('btnExportMd'),
            btnImportJson: document.getElementById('btnImportJson'),
            importFileInput: document.getElementById('importFileInput'),
            
            // Impostazioni Form
            apiKeyInput: document.getElementById('apiKeyInput'),
            modelSelect: document.getElementById('modelSelect'),
            promptsList: document.getElementById('promptsList'),
            btnSaveSettings: document.getElementById('btnSaveSettings'),
            newPromptName: document.getElementById('newPromptName'),
            newPromptText: document.getElementById('newPromptText'),
            btnAddPrompt: document.getElementById('btnAddPrompt'),
            
            // Indice
            indexSearch: document.getElementById('indexSearch'),
            indexTableList: document.getElementById('indexTableList'),
            
            // Schede Mobile
            tabWrite: document.getElementById('tabWrite'),
            tabSpirit: document.getElementById('tabSpirit'),
            pageLeft: document.querySelector('.page-left'),
            pageRight: document.querySelector('.page-right'),

            // Toasts & Container
            toastContainer: document.getElementById('toastContainer'),
            bookPagesContainer: document.getElementById('bookPagesContainer')
        };

        this.autoSaveTimer = null;
        this.init();
    }

    init() {
        this.populatePersonaSelects();
        this.renderCurrentPage();
        this.setupEventListeners();
        this.createAmbientDust();
        
        // Se non ci sono pagine, ne crea una iniziale
        if (this.pages.length === 0) {
            this.createNewPage(true);
        }
    }

    // Caricamento e salvataggio locale (LocalStorage)
    loadPages() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Errore lettura diario da localStorage:', e);
        }
        
        // Pagina iniziale di benvenuto se è il primo avvio
        return [
            {
                id: 'page_' + Date.now(),
                title: 'Il Risveglio del Grimorio',
                content: `Benvenuto tra le pagine di questo diario fatato.\n\nQui ogni tuo pensiero, parola o segreto trova riposo e rifugio. Puoi scrivere liberamente intingendo l'inchiostro virtuale con la tua tastiera, oppure premere la Runa di Ascolto (il microfono) per dettare ad alta voce ciò che hai nel cuore.\n\nSe desideri che il saggio Gemini ascolti le tue parole e le trasformi in una leggenda, in una poesia o in una cronaca nobile, configuralo dalle impostazioni in alto a destra.\n\nBuon viaggio nell'esplorazione del tuo mondo interiore...`,
                date: this.formatDate(new Date()),
                timestamp: Date.now(),
                mood: '✨ Magico',
                guardianNote: 'Sono qui per custodire le tue memorie. Parla quando vuoi, sarò pronto ad ascoltarti.',
                guardianPersona: 'Il Custode del Focolare'
            }
        ];
    }

    savePages() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.pages));
        this.showSaveIndicator('Salvato');
    }

    getCurrentPage() {
        if (!this.pages[this.currentPageIndex]) {
            this.currentPageIndex = Math.max(0, this.pages.length - 1);
        }
        return this.pages[this.currentPageIndex];
    }

    formatDate(dateObj) {
        return dateObj.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Renderizza la pagina corrente nell'interfaccia
    renderCurrentPage() {
        const page = this.getCurrentPage();
        if (!page) return;

        // Effetto visivo di cambio pagina
        if (this.dom.bookPagesContainer) {
            this.dom.bookPagesContainer.classList.remove('page-flip-anim');
            void this.dom.bookPagesContainer.offsetWidth;
            this.dom.bookPagesContainer.classList.add('page-flip-anim');
        }

        this.dom.pageDate.textContent = page.date || this.formatDate(new Date());
        this.dom.pageNumber.textContent = `Pagina ${this.currentPageIndex + 1} di ${this.pages.length}`;
        this.dom.pageIndicator.textContent = `${this.currentPageIndex + 1} / ${this.pages.length}`;
        this.dom.pageTitle.value = page.title || '';
        this.dom.pageContent.value = page.content || '';
        this.dom.moodSelect.value = page.mood || '✨ Magico';

        // Aggiorna pannello sinistro (Custode & Note)
        if (page.guardianNote) {
            this.dom.guardianMessage.innerHTML = `<p>${page.guardianNote.replace(/\n/g, '<br>')}</p>`;
            this.dom.guardianName.innerHTML = `📜 ${page.guardianPersona || 'Spirito Guida'}`;
            this.dom.guardianBadge.textContent = 'Trascrizione';
        } else {
            this.dom.guardianMessage.innerHTML = `<p>Questa pagina attende ancora le tue parole o l'intervento dello spirito guida.</p>`;
            this.dom.guardianName.innerHTML = `🕯️ Il Custode del Diario`;
            this.dom.guardianBadge.textContent = 'In attesa';
        }

        this.updateWordCount();
        this.renderLeftMemoriesList();
        this.updateNavButtons();
    }

    updateNavButtons() {
        this.dom.btnPrevPage.disabled = this.currentPageIndex <= 0;
        this.dom.btnNextPage.disabled = this.currentPageIndex >= this.pages.length - 1;
    }

    updateWordCount() {
        const text = (this.dom.pageContent.value || '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        this.dom.wordCount.textContent = `${words} parole | ${text.length} caratteri`;
    }

    showSaveIndicator(msg = 'Salvato') {
        this.dom.saveStatus.innerHTML = `<span class="save-dot"></span> ${msg}`;
        setTimeout(() => {
            this.dom.saveStatus.innerHTML = `<span class="save-dot"></span> Inchiostro asciutto`;
        }, 2000);
    }

    triggerAutoSave() {
        clearTimeout(this.autoSaveTimer);
        this.dom.saveStatus.innerHTML = `<span class="save-dot" style="background:#ffb74d; box-shadow:0 0 5px #ffb74d;"></span> Scrittura...`;
        this.autoSaveTimer = setTimeout(() => {
            const page = this.getCurrentPage();
            if (page) {
                page.title = this.dom.pageTitle.value;
                page.content = this.dom.pageContent.value;
                page.mood = this.dom.moodSelect.value;
                this.savePages();
                this.renderLeftMemoriesList();
            }
        }, 600);
    }

    // Navigazione tra le pagine
    goToPage(index) {
        if (index < 0 || index >= this.pages.length) return;
        
        // Suono pagina sfogliata
        window.fantasyAudio.playPageFlip();

        // Salva le modifiche pendenti della pagina attuale
        const curr = this.getCurrentPage();
        if (curr) {
            curr.title = this.dom.pageTitle.value;
            curr.content = this.dom.pageContent.value;
            curr.mood = this.dom.moodSelect.value;
            this.savePages();
        }

        this.currentPageIndex = index;
        this.renderCurrentPage();
    }

    createNewPage(silent = false) {
        const newPage = {
            id: 'page_' + Date.now(),
            title: '',
            content: '',
            date: this.formatDate(new Date()),
            timestamp: Date.now(),
            mood: '🕯️ Riflessivo',
            guardianNote: 'Una nuova pergamena intatta, pronta ad accogliere il tuo viaggio.',
            guardianPersona: 'Il Grimorio'
        };

        this.pages.push(newPage);
        this.savePages();
        this.currentPageIndex = this.pages.length - 1;
        
        if (!silent) {
            window.fantasyAudio.playPageFlip();
            this.showToast('📖 Nuova pagina intonsa rilegata nel diario!');
        }

        this.renderCurrentPage();
        this.dom.pageTitle.focus();
    }

    // Popola la lista delle memorie recenti sulla pagina sinistra
    renderLeftMemoriesList() {
        this.dom.memoriesList.innerHTML = '';
        const recentPages = [...this.pages].reverse().slice(0, 5);

        recentPages.forEach((p) => {
            const originalIndex = this.pages.findIndex(item => item.id === p.id);
            const li = document.createElement('li');
            li.className = `memory-item ${originalIndex === this.currentPageIndex ? 'active' : ''}`;
            li.innerHTML = `
                <div class="memory-item-date">${p.date} • ${p.mood || ''}</div>
                <div class="memory-item-preview">${p.title || (p.content ? p.content.slice(0, 35) + '...' : 'Pagina senza titolo')}</div>
            `;
            li.onclick = () => this.goToPage(originalIndex);
            this.dom.memoriesList.appendChild(li);
        });
    }

    // Gestione Event Listeners
    setupEventListeners() {
        // Scrittura e battitura con suono pennino
        this.dom.pageContent.addEventListener('input', () => {
            this.updateWordCount();
            this.triggerAutoSave();
            window.fantasyAudio.playQuillScratch();
        });

        this.dom.pageTitle.addEventListener('input', () => {
            this.triggerAutoSave();
        });

        this.dom.moodSelect.addEventListener('change', () => {
            this.triggerAutoSave();
        });

        // Pulsanti di navigazione
        this.dom.btnPrevPage.addEventListener('click', () => this.goToPage(this.currentPageIndex - 1));
        this.dom.btnNextPage.addEventListener('click', () => this.goToPage(this.currentPageIndex + 1));
        this.dom.btnNewPage.addEventListener('click', () => this.createNewPage());

        // Azione "Scrivi di mio pugno" (aggiunge il testo del prompt direttamente alla pagina)
        this.dom.btnAddDirect.addEventListener('click', () => {
            const text = this.dom.promptInput.value.trim();
            if (!text) {
                this.showToast('Scrivi o detta prima qualcosa nel calamaio sottostante.');
                return;
            }
            this.appendContentToPage(text);
            this.dom.promptInput.value = '';
            window.fantasyAudio.playQuillScratch();
            this.showToast('✍️ Pensiero impresso sulla pergamena!');
        });

        // Invio con tasto Enter sul prompt
        this.dom.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.dom.btnAddDirect.click();
            }
        });

        // Microfono / Speech-to-Text
        this.setupMicrophone();

        // Gemini AI Integration
        this.setupGeminiAction();

        // Audio Ambiente (Focolare)
        this.dom.btnAmbience.addEventListener('click', () => {
            const isPlaying = window.fantasyAudio.toggleFireplaceAmbience();
            this.dom.btnAmbience.classList.toggle('active', isPlaying);
            if (isPlaying) {
                this.dom.btnAmbience.innerHTML = '🔥 Camino Acceso';
                this.showToast('🔥 La legna scoppietta nel focolare.');
            } else {
                this.dom.btnAmbience.innerHTML = '🕯️ Atmosfera';
                this.showToast('Il fuoco si spegne lentamente.');
            }
        });

        // Stampa / Salva in PDF
        this.dom.btnPrint.addEventListener('click', () => {
            window.print();
        });

        // Gestione schede Mobile (Scrittura vs Spirito)
        if (this.dom.tabWrite && this.dom.tabSpirit) {
            if (this.dom.pageLeft) this.dom.pageLeft.classList.add('mobile-hidden');

            this.dom.tabWrite.addEventListener('click', () => {
                this.dom.tabWrite.classList.add('active');
                this.dom.tabSpirit.classList.remove('active');
                if (this.dom.pageRight) this.dom.pageRight.classList.remove('mobile-hidden');
                if (this.dom.pageLeft) this.dom.pageLeft.classList.add('mobile-hidden');
            });

            this.dom.tabSpirit.addEventListener('click', () => {
                this.dom.tabSpirit.classList.add('active');
                this.dom.tabWrite.classList.remove('active');
                if (this.dom.pageLeft) this.dom.pageLeft.classList.remove('mobile-hidden');
                if (this.dom.pageRight) this.dom.pageRight.classList.add('mobile-hidden');
            });
        }

        // Gestione Modali
        this.setupModals();
    }

    // Configurazione Microfono (Web Speech API)
    setupMicrophone() {
        this.dom.btnMic.addEventListener('click', () => {
            // Se non supportato, avvisiamo
            if (!window.fantasySpeech.isSupported) {
                this.showToast('⚠️ Il tuo browser non supporta il microfono Web Speech. Prova con Google Chrome o Microsoft Edge.');
                return;
            }

            const isStarting = window.fantasySpeech.toggle(
                // onResult
                (result) => {
                    this.dom.promptInput.value = result.fullCurrent;
                    this.dom.listeningText.textContent = `Ascolto: "${result.interim || result.latestFinalChunk || '...'}"`;
                },
                // onStatusChange
                (statusInfo) => {
                    if (statusInfo.status === 'listening') {
                        this.dom.btnMic.classList.add('listening');
                        this.dom.listeningBanner.classList.add('active');
                        this.dom.listeningText.textContent = 'Ascolto aperto... puoi iniziare a parlare!';
                        this.showToast('🎙️ Runa attivata: Parla pure con il Grimorio.');
                    } else {
                        this.dom.btnMic.classList.remove('listening');
                        this.dom.listeningBanner.classList.remove('active');
                    }
                },
                // onError
                (errMsg, errCode) => {
                    this.dom.btnMic.classList.remove('listening');
                    this.dom.listeningBanner.classList.remove('active');
                    this.showToast('⚠️ ' + errMsg);
                }
            );
        });
    }

    // Invia a Gemini con il Prompt Personalizzato Selezionato
    setupGeminiAction() {
        this.dom.btnGeminiWeave.addEventListener('click', async () => {
            let userInput = this.dom.promptInput.value.trim();

            // Se il prompt è vuoto ma c'è testo nella pagina, offriamo di elaborare la pagina
            if (!userInput) {
                const pageText = this.dom.pageContent.value.trim();
                if (pageText) {
                    userInput = pageText;
                } else {
                    this.showToast('Scrivi o detta prima un pensiero da affidare a Gemini!');
                    this.dom.promptInput.focus();
                    return;
                }
            }

            const apiKey = window.fantasyGemini.getApiKey();
            if (!apiKey) {
                this.openModal('settingsModal');
                this.showToast('Inserisci prima la tua chiave API di Gemini per evocare il saggio!');
                return;
            }

            // Cambia l'aspetto del pulsante durante l'elaborazione
            const origHtml = this.dom.btnGeminiWeave.innerHTML;
            this.dom.btnGeminiWeave.disabled = true;
            this.dom.btnGeminiWeave.innerHTML = '✨ Evocazione in corso...';
            this.showToast('🔮 Lo spirito di Gemini sta intrecciando le tue parole...');

            try {
                const persona = window.fantasyGemini.getActivePersona();
                const response = await window.fantasyGemini.generateDiaryEntry(userInput, {
                    date: this.dom.pageDate.textContent,
                    mood: this.dom.moodSelect.value
                });

                window.fantasyAudio.playMagicChime();

                // Aggiorna la pagina con il racconto generato
                this.appendContentToPage(`\n\n--- ${response.personaIcon} Cronaca del ${response.personaName} ---\n` + response.text);

                // Aggiorna anche il pannello sinistro del Custode
                const currPage = this.getCurrentPage();
                currPage.guardianNote = `"${response.text.slice(0, 220)}..."`;
                currPage.guardianPersona = response.personaName;
                this.savePages();
                this.renderCurrentPage();

                // Pulisce il campo di testo di input
                this.dom.promptInput.value = '';
                this.showToast('✨ La magia è compiuta: pagina arricchita dal saggio!');
            } catch (err) {
                console.error(err);
                this.showToast('Errore durante l\'evocazione: ' + (err.message || err));
            } finally {
                this.dom.btnGeminiWeave.disabled = false;
                this.dom.btnGeminiWeave.innerHTML = origHtml;
            }
        });
    }

    appendContentToPage(newText) {
        const curr = this.dom.pageContent.value;
        const separator = (curr.trim().length > 0) ? '\n\n' : '';
        this.dom.pageContent.value = curr + separator + newText;
        this.triggerAutoSave();
        this.updateWordCount();
        
        // Scroll verso il basso
        this.dom.pageContent.scrollTop = this.dom.pageContent.scrollHeight;
    }

    // Gestione Modali e Impostazioni
    setupModals() {
        // Apertura
        this.dom.btnSettings.addEventListener('click', () => {
            this.populateSettingsForm();
            this.openModal('settingsModal');
        });

        this.dom.btnIndex.addEventListener('click', () => {
            this.renderIndexTable();
            this.openModal('indexModal');
        });

        // Chiusura con click sulle 'X' o sul backdrop
        document.querySelectorAll('.btn-close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-backdrop');
                if (modal) modal.classList.remove('open');
            });
        });

        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                }
            });
        });

        // Salvataggio Impostazioni Gemini
        this.dom.btnSaveSettings.addEventListener('click', () => {
            const key = this.dom.apiKeyInput.value.trim();
            const model = this.dom.modelSelect.value;
            window.fantasyGemini.setApiKey(key);
            window.fantasyGemini.setModel(model);
            this.closeModal('settingsModal');
            this.showToast('Impostazioni e chiave arcana salvate con successo!');
        });

        // Creazione nuovo Prompt Personalizzato
        this.dom.btnAddPrompt.addEventListener('click', () => {
            const name = this.dom.newPromptName.value.trim();
            const text = this.dom.newPromptText.value.trim();
            if (!name || !text) {
                this.showToast('Inserisci sia un nome per la persona sia le istruzioni del prompt.');
                return;
            }
            window.fantasyGemini.addCustomPrompt(name, text);
            this.dom.newPromptName.value = '';
            this.dom.newPromptText.value = '';
            this.populatePersonaSelects();
            this.populatePromptsList();
            this.showToast('✨ Nuovo rituale personalizzato aggiunto al grimorio!');
        });

        // Ricerca nell'Indice
        this.dom.indexSearch.addEventListener('input', (e) => {
            this.renderIndexTable(e.target.value.toLowerCase());
        });

        // Cambio rapido persona dalla barra delle azioni
        this.dom.personaQuickSelect.addEventListener('change', (e) => {
            window.fantasyGemini.setActivePersona(e.target.value);
            const persona = window.fantasyGemini.getActivePersona();
            this.showToast(`Ruolo attivo: ${persona.name}`);
        });

        // Esportazione JSON
        if (this.dom.btnExportJson) {
            this.dom.btnExportJson.addEventListener('click', () => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.pages, null, 2));
                const dlAnchor = document.createElement('a');
                dlAnchor.setAttribute("href", dataStr);
                dlAnchor.setAttribute("download", `grimorio_memorie_${new Date().toISOString().slice(0,10)}.json`);
                document.body.appendChild(dlAnchor);
                dlAnchor.click();
                dlAnchor.remove();
                this.showToast('💾 Diario esportato con successo in formato JSON!');
            });
        }

        // Esportazione Markdown
        if (this.dom.btnExportMd) {
            this.dom.btnExportMd.addEventListener('click', () => {
                let mdContent = `# IL GRIMORIO DELLE MEMORIE\n\n*Cronache personali estratte il ${new Date().toLocaleDateString('it-IT')}*\n\n---\n\n`;
                this.pages.forEach((p, idx) => {
                    mdContent += `## Pagina ${idx + 1}: ${p.title || 'Senza Titolo'}\n`;
                    mdContent += `**Data:** ${p.date} | **Stato d'animo:** ${p.mood || 'Naturale'}\n\n`;
                    if (p.guardianNote) {
                        mdContent += `> *Spirito Guida (${p.guardianPersona || 'Custode'}):* ${p.guardianNote}\n\n`;
                    }
                    mdContent += `${p.content || ''}\n\n---\n\n`;
                });
                const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `grimorio_manoscritto_${new Date().toISOString().slice(0,10)}.md`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                this.showToast('📜 Manoscritto esportato in formato Markdown (.md)!');
            });
        }

        // Importazione JSON
        if (this.dom.btnImportJson && this.dom.importFileInput) {
            this.dom.btnImportJson.addEventListener('click', () => {
                this.dom.importFileInput.click();
            });

            this.dom.importFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target.result);
                        if (Array.isArray(imported) && imported.length > 0) {
                            if (confirm(`Trovate ${imported.length} pagine nel backup. Vuoi sostituire le pagine attuali con quelle del backup?`)) {
                                this.pages = imported;
                                this.savePages();
                                this.currentPageIndex = this.pages.length - 1;
                                this.renderCurrentPage();
                                this.closeModal('settingsModal');
                                this.showToast('📥 Diario ripristinato con successo!');
                            }
                        } else {
                            alert('Il file di backup non contiene un formato valido di pagine.');
                        }
                    } catch (err) {
                        alert('Errore nella lettura del file JSON: ' + err.message);
                    }
                };
                reader.readAsText(file);
                this.dom.importFileInput.value = '';
            });
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('open');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
    }

    populatePersonaSelects() {
        const personas = window.fantasyGemini.getAllPersonas();
        const activeId = window.fantasyGemini.activePromptId;

        this.dom.personaQuickSelect.innerHTML = '';
        personas.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.icon || '📜'} ${p.name}`;
            if (p.id === activeId) opt.selected = true;
            this.dom.personaQuickSelect.appendChild(opt);
        });
    }

    populateSettingsForm() {
        this.dom.apiKeyInput.value = window.fantasyGemini.getApiKey();
        this.dom.modelSelect.value = window.fantasyGemini.getModel();
        this.populatePromptsList();
    }

    populatePromptsList() {
        const personas = window.fantasyGemini.getAllPersonas();
        const activeId = window.fantasyGemini.activePromptId;
        this.dom.promptsList.innerHTML = '';

        personas.forEach(p => {
            const div = document.createElement('div');
            div.className = `prompt-card ${p.id === activeId ? 'selected' : ''}`;
            div.innerHTML = `
                <div style="flex:1;">
                    <strong style="color:#4a2c13;">${p.icon || '📜'} ${p.name}</strong>
                    <p style="font-size:0.82rem; color:#6b4d2f; margin-top:2px;">${p.description || ''}</p>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button class="btn-card-action btn-choose-persona" title="Seleziona come attivo" style="color:#2e7d32; font-weight:bold;">
                        ${p.id === activeId ? '✓ Attivo' : 'Attiva'}
                    </button>
                    ${p.isCustom ? `<button class="btn-card-action btn-del-persona" title="Elimina" style="color:#c62828;">🗑️</button>` : ''}
                </div>
            `;

            div.querySelector('.btn-choose-persona').onclick = () => {
                window.fantasyGemini.setActivePersona(p.id);
                this.populatePersonaSelects();
                this.populatePromptsList();
            };

            const delBtn = div.querySelector('.btn-del-persona');
            if (delBtn) {
                delBtn.onclick = () => {
                    if (confirm(`Sei sicuro di voler dimenticare il rituale "${p.name}"?`)) {
                        window.fantasyGemini.deleteCustomPrompt(p.id);
                        this.populatePersonaSelects();
                        this.populatePromptsList();
                    }
                };
            }

            this.dom.promptsList.appendChild(div);
        });
    }

    // Renderizza la tabella dei contenuti dell'Indice
    renderIndexTable(query = '') {
        this.dom.indexTableList.innerHTML = '';

        const filtered = this.pages
            .map((page, index) => ({ page, index }))
            .filter(({ page }) => {
                if (!query) return true;
                const matchTitle = (page.title || '').toLowerCase().includes(query);
                const matchContent = (page.content || '').toLowerCase().includes(query);
                const matchDate = (page.date || '').toLowerCase().includes(query);
                const matchMood = (page.mood || '').toLowerCase().includes(query);
                return matchTitle || matchContent || matchDate || matchMood;
            });

        if (filtered.length === 0) {
            this.dom.indexTableList.innerHTML = '<div style="padding:15px; text-align:center; color:#785836;">Nessuna pergamena trovata con questi termini.</div>';
            return;
        }

        filtered.reverse().forEach(({ page, index }) => {
            const card = document.createElement('div');
            card.className = `prompt-card ${index === this.currentPageIndex ? 'selected' : ''}`;
            card.innerHTML = `
                <div style="flex:1;">
                    <div style="font-size:0.78rem; color:#856236;">Pagina ${index + 1} • ${page.date} • ${page.mood || ''}</div>
                    <strong style="color:#3e220f; font-size:1.05rem;">${page.title || 'Senza Titolo'}</strong>
                    <div style="font-size:0.85rem; color:#553822; margin-top:3px; max-height:40px; overflow:hidden;">
                        ${page.content ? page.content.slice(0, 100) + '...' : '<i>Pagina vuota</i>'}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="btn-seal" style="padding:5px 10px; font-size:0.8rem;">Apri 📖</button>
                    ${this.pages.length > 1 ? `<button class="btn-card-action btn-del-page" title="Strappa pagina" style="color:#b71c1c;">🗑️</button>` : ''}
                </div>
            `;

            card.querySelector('.btn-seal').onclick = () => {
                this.closeModal('indexModal');
                this.goToPage(index);
            };

            const delPageBtn = card.querySelector('.btn-del-page');
            if (delPageBtn) {
                delPageBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm(`Vuoi davvero strappare via la Pagina ${index + 1}? Quest'azione non può essere annullata.`)) {
                        this.pages.splice(index, 1);
                        this.savePages();
                        this.currentPageIndex = Math.min(this.currentPageIndex, this.pages.length - 1);
                        this.renderCurrentPage();
                        this.renderIndexTable(query);
                        this.showToast('Pergamena rimossa dal diario.');
                    }
                };
            }

            this.dom.indexTableList.appendChild(card);
        });
    }

    // Mostra notifica Toast
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>✨</span><span>${message}</span>`;
        this.dom.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    // Crea le lucciole/polvere magica fluttuante
    createAmbientDust() {
        const container = document.getElementById('ambientDust');
        if (!container) return;

        const count = 15;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'dust-particle';
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDelay = `${Math.random() * 12}s`;
            particle.style.animationDuration = `${10 + Math.random() * 8}s`;
            container.appendChild(particle);
        }
    }
}

// Avvio al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
    window.fantasyDiaryApp = new FantasyDiaryApp();
});
