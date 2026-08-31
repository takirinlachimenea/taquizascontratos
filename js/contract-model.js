/**
 * Takirin La Chimenea - Contract Data Model & Business Logic
 */

const ContractModel = {
  DAYS_SPANISH: [
    'DOMINGO',
    'LUNES',
    'MARTES',
    'MIÉRCOLES',
    'JUEVES',
    'VIERNES',
    'SÁBADO'
  ],

  DEFAULT_COMPLEMENTS_TEXT: `• Salsa Verde
• Salsa Roja
• Cebolla morada con habanero
• Rábanos o pepinos
• Limones
• Pico de gallo
• Cebolla y Cilantro
• Plato desechable
• 2 horas de servicio`,

  createEmptyContract(nextFolio = '0001') {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const settings = (typeof StorageManager !== 'undefined' && StorageManager.getSettings) ? StorageManager.getSettings() : {};

    return {
      id: `TK-${today.getFullYear()}-${nextFolio}`,
      folio: String(nextFolio).padStart(4, '0'),
      contractDate: dateStr,
      client: {
        name: '',
        address: '',
        reference: '',
        phone: ''
      },
      event: {
        type: 'Taquiza Tradicional:\n• Pastor marinado con piña\n• Suadero al estilo CDMX\n• Longaniza artesanal\n• Bistec de res',
        amount: 0,
        complementsText: this.DEFAULT_COMPLEMENTS_TEXT,
        additionals: '',
        additionalsAmount: 0,
        travelCost: 0,
        date: dateStr,
        dayOfWeek: this.getDayOfWeek(dateStr),
        arrivalTime: '14:00',
        startTime: '15:00',
        serviceTime: '2 HORAS',
        endTime: '17:00',
        assignedStaff: ''
      },
      payments: {
        anticipos: [
          {
            id: 'ant-' + Date.now(),
            date: dateStr,
            type: 'Efectivo',
            amount: 0,
            note: 'Apartado'
          }
        ],
        subtotal: 0,
        ivaRate: 0,
        ivaAmount: 0,
        total: 0,
        totalAnticipos: 0,
        remainingBalance: 0,
        status: 'pending'
      },
      elaboratedBy: settings.elaboratedByDefault || 'Alexis Lira',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  getDayOfWeek(dateString) {
    if (!dateString) return '';
    try {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return this.DAYS_SPANISH[date.getDay()] || '';
    } catch (e) {
      return '';
    }
  },

  parseDateParts(dateString) {
    if (!dateString) return { day: '', month: '', year: '' };
    try {
      const parts = dateString.split('-');
      return {
        day: parts[2] || '',
        month: parts[1] || '',
        year: parts[0] || ''
      };
    } catch (e) {
      return { day: '', month: '', year: '' };
    }
  },

  calculateEndTime(startTime, serviceHours) {
    if (!startTime) return '';
    try {
      const [h, m] = startTime.split(':').map(Number);
      let hoursToAdd = 2;
      
      if (typeof serviceHours === 'string') {
        const match = serviceHours.match(/\d+/);
        if (match) hoursToAdd = parseInt(match[0], 10);
      } else if (typeof serviceHours === 'number') {
        hoursToAdd = serviceHours;
      }
      
      const endH = (h + hoursToAdd) % 24;
      return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  },

  recalculateTotals(contract) {
    if (!contract) return contract;
    if (!contract.event) contract.event = {};
    if (!contract.payments) contract.payments = {};

    const eventAmount = parseFloat(contract.event.amount) || 0;
    const additionalsAmount = parseFloat(contract.event.additionalsAmount) || 0;
    const travelCost = parseFloat(contract.event.travelCost) || 0;

    const subtotal = eventAmount + additionalsAmount + travelCost;
    const ivaRate = parseFloat(contract.payments.ivaRate) || 0;
    const ivaAmount = Math.round((subtotal * (ivaRate / 100)) * 100) / 100;
    const total = Math.round((subtotal + ivaAmount) * 100) / 100;

    let totalAnticipos = 0;
    if (contract.payments.anticipos && Array.isArray(contract.payments.anticipos)) {
      contract.payments.anticipos.forEach(ant => {
        const amt = parseFloat(ant.amount) || 0;
        totalAnticipos += amt;
      });
    }

    const remainingBalance = Math.max(0, Math.round((total - totalAnticipos) * 100) / 100);

    let status = 'pending';
    if (contract.status === 'cancelled' || contract.payments.status === 'cancelled') {
      status = 'cancelled';
    } else if (total > 0 && remainingBalance <= 0) {
      status = 'paid';
    } else if (totalAnticipos > 0) {
      status = 'partial';
    }

    contract.payments.subtotal = subtotal;
    contract.payments.ivaAmount = ivaAmount;
    contract.payments.total = total;
    contract.payments.totalAnticipos = totalAnticipos;
    contract.payments.remainingBalance = remainingBalance;
    contract.payments.status = status;

    return contract;
  },

  formatCurrency(amount, showZeroAsDash = true) {
    const val = parseFloat(amount);
    if (isNaN(val) || (val === 0 && showZeroAsDash)) {
      return '-';
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  },

  formatTime12(time24) {
    if (!time24) return '';
    try {
      const [h, m] = time24.split(':').map(Number);
      if (isNaN(h)) return time24;
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
    } catch (e) {
      return time24;
    }
  },

  formatDateHuman(dateString) {
    if (!dateString) return '';
    try {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  }
};

window.ContractModel = ContractModel;
