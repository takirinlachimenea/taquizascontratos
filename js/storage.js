/**
 * Takirin La Chimenea - Storage & Realtime Cloud Synchronization Engine
 * Sincronización en tiempo real multidispositivo con Firebase Realtime DB + GitHub Gists + Respaldo Local
 */

const DEFAULT_SAMPLE_CONTRACTS = [
  {
    "id": "TK-2026-0001",
    "folio": "0001",
    "contractDate": "2026-08-31",
    "client": {
      "name": "Lic. Roberto Morales Vázquez",
      "address": "Av. 3 #1420, Fracc. San José, Córdoba, Ver.",
      "reference": "Frente al parque de San José, portón blanco",
      "phone": "271 123 4567"
    },
    "event": {
      "type": "Taquiza Tradicional para 80 personas:\n• Pastor marinado con piña\n• Suadero al estilo CDMX\n• Longaniza artesanal\n• Bistec de res",
      "amount": 4800,
      "complements": [
        "Salsa Verde",
        "Salsa Roja",
        "Cebolla morada con habanero",
        "Rábanos o pepinos",
        "Limones",
        "Pico de gallo",
        "Cebolla y Cilantro",
        "Plato desechable",
        "2 horas de servicio"
      ],
      "complementsText": "• Salsa Verde\n• Salsa Roja\n• Cebolla morada con habanero\n• Rábanos o pepinos\n• Limones\n• Pico de gallo\n• Cebolla y Cilantro\n• Plato desechable\n• 2 horas de servicio",
      "additionals": "40 Gringas de pastor con queso Gouda + Vitrolero Horchata 20L",
      "additionalsAmount": 850,
      "travelCost": 0,
      "date": "2026-09-05",
      "dayOfWeek": "SÁBADO",
      "arrivalTime": "14:00",
      "startTime": "15:00",
      "serviceTime": "2 HORAS",
      "endTime": "17:00",
      "assignedStaff": "Carlos Mendoza (Parrillero), Jesús López (Ayudante)"
    },
    "payments": {
      "anticipos": [
        {
          "id": "ant-1",
          "date": "2026-08-31",
          "type": "Transferencia",
          "amount": 2500,
          "note": "Apartado 50%"
        }
      ],
      "subtotal": 5650,
      "ivaRate": 0,
      "ivaAmount": 0,
      "total": 5650,
      "totalAnticipos": 2500,
      "remainingBalance": 3150,
      "status": "partial"
    },
    "elaboratedBy": "Alexis Lira",
    "createdAt": "2026-08-31T13:30:00.000Z",
    "updatedAt": "2026-08-31T13:30:00.000Z"
  },
  {
    "id": "TK-2026-0002",
    "folio": "0002",
    "contractDate": "2026-08-30",
    "client": {
      "name": "Dra. Mariana Castillo Ramos",
      "address": "Calle 9 Poniente #45, Col. Centro, Fortín de las Flores, Ver.",
      "reference": "A dos cuadras del parque central de Fortín",
      "phone": "271 987 6543"
    },
    "event": {
      "type": "Taquiza Premium 120 personas:\n• Pastor especial Takirin\n• Chuleta ahumada con queso\n• Alambre mixto con morrón\n• Longaniza y Bistec",
      "amount": 7200,
      "complements": [
        "Salsa Verde",
        "Salsa Roja",
        "Cebolla morada con habanero",
        "Rábanos o pepinos",
        "Limones",
        "Pico de gallo",
        "Cebolla y Cilantro",
        "Plato desechable",
        "2 horas de servicio"
      ],
      "complementsText": "• Salsa Verde\n• Salsa Roja\n• Cebolla morada con habanero\n• Rábanos o pepinos\n• Limones\n• Pico de gallo\n• Cebolla y Cilantro\n• Plato desechable\n• 2 horas de servicio",
      "additionals": "1 Hora extra de servicio ($300) + 50 quesadillas de maíz",
      "additionalsAmount": 750,
      "travelCost": 250,
      "date": "2026-09-12",
      "dayOfWeek": "SÁBADO",
      "arrivalTime": "17:30",
      "startTime": "19:00",
      "serviceTime": "3 HORAS",
      "endTime": "22:00",
      "assignedStaff": "Carlos Mendoza, Pedro Ramírez, Sofia Huerta"
    },
    "payments": {
      "anticipos": [
        {
          "id": "ant-1",
          "date": "2026-08-30",
          "type": "Efectivo",
          "amount": 4000,
          "note": "Anticipo inicial"
        },
        {
          "id": "ant-2",
          "date": "2026-08-31",
          "type": "Transferencia",
          "amount": 4200,
          "note": "Liquidación total"
        }
      ],
      "subtotal": 8200,
      "ivaRate": 0,
      "ivaAmount": 0,
      "total": 8200,
      "totalAnticipos": 8200,
      "remainingBalance": 0,
      "status": "paid"
    },
    "elaboratedBy": "Alexis Lira",
    "createdAt": "2026-08-30T10:15:00.000Z",
    "updatedAt": "2026-08-31T12:00:00.000Z"
  },
  {
    "id": "TK-2026-0003",
    "folio": "0003",
    "contractDate": "2026-08-31",
    "client": {
      "name": "Ing. Fernando Gómez Perea",
      "address": "Privada Las Palmas #12, Fracc. Campestre, Córdoba, Ver.",
      "reference": "Entrando por la caseta, tercera casa a mano derecha",
      "phone": "271 555 8899"
    },
    "event": {
      "type": "Taquiza Familiar 50 personas:\n• Pastor al trompo tradicional\n• Suadero suave\n• Bistec",
      "amount": 3200,
      "complements": [
        "Salsa Verde",
        "Salsa Roja",
        "Cebolla morada con habanero",
        "Rábanos o pepinos",
        "Limones",
        "Pico de gallo",
        "Cebolla y Cilantro",
        "Plato desechable",
        "2 horas de servicio"
      ],
      "complementsText": "• Salsa Verde\n• Salsa Roja\n• Cebolla morada con habanero\n• Rábanos o pepinos\n• Limones\n• Pico de gallo\n• Cebolla y Cilantro\n• Plato desechable\n• 2 horas de servicio",
      "additionals": "Cazuela de frijoles charros con tocino y salchicha",
      "additionalsAmount": 450,
      "travelCost": 0,
      "date": "2026-09-18",
      "dayOfWeek": "VIERNES",
      "arrivalTime": "19:00",
      "startTime": "20:00",
      "serviceTime": "2 HORAS",
      "endTime": "22:00",
      "assignedStaff": "Jesús López (Parrillero)"
    },
    "payments": {
      "anticipos": [
        {
          "id": "ant-1",
          "date": "2026-08-31",
          "type": "Transferencia",
          "amount": 1500,
          "note": "Anticipo de confirmación"
        }
      ],
      "subtotal": 3650,
      "ivaRate": 0,
      "ivaAmount": 0,
      "total": 3650,
      "totalAnticipos": 1500,
      "remainingBalance": 2150,
      "status": "partial"
    },
    "elaboratedBy": "Alexis Lira",
    "createdAt": "2026-08-31T11:00:00.000Z",
    "updatedAt": "2026-08-31T11:00:00.000Z"
  }
];

const STORAGE_KEYS = {
  CONTRACTS: 'takirin_contratos_db',
  SETTINGS: 'takirin_app_settings',
  SYNC_CONFIG: 'takirin_sync_config',
  LAST_SYNC: 'takirin_last_sync_time'
};

const StorageManager = {
  isSyncing: false,
  autoSyncInterval: null,

  /**
   * Initializes database and starts background realtime sync
   */
  async init() {
    const existing = this.getContracts();
    if (!existing || existing.length === 0) {
      this.saveContractsLocally(DEFAULT_SAMPLE_CONTRACTS);
    }

    // Try initial sync on app open
    setTimeout(() => {
      this.syncWithCloud(true);
    }, 500);

    // Setup auto-sync polling every 20 seconds so devices update without refreshing
    if (!this.autoSyncInterval) {
      this.autoSyncInterval = setInterval(() => {
        this.syncWithCloud(true);
      }, 20000);
    }
  },

  /**
   * Get all contracts from localStorage
   * @returns {Array} List of contracts
   */
  getContracts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading contracts from localStorage', e);
      return [];
    }
  },

  /**
   * Save contracts locally
   */
  saveContractsLocally(contracts) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
      return true;
    } catch (e) {
      console.error('Error saving contracts locally', e);
      return false;
    }
  },

  /**
   * Save all contracts and trigger cloud push immediately
   * @param {Array} contracts 
   */
  saveContracts(contracts) {
    this.saveContractsLocally(contracts);
    // Push immediately to cloud
    this.syncWithCloud(true);
    return true;
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
        elaboratedByDefault: 'Alexis Lira',
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

  /**
   * Get Sync Configuration
   */
  getSyncConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
      return data ? JSON.parse(data) : {
        enabled: true,
        cloudKey: 'takirin-lachimenea-cordoba',
        firebaseUrl: 'https://takirin-contratos-default-rtdb.firebaseio.com',
        githubToken: '',
        githubGistId: ''
      };
    } catch (e) {
      return {
        enabled: true,
        cloudKey: 'takirin-lachimenea-cordoba',
        firebaseUrl: 'https://takirin-contratos-default-rtdb.firebaseio.com'
      };
    }
  },

  saveSyncConfig(config) {
    localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(config));
  },

  /**
   * Core Multichannel Cloud Synchronization (Firebase Realtime DB + GitHub Gist)
   */
  async syncWithCloud(silent = false) {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.updateSyncUIStatus('syncing');

    try {
      const config = this.getSyncConfig();
      if (!config.enabled) {
        this.updateSyncUIStatus('idle');
        this.isSyncing = false;
        return;
      }

      let remoteContracts = null;
      let syncSuccess = false;

      // CHANNEL 1: Firebase Realtime Database (High Speed Realtime Sync)
      const firebaseUrl = config.firebaseUrl || 'https://takirin-contratos-default-rtdb.firebaseio.com';
      const cleanKey = (config.cloudKey || 'takirin-lachimenea-cordoba').replace(/[^a-zA-Z0-9_-]/g, '');
      const endpoint = `${firebaseUrl}/negocios/${cleanKey}.json`;

      try {
        const getRes = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (getRes.ok) {
          const remoteData = await getRes.json();
          if (remoteData) {
            remoteContracts = Array.isArray(remoteData) ? remoteData : (remoteData.contracts || Object.values(remoteData));
          } else {
            remoteContracts = [];
          }
          syncSuccess = true;
        }
      } catch (err) {
        console.warn('Firebase sync channel attempt:', err);
      }

      // CHANNEL 2: GitHub Gist API (If configured)
      if (!syncSuccess && config.githubToken) {
        try {
          remoteContracts = await this.syncWithGitHubGist(config);
          if (remoteContracts) syncSuccess = true;
        } catch (e) {
          console.warn('GitHub Gist sync attempt:', e);
        }
      }

      if (syncSuccess && Array.isArray(remoteContracts)) {
        // Smart Merge local and remote
        const local = this.getContracts();
        const contractMap = new Map();

        local.forEach(c => contractMap.set(c.id, c));

        let hasNewUpdates = false;
        remoteContracts.forEach(rc => {
          if (!rc || !rc.id) return;
          if (!contractMap.has(rc.id)) {
            contractMap.set(rc.id, rc);
            hasNewUpdates = true;
          } else {
            const lc = contractMap.get(rc.id);
            const lcTime = new Date(lc.updatedAt || lc.createdAt || 0).getTime();
            const rcTime = new Date(rc.updatedAt || rc.createdAt || 0).getTime();
            if (rcTime > lcTime) {
              contractMap.set(rc.id, rc);
              hasNewUpdates = true;
            }
          }
        });

        const merged = Array.from(contractMap.values());
        this.saveContractsLocally(merged);

        // Push merged state back to Firebase / Cloud so other devices have the latest
        try {
          await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(merged)
          });
        } catch (e) {
          console.warn('Could not push back to Firebase:', e);
        }

        if (config.githubToken && config.githubGistId) {
          this.pushToGitHubGist(config, merged).catch(e => console.warn(e));
        }

        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        this.updateSyncUIStatus('synced');

        if (hasNewUpdates && typeof App !== 'undefined') {
          App.renderStats();
          App.renderContractsTable();
          if (typeof CalendarManager !== 'undefined') CalendarManager.render();
        }

        if (!silent && typeof App !== 'undefined' && App.showToast) {
          App.showToast('¡Sincronización completada con éxito!', 'success');
        }
      } else {
        this.updateSyncUIStatus('synced');
      }
    } catch (err) {
      console.warn('Sync coordinator status:', err);
      this.updateSyncUIStatus('error');
      if (!silent && typeof App !== 'undefined' && App.showToast) {
        App.showToast('Nota de sincronización: ' + err.message, 'warning');
      }
    } finally {
      this.isSyncing = false;
    }
  },

  /**
   * Sync with GitHub Gist API
   */
  async syncWithGitHubGist(config) {
    if (!config.githubToken) return null;

    let gistId = config.githubGistId;
    if (!gistId) {
      gistId = await this.findOrCreateTakirinGist(config.githubToken);
      if (gistId) {
        config.githubGistId = gistId;
        this.saveSyncConfig(config);
      }
    }

    if (!gistId) return null;

    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${config.githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const file = data.files && data.files['takirin_contratos_data.json'];
      if (file && file.content) {
        return JSON.parse(file.content);
      }
    }
    return null;
  },

  async pushToGitHubGist(config, contracts) {
    if (!config.githubToken || !config.githubGistId) return;

    await fetch(`https://api.github.com/gists/${config.githubGistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${config.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Takirin La Chimenea - Base de Datos de Contratos de Taquizas',
        files: {
          'takirin_contratos_data.json': {
            content: JSON.stringify(contracts, null, 2)
          }
        }
      })
    });
  },

  async findOrCreateTakirinGist(token) {
    try {
      const res = await fetch('https://api.github.com/gists', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const gists = await res.json();
        const existing = gists.find(g => g.files && g.files['takirin_contratos_data.json']);
        if (existing) return existing.id;
      }

      const local = this.getContracts();
      const createRes = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Takirin La Chimenea - Base de Datos de Contratos de Taquizas',
          public: false,
          files: {
            'takirin_contratos_data.json': {
              content: JSON.stringify(local, null, 2)
            }
          }
        })
      });

      if (createRes.ok) {
        const created = await createRes.json();
        return created.id;
      }
    } catch (e) {
      console.error('Error with GitHub Gist:', e);
    }
    return null;
  },

  updateSyncUIStatus(status) {
    const el = document.getElementById('navbar-sync-indicator');
    const textEl = document.getElementById('navbar-sync-text');
    if (!el) return;

    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    let timeStr = '';
    if (lastSync) {
      const d = new Date(lastSync);
      timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    if (status === 'syncing') {
      el.className = 'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse cursor-pointer';
      if (textEl) textEl.textContent = 'Sincronizando...';
    } else if (status === 'synced') {
      el.className = 'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer';
      if (textEl) textEl.textContent = timeStr ? `Nube: Activa (${timeStr})` : 'Nube: Conectada';
    } else if (status === 'error') {
      el.className = 'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer';
      if (textEl) textEl.textContent = 'Nube: Toca para reintentar';
    } else {
      el.className = 'w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer';
      if (textEl) textEl.textContent = 'Nube Activa';
    }
  },

  exportToJSON() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      contracts: this.getContracts(),
      settings: this.getSettings()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `takirin_contratos_respaldo_${timestamp}.json`;
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
          let contractsToImport = [];
          
          if (Array.isArray(content)) {
            contractsToImport = content;
          } else if (content.contracts && Array.isArray(content.contracts)) {
            contractsToImport = content.contracts;
            if (content.settings) {
              this.saveSettings(content.settings);
            }
          } else {
            throw new Error('Formato de archivo inválido.');
          }

          const current = this.getContracts();
          const map = new Map();
          
          current.forEach(c => map.set(c.id, c));
          contractsToImport.forEach(c => map.set(c.id, c));
          
          const merged = Array.from(map.values());
          this.saveContracts(merged);
          
          resolve({
            success: true,
            count: contractsToImport.length,
            total: merged.length,
            message: `Se importaron ${contractsToImport.length} contratos exitosamente.`
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsText(file);
    });
  }
};

window.StorageManager = StorageManager;
