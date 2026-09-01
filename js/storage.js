/**
 * Takirin La Chimenea - Firebase Realtime Database Sync Engine
 * Sincronización automática instantánea en la nube (Opción 1: Firebase)
 */

const STORAGE_KEYS = {
  CONTRACTS: 'takirin_contratos_db',
  SETTINGS: 'takirin_app_settings',
  FIREBASE_URL: 'takirin_firebase_url',
  LAST_SYNC: 'takirin_last_sync_time'
};

const StorageManager = {
  isSyncing: false,
  realtimeActive: false,
  syncInterval: null,

  async init() {
    // 1. Cargar datos locales primero para arranque instantáneo
    const local = this.getContracts();
    if (!local || local.length === 0) {
      if (typeof DEFAULT_SAMPLE_CONTRACTS !== 'undefined') {
        this.saveContractsLocally(DEFAULT_SAMPLE_CONTRACTS);
      }
    }

    // 2. Conectar y sincronizar con Firebase Realtime Database
    const firebaseUrl = this.getFirebaseUrl();
    if (firebaseUrl) {
      this.syncFromFirebase(true);
      this.startRealtimePolling();
    } else {
      this.updateStatusPill('unconfigured');
    }
  },

  getFirebaseUrl() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIREBASE_URL);
      if (saved && saved.trim().length > 0) return saved.trim().replace(/\/+$/, '');
    } catch (e) {}
    // URL por defecto si el usuario ya la configuró
    return '';
  },

  setFirebaseUrl(url) {
    if (!url) return;
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEYS.FIREBASE_URL, cleanUrl);
    this.syncFromFirebase(false);
    this.startRealtimePolling();
  },

  startRealtimePolling() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    // Revisa cambios en la nube cada 8 segundos de forma silenciosa
    this.syncInterval = setInterval(() => {
      this.syncFromFirebase(true);
    }, 8000);
  },

  /**
   * Lee la base de datos de Firebase en tiempo real
   */
  async syncFromFirebase(silent = false) {
    const firebaseUrl = this.getFirebaseUrl();
    if (!firebaseUrl) {
      this.updateStatusPill('unconfigured');
      return;
    }

    this.updateStatusPill('syncing');

    try {
      const endpoint = `${firebaseUrl}/contratos.json`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        let remoteContracts = [];

        if (Array.isArray(data)) {
          remoteContracts = data.filter(c => c && c.id);
        } else if (data && typeof data === 'object') {
          remoteContracts = Object.values(data).filter(c => c && c.id);
        }

        const local = this.getContracts();
        const map = new Map();

        // Mezcla inteligente para no perder datos si no hay internet temporalmente
        local.forEach(c => map.set(c.id, c));

        let hasNewData = false;
        remoteContracts.forEach(rc => {
          if (!map.has(rc.id)) {
            map.set(rc.id, rc);
            hasNewData = true;
          } else {
            const lc = map.get(rc.id);
            const lcTime = new Date(lc.updatedAt || lc.createdAt || 0).getTime();
            const rcTime = new Date(rc.updatedAt || rc.createdAt || 0).getTime();
            if (rcTime > lcTime) {
              map.set(rc.id, rc);
              hasNewData = true;
            }
          }
        });

        const merged = Array.from(map.values());
        this.saveContractsLocally(merged);
        this.updateStatusPill('connected');

        if (hasNewData && typeof App !== 'undefined') {
          App.renderStats();
          App.renderContractsTable();
          if (typeof CalendarManager !== 'undefined') CalendarManager.render();
        }

        if (!silent && typeof App !== 'undefined' && App.showToast) {
          App.showToast(`¡Conectado a Firebase! (${merged.length} contratos sincronizados)`, 'success');
        }
      } else {
        throw new Error(`Firebase respondió código ${res.status}`);
      }
    } catch (err) {
      console.warn('Error al sincronizar con Firebase:', err);
      this.updateStatusPill('error');
      if (!silent && typeof App !== 'undefined' && App.showToast) {
        App.showToast('No se pudo conectar a Firebase: ' + err.message, 'warning');
      }
    }
  },

  /**
   * Guarda localmente y sube a Firebase de inmediato
   */
  async saveContracts(contracts) {
    this.saveContractsLocally(contracts);
    
    // Subir a Firebase en tiempo real
    const firebaseUrl = this.getFirebaseUrl();
    if (firebaseUrl) {
      try {
        const endpoint = `${firebaseUrl}/contratos.json`;
        await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contracts)
        });
        this.updateStatusPill('connected');
      } catch (e) {
        console.warn('Error al guardar en Firebase:', e);
        this.updateStatusPill('error');
      }
    }
    return true;
  },

  getContracts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveContractsLocally(contracts) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
      return true;
    } catch (e) {
      return false;
    }
  },

  getContract(idOrFolio) {
    const contracts = this.getContracts();
    return contracts.find(c => c.id === idOrFolio || c.folio === idOrFolio) || null;
  },

  upsertContract(contract) {
    const contracts = this.getContracts();
    const index = contracts.findIndex(c => c.id === contract.id);
    
    if (index >= 0) {
      contract.updatedAt = new Date().toISOString();
      contracts[index] = contract;
    } else {
      contract.createdAt = contract.createdAt || new Date().toISOString();
      contract.updatedAt = new Date().toISOString();
      contracts.unshift(contract);
    }
    
    this.saveContracts(contracts);
    return contract;
  },

  deleteContract(id) {
    const contracts = this.getContracts();
    const filtered = contracts.filter(c => c.id !== id);
    this.saveContracts(filtered);
    return filtered.length !== contracts.length;
  },

  getNextFolio() {
    const contracts = this.getContracts();
    if (contracts.length === 0) return "0001";
    
    let maxNum = 0;
    contracts.forEach(c => {
      if (c.folio) {
        const matches = c.folio.match(/\d+/g);
        if (matches) {
          const num = parseInt(matches[matches.length - 1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
    
    const next = maxNum + 1;
    return String(next).padStart(4, '0');
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        businessName: 'TAKIRIN LA CHIMENEA',
        address: 'CALLE 15 #221, COL. CENTRO, CP 94500, CÓRDOBA, VER.',
        phone: '271 157 1770',
        docCode: 'FOP-01',
        extraHourRate: 300,
        elaboratedByDefault: '',
        defaultComplements: [
          'Salsa Verde',
          'Salsa Roja',
          'Cebolla morada con habanero',
          'Rábanos o pepinos',
          'Limones',
          'Pico de gallo',
          'Cebolla y Cilantro',
          'Plato desechable',
          '2 horas de servicio'
        ]
      };
    } catch (e) {
      return {};
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  updateStatusPill(status) {
    const el = document.getElementById('navbar-sync-indicator');
    const textEl = document.getElementById('navbar-sync-text');
    if (!el) return;

    if (status === 'connected') {
      el.className = 'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer';
      if (textEl) textEl.textContent = '🟢 Firebase: En Vivo';
    } else if (status === 'syncing') {
      el.className = 'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse cursor-pointer';
      if (textEl) textEl.textContent = 'Sincronizando...';
    } else if (status === 'error') {
      el.className = 'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer';
      if (textEl) textEl.textContent = '🟡 Firebase: Reconectando';
    } else {
      el.className = 'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer';
      if (textEl) textEl.textContent = '⚙️ Configurar Firebase';
    }
  },

  exportToJSON() {
    const contracts = this.getContracts();
    const blob = new Blob([JSON.stringify(contracts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `takirin_contratos_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target.result);
          let contractsToImport = Array.isArray(content) ? content : (content.contracts || []);
          
          if (!Array.isArray(contractsToImport)) throw new Error('Formato inválido');

          const current = this.getContracts();
          const map = new Map();
          current.forEach(c => map.set(c.id, c));
          contractsToImport.forEach(c => map.set(c.id, c));
          
          const merged = Array.from(map.values());
          await this.saveContracts(merged);
          
          resolve({
            success: true,
            count: contractsToImport.length,
            total: merged.length,
            message: `Se importaron y sincronizaron ${contractsToImport.length} contratos.`
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }
};

window.StorageManager = StorageManager;
