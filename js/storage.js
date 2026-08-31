/**
 * Takirin La Chimenea - Storage Manager
 * Handles local persistence, JSON export/import and GitHub synchronization preparation.
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
  LAST_FOLIO: 'takirin_last_folio',
  BACKUP_TIMESTAMP: 'takirin_last_backup'
};

const StorageManager = {
  /**
   * Initializes database with defaults if empty
   */
  async init() {
    const existing = this.getContracts();
    if (!existing || existing.length === 0) {
      this.saveContracts(DEFAULT_SAMPLE_CONTRACTS);
      console.log('Seeded database with initial contracts.');
    }
  },

  /**
   * Get all contracts
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
   * Save all contracts
   * @param {Array} contracts 
   */
  saveContracts(contracts) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
      localStorage.setItem(STORAGE_KEYS.BACKUP_TIMESTAMP, new Date().toISOString());
      return true;
    } catch (e) {
      console.error('Error saving contracts to localStorage', e);
      return false;
    }
  },

  /**
   * Get contract by ID or Folio
   * @param {string} idOrFolio 
   */
  getContract(idOrFolio) {
    const contracts = this.getContracts();
    return contracts.find(c => c.id === idOrFolio || c.folio === idOrFolio) || null;
  },

  /**
   * Save or Update a single contract
   * @param {Object} contract 
   */
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

  /**
   * Delete contract by ID
   * @param {string} id 
   */
  deleteContract(id) {
    const contracts = this.getContracts();
    const filtered = contracts.filter(c => c.id !== id);
    this.saveContracts(filtered);
    return filtered.length !== contracts.length;
  },

  /**
   * Calculate next auto-increment folio
   * @returns {string} e.g. "0004"
   */
  getNextFolio() {
    const contracts = this.getContracts();
    if (contracts.length === 0) return "0001";
    
    let maxNum = 0;
    contracts.forEach(c => {
      if (c.folio) {
        // Extract digits from folio
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

  /**
   * Get application settings
   */
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

  /**
   * Save application settings
   */
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  /**
   * Export all contracts to a downloadable JSON file
   */
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

  /**
   * Import contracts from a JSON file
   * @param {File} file 
   * @returns {Promise<{success: boolean, count: number, message: string}>}
   */
  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
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

          // Merge without losing data
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
