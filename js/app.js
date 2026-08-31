/**
 * Takirin La Chimenea - Main Application Controller
 */

const App = {
  currentView: 'dashboard',
  editingContract: null,
  activeFilter: 'all',
  searchQuery: '',

  async init() {
    try {
      await StorageManager.init();
      this.setupEventListeners();
      this.navigate('dashboard');
      this.renderStats();
      this.renderContractsTable();
      if (typeof CalendarManager !== 'undefined' && CalendarManager.init) {
        CalendarManager.init();
      }
    } catch (err) {
      console.error('App init error:', err);
    }
  },

  navigate(viewName) {
    this.currentView = viewName;

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const views = ['dashboard', 'contracts', 'editor', 'calendar', 'sync'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    if (viewName === 'dashboard') {
      this.renderStats();
    } else if (viewName === 'contracts') {
      this.renderContractsTable();
    } else if (viewName === 'calendar') {
      if (typeof CalendarManager !== 'undefined') CalendarManager.render();
    } else if (viewName === 'editor' && !this.editingContract) {
      this.newContract();
    }
  },

  setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = link.dataset.view;
        if (view) this.navigate(view);
      });
    });

    const searchInput = document.getElementById('search-contracts-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderContractsTable();
      });
    }

    const filterSelect = document.getElementById('filter-contracts-status');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.activeFilter = e.target.value;
        this.renderContractsTable();
      });
    }

    const editorForm = document.getElementById('contract-form');
    if (editorForm) {
      editorForm.addEventListener('input', () => {
        this.syncFormToModel();
        this.updateLivePreview();
      });
    }
  },

  renderStats() {
    try {
      const contracts = StorageManager.getContracts() || [];
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const todayStr = today.toISOString().split('T')[0];

      let totalContratos = contracts.length;
      let eventosEsteMes = 0;
      let ingresosTotales = 0;
      let anticiposCobrados = 0;
      let saldoPorCobrar = 0;

      contracts.forEach(c => {
        if (!c.payments) c.payments = {};
        if (c.payments.status !== 'cancelled') {
          ingresosTotales += (c.payments.total || 0);
          anticiposCobrados += (c.payments.totalAnticipos || 0);
          saldoPorCobrar += (c.payments.remainingBalance || 0);

          if (c.event && c.event.date) {
            const [y, m] = c.event.date.split('-').map(Number);
            if (y === currentYear && (m - 1) === currentMonth) {
              eventosEsteMes++;
            }
          }
        }
      });

      const elTotal = document.getElementById('stat-total-contratos');
      const elMes = document.getElementById('stat-eventos-mes');
      const elIngresos = document.getElementById('stat-ingresos-totales');
      const elAnticipos = document.getElementById('stat-anticipos-cobrados');
      const elSaldo = document.getElementById('stat-saldo-por-cobrar');

      if (elTotal) elTotal.textContent = totalContratos;
      if (elMes) elMes.textContent = eventosEsteMes;
      if (elIngresos) elIngresos.textContent = ContractModel.formatCurrency(ingresosTotales, false);
      if (elAnticipos) elAnticipos.textContent = ContractModel.formatCurrency(anticiposCobrados, false);
      if (elSaldo) elSaldo.textContent = ContractModel.formatCurrency(saldoPorCobrar, false);

      const recentTable = document.getElementById('dashboard-recent-table');
      if (recentTable) {
        const recent = [...contracts]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5);

        if (recent.length === 0) {
          recentTable.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">No hay contratos registrados aún.</td></tr>`;
        } else {
          recentTable.innerHTML = recent.map(c => this.renderContractRow(c)).join('');
        }
      }

      const upcomingContainer = document.getElementById('dashboard-upcoming-banner');
      if (upcomingContainer) {
        const upcoming = contracts
          .filter(c => c.event && c.event.date && c.event.date >= todayStr && (!c.payments || c.payments.status !== 'cancelled'))
          .sort((a, b) => (a.event.date || '').localeCompare(b.event.date || ''));

        if (upcoming.length > 0) {
          const next = upcoming[0];
          const clientName = next.client ? next.client.name : 'Cliente';
          const folio = next.folio || '0000';
          const eventDate = next.event ? next.event.date : '';
          const dayOfWeek = next.event ? next.event.dayOfWeek : '';
          const startTime = next.event ? next.event.startTime : '';
          const address = next.client ? next.client.address : '';

          upcomingContainer.innerHTML = `
            <div class="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  🌮
                </div>
                <div>
                  <span class="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">Próxima Taquiza</span>
                  <h3 class="text-lg font-black mt-1">${clientName} (Folio #${folio})</h3>
                  <p class="text-xs text-red-100 mt-0.5">
                    📅 ${ContractModel.formatDateHuman(eventDate)} (${dayOfWeek}) • ⏰ ${ContractModel.formatTime12(startTime)} • 📍 ${address || 'Córdoba, Ver.'}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 w-full md:w-auto justify-end">
                <button onclick="App.viewAndPrintContract('${next.id}')" class="px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-bold rounded-xl text-xs shadow-sm transition-all">
                  🖨️ Ver Contrato
                </button>
                <button onclick="CalendarManager.showEventModal('${next.id}')" class="px-4 py-2 bg-red-900/50 hover:bg-red-900/80 text-white font-bold rounded-xl text-xs transition-all">
                  Detalles
                </button>
              </div>
            </div>
          `;
        } else {
          upcomingContainer.innerHTML = '';
        }
      }
    } catch (e) {
      console.error('Error rendering stats:', e);
    }
  },

  renderContractsTable() {
    const tableBody = document.getElementById('contracts-table-body');
    if (!tableBody) return;

    let contracts = StorageManager.getContracts() || [];

    if (this.searchQuery) {
      const q = this.searchQuery;
      contracts = contracts.filter(c => {
        const folio = c.folio ? c.folio.toLowerCase() : '';
        const name = c.client && c.client.name ? c.client.name.toLowerCase() : '';
        const phone = c.client && c.client.phone ? c.client.phone : '';
        const address = c.client && c.client.address ? c.client.address.toLowerCase() : '';
        const date = c.event && c.event.date ? c.event.date : '';
        return folio.includes(q) || name.includes(q) || phone.includes(q) || address.includes(q) || date.includes(q);
      });
    }

    if (this.activeFilter && this.activeFilter !== 'all') {
      contracts = contracts.filter(c => c.payments && c.payments.status === this.activeFilter);
    }

    contracts.sort((a, b) => {
      const dateA = a.event ? a.event.date : a.contractDate;
      const dateB = b.event ? b.event.date : b.contractDate;
      return (dateB || '').localeCompare(dateA || '');
    });

    if (contracts.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-12 text-slate-400">
            <div class="text-3xl mb-2">🔍</div>
            <p class="text-sm font-semibold">No se encontraron contratos.</p>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = contracts.map(c => this.renderContractRow(c)).join('');
  },

  renderContractRow(c) {
    if (!c.client) c.client = {};
    if (!c.event) c.event = {};
    if (!c.payments) c.payments = {};

    const status = c.payments.status || 'pending';
    let badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    let statusText = 'Anticipo Dado';

    if (status === 'paid') {
      badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      statusText = '✓ Liquidado';
    } else if (status === 'cancelled') {
      badgeClass = 'bg-slate-100 text-slate-600 border-slate-300';
      statusText = 'Cancelado';
    } else if (c.payments.remainingBalance === c.payments.total) {
      badgeClass = 'bg-red-100 text-red-800 border-red-300';
      statusText = 'Sin Anticipo';
    }

    return `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-200 text-sm">
        <td class="py-3 px-4 font-black text-slate-900">
          <span class="bg-slate-900 text-white text-xs px-2 py-0.5 rounded font-mono">#${c.folio || '0000'}</span>
        </td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-800">${c.client.name || 'Sin Nombre'}</div>
          <div class="text-xs text-slate-500">${c.client.phone || 'Sin teléfono'}</div>
        </td>
        <td class="py-3 px-4 text-xs">
          <div class="font-semibold text-slate-700">📅 ${ContractModel.formatDateHuman(c.event.date)}</div>
          <div class="text-slate-500">⏰ ${ContractModel.formatTime12(c.event.startTime)} (${c.event.dayOfWeek || ''})</div>
        </td>
        <td class="py-3 px-4 text-right font-semibold text-slate-800">
          ${ContractModel.formatCurrency(c.payments.total)}
        </td>
        <td class="py-3 px-4 text-right font-black ${(c.payments.remainingBalance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}">
          ${ContractModel.formatCurrency(c.payments.remainingBalance)}
        </td>
        <td class="py-3 px-4 text-center">
          <span class="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}">
            ${statusText}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="App.viewAndPrintContract('${c.id}')" class="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Imprimir / Descargar PDF">
              🖨️
            </button>
            <button onclick="App.openQuickAnticipoModal('${c.id}')" class="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Registrar Anticipo">
              💵
            </button>
            <button onclick="App.sendWhatsAppMessage('${c.id}')" class="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Compartir WhatsApp">
              📱
            </button>
            <button onclick="App.editContract('${c.id}')" class="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
              ✏️
            </button>
            <button onclick="App.duplicateContract('${c.id}')" class="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Duplicar">
              📋
            </button>
            <button onclick="App.confirmDeleteContract('${c.id}')" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  },

  newContract() {
    const nextFolio = StorageManager.getNextFolio();
    this.editingContract = ContractModel.createEmptyContract(nextFolio);
    this.loadContractIntoForm(this.editingContract);
    this.navigate('editor');
    this.updateLivePreview();
  },

  newContractForDate(dateStr) {
    const nextFolio = StorageManager.getNextFolio();
    this.editingContract = ContractModel.createEmptyContract(nextFolio);
    this.editingContract.event.date = dateStr;
    this.editingContract.event.dayOfWeek = ContractModel.getDayOfWeek(dateStr);
    this.loadContractIntoForm(this.editingContract);
    this.navigate('editor');
    this.updateLivePreview();
  },

  editContract(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) {
      this.showToast('No se encontró el contrato seleccionado.', 'error');
      return;
    }
    this.editingContract = JSON.parse(JSON.stringify(contract));
    this.loadContractIntoForm(this.editingContract);
    this.navigate('editor');
    this.updateLivePreview();
  },

  duplicateContract(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    const nextFolio = StorageManager.getNextFolio();
    const duplicated = JSON.parse(JSON.stringify(contract));
    
    duplicated.id = `TK-${new Date().getFullYear()}-${nextFolio}`;
    duplicated.folio = nextFolio;
    duplicated.contractDate = new Date().toISOString().split('T')[0];
    duplicated.payments.anticipos = [];
    duplicated.payments.totalAnticipos = 0;
    ContractModel.recalculateTotals(duplicated);

    this.editingContract = duplicated;
    this.loadContractIntoForm(duplicated);
    this.navigate('editor');
    this.updateLivePreview();
    this.showToast(`Contrato duplicado con nuevo Folio #${nextFolio}`, 'info');
  },

  loadContractIntoForm(contract) {
    if (!contract) return;
    if (!contract.client) contract.client = {};
    if (!contract.event) contract.event = {};
    if (!contract.payments) contract.payments = {};

    const get = (id) => document.getElementById(id);

    if (get('input-folio')) get('input-folio').value = contract.folio || '';
    if (get('input-contract-date')) get('input-contract-date').value = contract.contractDate || '';
    
    if (get('input-client-name')) get('input-client-name').value = contract.client.name || '';
    if (get('input-client-phone')) get('input-client-phone').value = contract.client.phone || '';
    if (get('input-client-address')) get('input-client-address').value = contract.client.address || '';
    if (get('input-client-reference')) get('input-client-reference').value = contract.client.reference || '';

    if (get('input-event-type')) get('input-event-type').value = contract.event.type || '';
    if (get('input-event-amount')) get('input-event-amount').value = contract.event.amount || 0;
    if (get('input-complements')) get('input-complements').value = contract.event.complementsText || ContractModel.DEFAULT_COMPLEMENTS_TEXT;
    if (get('input-additionals')) get('input-additionals').value = contract.event.additionals || '';
    if (get('input-additionals-amount')) get('input-additionals-amount').value = contract.event.additionalsAmount || 0;
    if (get('input-travel-cost')) get('input-travel-cost').value = contract.event.travelCost || 0;

    if (get('input-event-date')) get('input-event-date').value = contract.event.date || '';
    if (get('input-event-day')) get('input-event-day').value = contract.event.dayOfWeek || '';
    if (get('input-arrival-time')) get('input-arrival-time').value = contract.event.arrivalTime || '';
    if (get('input-start-time')) get('input-start-time').value = contract.event.startTime || '';
    if (get('input-service-time')) get('input-service-time').value = contract.event.serviceTime || '2 HORAS';
    if (get('input-end-time')) get('input-end-time').value = contract.event.endTime || '';
    if (get('input-assigned-staff')) get('input-assigned-staff').value = contract.event.assignedStaff || '';
    if (get('input-elaborated-by')) get('input-elaborated-by').value = contract.elaboratedBy || '';

    if (get('input-iva-rate')) get('input-iva-rate').value = contract.payments.ivaRate || 0;

    this.renderFormAnticiposList();
  },

  renderFormAnticiposList() {
    const listContainer = document.getElementById('form-anticipos-container');
    if (!listContainer || !this.editingContract) return;

    const anticipos = this.editingContract.payments.anticipos || [];

    let html = '';
    anticipos.forEach((ant, index) => {
      html += `
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 relative group">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-slate-700">Anticipo #${index + 1}</span>
            <button type="button" onclick="App.removeAnticipoRow(${index})" class="text-red-500 hover:text-red-700 text-xs font-bold p-1">
              ✕ Eliminar
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label class="text-[11px] font-semibold text-slate-500 block mb-0.5">Fecha</label>
              <input type="date" value="${ant.date || ''}" onchange="App.updateAnticipoField(${index}, 'date', this.value)" class="w-full text-xs p-1.5 border rounded-lg bg-white">
            </div>
            <div>
              <label class="text-[11px] font-semibold text-slate-500 block mb-0.5">Tipo de Pago</label>
              <select onchange="App.updateAnticipoField(${index}, 'type', this.value)" class="w-full text-xs p-1.5 border rounded-lg bg-white">
                <option value="Efectivo" ${ant.type === 'Efectivo' ? 'selected' : ''}>Efectivo</option>
                <option value="Transferencia" ${ant.type === 'Transferencia' ? 'selected' : ''}>Transferencia</option>
                <option value="Tarjeta" ${ant.type === 'Tarjeta' ? 'selected' : ''}>Tarjeta</option>
                <option value="Depósito" ${ant.type === 'Depósito' ? 'selected' : ''}>Depósito</option>
              </select>
            </div>
            <div>
              <label class="text-[11px] font-semibold text-slate-500 block mb-0.5">Monto ($)</label>
              <input type="number" step="any" min="0" value="${ant.amount || 0}" oninput="App.updateAnticipoField(${index}, 'amount', this.value)" class="w-full text-xs p-1.5 border rounded-lg bg-white font-bold text-slate-900">
            </div>
          </div>
          <div>
            <input type="text" placeholder="Nota o concepto (ej. Apartado 50%)" value="${ant.note || ''}" oninput="App.updateAnticipoField(${index}, 'note', this.value)" class="w-full text-xs p-1.5 border rounded-lg bg-white text-slate-600">
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
  },

  addAnticipoRow() {
    if (!this.editingContract) return;
    const todayStr = new Date().toISOString().split('T')[0];
    if (!this.editingContract.payments.anticipos) {
      this.editingContract.payments.anticipos = [];
    }
    this.editingContract.payments.anticipos.push({
      id: 'ant-' + Date.now(),
      date: todayStr,
      type: 'Efectivo',
      amount: 0,
      note: ''
    });
    this.renderFormAnticiposList();
    this.syncFormToModel();
    this.updateLivePreview();
  },

  removeAnticipoRow(index) {
    if (!this.editingContract || !this.editingContract.payments.anticipos) return;
    this.editingContract.payments.anticipos.splice(index, 1);
    this.renderFormAnticiposList();
    this.syncFormToModel();
    this.updateLivePreview();
  },

  updateAnticipoField(index, field, value) {
    if (!this.editingContract || !this.editingContract.payments.anticipos || !this.editingContract.payments.anticipos[index]) return;
    this.editingContract.payments.anticipos[index][field] = field === 'amount' ? (parseFloat(value) || 0) : value;
    this.syncFormToModel();
    this.updateLivePreview();
  },

  onEventDateChange(dateValue) {
    const day = ContractModel.getDayOfWeek(dateValue);
    const dayInput = document.getElementById('input-event-day');
    if (dayInput) dayInput.value = day;
    this.syncFormToModel();
    this.updateLivePreview();
  },

  onStartTimeChange() {
    const startTime = document.getElementById('input-start-time').value;
    const serviceTime = document.getElementById('input-service-time').value;
    const endTime = ContractModel.calculateEndTime(startTime, serviceTime);
    const endInput = document.getElementById('input-end-time');
    if (endInput) endInput.value = endTime;
    this.syncFormToModel();
    this.updateLivePreview();
  },

  syncFormToModel() {
    if (!this.editingContract) return;

    const get = (id) => document.getElementById(id);

    if (get('input-folio')) this.editingContract.folio = get('input-folio').value.trim();
    if (get('input-contract-date')) this.editingContract.contractDate = get('input-contract-date').value;

    if (get('input-client-name')) this.editingContract.client.name = get('input-client-name').value.trim();
    if (get('input-client-phone')) this.editingContract.client.phone = get('input-client-phone').value.trim();
    if (get('input-client-address')) this.editingContract.client.address = get('input-client-address').value.trim();
    if (get('input-client-reference')) this.editingContract.client.reference = get('input-client-reference').value.trim();

    if (get('input-event-type')) this.editingContract.event.type = get('input-event-type').value;
    if (get('input-event-amount')) this.editingContract.event.amount = parseFloat(get('input-event-amount').value) || 0;
    if (get('input-complements')) this.editingContract.event.complementsText = get('input-complements').value;
    if (get('input-additionals')) this.editingContract.event.additionals = get('input-additionals').value;
    if (get('input-additionals-amount')) this.editingContract.event.additionalsAmount = parseFloat(get('input-additionals-amount').value) || 0;
    if (get('input-travel-cost')) this.editingContract.event.travelCost = parseFloat(get('input-travel-cost').value) || 0;

    if (get('input-event-date')) this.editingContract.event.date = get('input-event-date').value;
    if (get('input-event-day')) this.editingContract.event.dayOfWeek = get('input-event-day').value;
    if (get('input-arrival-time')) this.editingContract.event.arrivalTime = get('input-arrival-time').value;
    if (get('input-start-time')) this.editingContract.event.startTime = get('input-start-time').value;
    if (get('input-service-time')) this.editingContract.event.serviceTime = get('input-service-time').value;
    if (get('input-end-time')) this.editingContract.event.endTime = get('input-end-time').value;
    if (get('input-assigned-staff')) this.editingContract.event.assignedStaff = get('input-assigned-staff').value;
    if (get('input-elaborated-by')) this.editingContract.elaboratedBy = get('input-elaborated-by').value;

    if (get('input-iva-rate')) this.editingContract.payments.ivaRate = parseFloat(get('input-iva-rate').value) || 0;

    ContractModel.recalculateTotals(this.editingContract);

    const subtotalDisplay = document.getElementById('display-form-subtotal');
    const totalDisplay = document.getElementById('display-form-total');
    const saldoDisplay = document.getElementById('display-form-saldo');

    if (subtotalDisplay) subtotalDisplay.textContent = ContractModel.formatCurrency(this.editingContract.payments.subtotal);
    if (totalDisplay) totalDisplay.textContent = ContractModel.formatCurrency(this.editingContract.payments.total);
    if (saldoDisplay) saldoDisplay.textContent = ContractModel.formatCurrency(this.editingContract.payments.remainingBalance);
  },

  updateLivePreview() {
    const previewContainer = document.getElementById('live-preview-container');
    if (!previewContainer || !this.editingContract) return;

    previewContainer.innerHTML = PDFGenerator.renderContractHTML(this.editingContract);
  },

  saveCurrentContract() {
    this.syncFormToModel();

    if (!this.editingContract.client.name) {
      this.showToast('Por favor ingresa el nombre del cliente.', 'warning');
      const nameInput = document.getElementById('input-client-name');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!this.editingContract.folio) {
      this.editingContract.folio = StorageManager.getNextFolio();
    }

    StorageManager.upsertContract(this.editingContract);
    this.showToast(`Contrato Folio #${this.editingContract.folio} guardado correctamente.`, 'success');
    this.renderStats();
    this.renderContractsTable();
    if (typeof CalendarManager !== 'undefined') CalendarManager.render();
  },

  viewAndPrintContract(contractId) {
    const contract = (contractId ? StorageManager.getContract(contractId) : null) || this.editingContract;
    if (!contract) return;

    PDFGenerator.printContract(contract);
  },

  downloadContractPDF(contractId) {
    const contract = (contractId ? StorageManager.getContract(contractId) : null) || this.editingContract;
    if (!contract) return;

    PDFGenerator.downloadPDF(contract);
  },

  openQuickAnticipoModal(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    const modal = document.getElementById('quick-anticipo-modal');
    const content = document.getElementById('quick-anticipo-modal-content');
    if (!modal || !content) return;

    const todayStr = new Date().toISOString().split('T')[0];

    content.innerHTML = `
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <span class="text-xs font-bold text-red-600 uppercase">Abonar / Liquidar</span>
          <h3 class="text-lg font-black text-slate-900">${contract.client.name} (Folio #${contract.folio})</h3>
        </div>
        <button onclick="App.closeModal('quick-anticipo-modal')" class="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
      </div>

      <div class="bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4 text-xs flex justify-between">
        <div>
          <span class="text-slate-500 block">Total del Contrato:</span>
          <strong class="text-sm font-bold text-slate-900">${ContractModel.formatCurrency(contract.payments.total)}</strong>
        </div>
        <div>
          <span class="text-slate-500 block">Anticipos previos:</span>
          <strong class="text-sm font-bold text-emerald-700">${ContractModel.formatCurrency(contract.payments.totalAnticipos)}</strong>
        </div>
        <div>
          <span class="text-slate-500 block">Saldo Restante:</span>
          <strong class="text-sm font-black text-red-600">${ContractModel.formatCurrency(contract.payments.remainingBalance)}</strong>
        </div>
      </div>

      <form id="quick-anticipo-form" onsubmit="event.preventDefault(); App.submitQuickAnticipo('${contract.id}')" class="space-y-3">
        <div>
          <label class="text-xs font-bold text-slate-700 block mb-1">Monto del Anticipo ($ MXN)</label>
          <input type="number" step="any" min="1" max="${contract.payments.remainingBalance || contract.payments.total}" id="quick-anticipo-amount" value="${contract.payments.remainingBalance || 0}" required class="w-full text-base font-black p-2.5 border rounded-xl bg-white border-amber-300 focus:ring-2 focus:ring-amber-500">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Fecha</label>
            <input type="date" id="quick-anticipo-date" value="${todayStr}" required class="w-full text-xs p-2 border rounded-xl bg-white">
          </div>
          <div>
            <label class="text-xs font-bold text-slate-700 block mb-1">Tipo de Pago</label>
            <select id="quick-anticipo-type" class="w-full text-xs p-2 border rounded-xl bg-white">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Depósito">Depósito</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-700 block mb-1">Nota o Concepto</label>
          <input type="text" id="quick-anticipo-note" placeholder="Ej. Liquidación final / Pago 2do abono" class="w-full text-xs p-2 border rounded-xl bg-white">
        </div>

        <div class="flex justify-end gap-2 border-t pt-4">
          <button type="button" onclick="App.closeModal('quick-anticipo-modal')" class="px-4 py-2 border rounded-xl text-slate-600 text-xs font-bold">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs">Guardar Anticipo</button>
        </div>
      </form>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  submitQuickAnticipo(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    const amount = parseFloat(document.getElementById('quick-anticipo-amount').value) || 0;
    const date = document.getElementById('quick-anticipo-date').value;
    const type = document.getElementById('quick-anticipo-type').value;
    const note = document.getElementById('quick-anticipo-note').value;

    if (amount <= 0) {
      this.showToast('El monto debe ser mayor a cero.', 'warning');
      return;
    }

    if (!contract.payments.anticipos) contract.payments.anticipos = [];

    contract.payments.anticipos.push({
      id: 'ant-' + Date.now(),
      date: date,
      type: type,
      amount: amount,
      note: note
    });

    ContractModel.recalculateTotals(contract);
    StorageManager.upsertContract(contract);

    this.closeModal('quick-anticipo-modal');
    this.closeModal('event-detail-modal');
    this.showToast(`Anticipo de ${ContractModel.formatCurrency(amount)} registrado con éxito.`, 'success');
    
    this.renderStats();
    this.renderContractsTable();
    if (typeof CalendarManager !== 'undefined') CalendarManager.render();
  },

  sendWhatsAppMessage(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    const dateHuman = ContractModel.formatDateHuman(contract.event ? contract.event.date : '');
    const phone = (contract.client && contract.client.phone ? contract.client.phone : '').replace(/[^0-9]/g, '');

    const message = `🔥 *TAKIRIN LA CHIMENEA - CONTRATO DE TAQUIZA* 🔥\n\n` +
      `Estimado(a) *${contract.client.name}*, le compartimos los detalles de su servicio de taquiza:\n\n` +
      `📄 *Folio:* ${contract.folio}\n` +
      `📅 *Fecha:* ${contract.event.dayOfWeek} ${dateHuman}\n` +
      `⏰ *Hora de Llegada:* ${ContractModel.formatTime12(contract.event.arrivalTime)}\n` +
      `⏰ *Hora de Servicio:* ${ContractModel.formatTime12(contract.event.startTime)} a ${ContractModel.formatTime12(contract.event.endTime)}\n` +
      `📍 *Lugar:* ${contract.client.address}\n\n` +
      `💵 *Total Contrato:* ${ContractModel.formatCurrency(contract.payments.total)}\n` +
      `✅ *Anticipo Registrado:* ${ContractModel.formatCurrency(contract.payments.totalAnticipos)}\n` +
      `⏳ *Saldo Restante:* ${ContractModel.formatCurrency(contract.payments.remainingBalance)}\n\n` +
      `¡Gracias por su preferencia! Donde la carne es más suave que la tortilla. 🌮🔥\n` +
      `📞 Tel: 271 157 1770 | Calle 15 #221, Col. Centro, Córdoba, Ver.`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/52${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
  },

  confirmDeleteContract(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    if (confirm(`¿Estás seguro de eliminar el contrato Folio #${contract.folio} de "${contract.client.name}"? Esta acción no se puede deshacer.`)) {
      StorageManager.deleteContract(contractId);
      this.showToast(`Contrato #${contract.folio} eliminado.`, 'info');
      this.renderStats();
      this.renderContractsTable();
      if (typeof CalendarManager !== 'undefined') CalendarManager.render();
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-amber-500 text-white',
      info: 'bg-slate-800 text-white'
    };

    const toast = document.createElement('div');
    toast.className = `${colors[type] || colors.info} px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

window.App = App;

// Run init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
