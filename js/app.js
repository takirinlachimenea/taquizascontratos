/**
 * Takirin La Chimenea - Main Application Controller
 * Navegación, Edición Blindada, Cancelación sin Borrado, Anticipos y WhatsApp
 */

const App = {
  currentView: 'dashboard',
  editingContract: null,
  activeFilter: 'all',
  searchQuery: '',

  async init() {
    this.setupEventListeners();
    await StorageManager.init();
    this.renderStats();
    this.renderContractsTable();
    if (typeof CalendarManager !== 'undefined') {
      CalendarManager.init();
    }
  },

  setupEventListeners() {
    // Navigation items
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = link.getAttribute('data-view');
        if (view) this.navigate(view);
      });
    });

    // Search input
    const searchInput = document.getElementById('search-contracts-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderContractsTable();
      });
    }

    // Status filter
    const statusFilter = document.getElementById('filter-contracts-status');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.activeFilter = e.target.value;
        this.renderContractsTable();
      });
    }

    // Live form inputs for real-time preview sync
    const form = document.getElementById('contract-form');
    if (form) {
      form.addEventListener('input', () => this.onFormChange());
    }
  },

  navigate(viewId) {
    this.currentView = viewId;

    // Hide all view sections
    document.querySelectorAll('main > section').forEach(sec => {
      sec.classList.add('hidden');
    });

    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.remove('hidden');
    }

    // Update active nav-link
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Refresh view specific contents
    if (viewId === 'dashboard') {
      this.renderStats();
    } else if (viewId === 'contracts') {
      this.renderContractsTable();
    } else if (viewId === 'calendar') {
      if (typeof CalendarManager !== 'undefined') CalendarManager.render();
    } else if (viewId === 'editor') {
      this.updateLivePreview();
    } else if (viewId === 'sync') {
      const urlInput = document.getElementById('input-firebase-url');
      if (urlInput && typeof StorageManager !== 'undefined') {
        urlInput.value = StorageManager.getFirebaseUrl();
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderStats() {
    try {
      const contracts = StorageManager.getContracts() || [];
      const totalContratos = contracts.length;
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const todayStr = now.toISOString().split('T')[0];

      let eventosEsteMes = 0;
      let ingresosTotales = 0;
      let anticiposCobrados = 0;
      let saldoPorCobrar = 0;

      contracts.forEach(c => {
        if (!c.payments) return;
        const isCancelled = c.payments.status === 'cancelled';

        if (!isCancelled) {
          ingresosTotales += (c.payments.total || 0);
          anticiposCobrados += (c.payments.totalAnticipos || 0);
          saldoPorCobrar += (c.payments.remainingBalance || 0);
        }

        if (c.event && c.event.date && !isCancelled) {
          const parts = c.event.date.split('-');
          if (parts.length >= 2) {
            const evYear = parseInt(parts[0], 10);
            const evMonth = parseInt(parts[1], 10) - 1;
            if (evYear === currentYear && evMonth === currentMonth) {
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
          .slice(0, 6);

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
                <button onclick="App.viewAndPrintContract('${next.id}')" class="px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer">
                  🖨️ Ver Contrato
                </button>
                <button onclick="CalendarManager.showEventModal('${next.id}')" class="px-4 py-2 bg-red-900/50 hover:bg-red-900/80 text-white font-bold rounded-xl text-xs transition-all cursor-pointer">
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
    const isCancelled = status === 'cancelled';
    
    let badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    let statusText = 'Anticipo Dado';

    if (isCancelled) {
      badgeClass = 'bg-slate-200 text-slate-700 border-slate-400';
      statusText = '🚫 Cancelado';
    } else if (status === 'paid') {
      badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      statusText = '✓ Liquidado';
    } else if (c.payments.remainingBalance === c.payments.total) {
      badgeClass = 'bg-red-100 text-red-800 border-red-300';
      statusText = 'Sin Anticipo';
    }

    return `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-200 text-sm ${isCancelled ? 'bg-slate-50/60 opacity-75' : ''}">
        <td class="py-3 px-4 font-black text-slate-900 cursor-pointer" onclick="App.editContract('${c.id}')" title="Hacer clic para editar">
          <span class="${isCancelled ? 'bg-slate-500' : 'bg-slate-900 hover:bg-red-600'} text-white text-xs px-2 py-0.5 rounded font-mono transition-colors">#${c.folio || '0000'}</span>
        </td>
        <td class="py-3 px-4 cursor-pointer" onclick="App.editContract('${c.id}')" title="Hacer clic para editar">
          <div class="font-bold text-slate-800 hover:text-red-600 transition-colors ${isCancelled ? 'line-through text-slate-500' : ''}">${c.client.name || 'Sin Nombre'}</div>
          <div class="text-xs text-slate-500">${c.client.phone || 'Sin teléfono'}</div>
        </td>
        <td class="py-3 px-4 text-xs">
          <div class="font-semibold text-slate-700">📅 ${ContractModel.formatDateHuman(c.event.date)}</div>
          <div class="text-slate-500">⏰ ${ContractModel.formatTime12(c.event.startTime)} (${c.event.dayOfWeek || ''})</div>
        </td>
        <td class="py-3 px-4 text-right font-semibold text-slate-800">
          ${ContractModel.formatCurrency(c.payments.total)}
        </td>
        <td class="py-3 px-4 text-right font-black ${isCancelled ? 'text-slate-400' : ((c.payments.remainingBalance || 0) > 0 ? 'text-red-600' : 'text-emerald-600')}">
          ${ContractModel.formatCurrency(c.payments.remainingBalance)}
        </td>
        <td class="py-3 px-4 text-center">
          <span class="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeClass}">
            ${statusText}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="App.downloadContractPDF('${c.id}')" class="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 rounded-lg transition-colors font-bold text-xs flex items-center gap-1 cursor-pointer" title="Guardar en PDF (Tamaño Carta)">
              📥 PDF
            </button>
            <button onclick="App.viewAndPrintContract('${c.id}')" class="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Imprimir Formato">
              🖨️
            </button>
            ${!isCancelled ? `
              <button onclick="App.openQuickAnticipoModal('${c.id}')" class="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" title="Registrar Anticipo">
                💵
              </button>
              <button onclick="App.sendWhatsAppMessage('${c.id}')" class="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Compartir WhatsApp">
                📱
              </button>
            ` : ''}
            <button onclick="App.editContract('${c.id}')" class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-bold cursor-pointer" title="Editar Contrato">
              ✏️
            </button>
            <button onclick="App.duplicateContract('${c.id}')" class="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer" title="Duplicar">
              📋
            </button>
            
            ${isCancelled ? `
              <button onclick="App.toggleCancelContract('${c.id}')" class="px-2 py-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors font-bold text-xs cursor-pointer" title="Reactivar Contrato">
                🔄 Reactivar
              </button>
            ` : `
              <button onclick="App.toggleCancelContract('${c.id}')" class="p-1.5 text-amber-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Cancelar Contrato (Sin borrar)">
                🚫
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  },

  /**
   * CANCEL / REACTIVATE CONTRACT WITHOUT DELETING
   */
  toggleCancelContract(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    const isCurrentlyCancelled = contract.payments && contract.payments.status === 'cancelled';

    if (isCurrentlyCancelled) {
      if (confirm(`¿Deseas REACTIVAR el contrato Folio #${contract.folio} de "${contract.client.name}"?`)) {
        const total = contract.payments.total || 0;
        const remaining = contract.payments.remainingBalance || 0;
        if (remaining <= 0) {
          contract.payments.status = 'paid';
        } else if (contract.payments.totalAnticipos > 0) {
          contract.payments.status = 'partial';
        } else {
          contract.payments.status = 'pending';
        }
        delete contract.cancellation;
        contract.updatedAt = new Date().toISOString();

        StorageManager.upsertContract(contract);
        this.showToast(`Contrato #${contract.folio} reactivado exitosamente.`, 'success');
        this.renderStats();
        this.renderContractsTable();
        if (typeof CalendarManager !== 'undefined') CalendarManager.render();
      }
    } else {
      const eventDate = contract.event ? contract.event.date : '';
      let penaltyText = '';
      if (eventDate) {
        const today = new Date();
        const evD = new Date(eventDate);
        const diffDays = Math.ceil((evD - today) / (1000 * 60 * 60 * 24));
        const total = contract.payments.total || 0;
        
        if (diffDays > 15) {
          const pen = total * 0.05;
          penaltyText = `\n\n📌 Aplica cláusula de penalización del 5%: ${ContractModel.formatCurrency(pen)} (>15 días de anticipación).`;
        } else if (diffDays >= 0) {
          const pen = total * 0.10;
          penaltyText = `\n\n📌 Aplica cláusula de penalización del 10%: ${ContractModel.formatCurrency(pen)} (<=10 días de anticipación).`;
        }
      }

      const reason = prompt(
        `¿Deseas marcar como CANCELADO el contrato Folio #${contract.folio} de "${contract.client.name}"?` +
        `\n(El contrato NO se borrará; quedará guardado como cancelado en tu historial).` +
        penaltyText +
        `\n\nIngresa el motivo de cancelación (Opcional):`,
        'Cancelado por el cliente'
      );

      if (reason !== null) {
        contract.payments.status = 'cancelled';
        contract.cancellation = {
          cancelledAt: new Date().toISOString(),
          reason: reason || 'Cancelado por el cliente'
        };
        contract.updatedAt = new Date().toISOString();

        StorageManager.upsertContract(contract);
        this.showToast(`Contrato #${contract.folio} marcado como CANCELADO.`, 'warning');
        this.renderStats();
        this.renderContractsTable();
        if (typeof CalendarManager !== 'undefined') CalendarManager.render();
      }
    }
  },

  newContract() {
    const nextFolio = StorageManager.getNextFolio();
    this.editingContract = ContractModel.createEmptyContract(nextFolio);
    this.loadContractIntoForm(this.editingContract);
    this.navigate('editor');
    this.updateLivePreview();

    const heading = document.getElementById('editor-title-heading');
    const subtitle = document.getElementById('editor-subtitle-text');
    const banner = document.getElementById('editor-mode-banner');

    if (heading) heading.textContent = `Nuevo Contrato de Taquiza (Folio #${nextFolio})`;
    if (subtitle) subtitle.textContent = `Llena los datos y los cambios se reflejarán en tiempo real.`;
    if (banner) banner.classList.add('hidden');

    setTimeout(() => {
      const clientInput = document.getElementById('input-client-name');
      if (clientInput) clientInput.focus();
    }, 150);
  },

  newContractForDate(dateStr) {
    const nextFolio = StorageManager.getNextFolio();
    this.editingContract = ContractModel.createEmptyContract(nextFolio);
    this.editingContract.event.date = dateStr;
    this.editingContract.event.dayOfWeek = ContractModel.getDayOfWeekSpanish(dateStr);
    this.loadContractIntoForm(this.editingContract);
    this.navigate('editor');
    this.updateLivePreview();

    const heading = document.getElementById('editor-title-heading');
    const subtitle = document.getElementById('editor-subtitle-text');
    const banner = document.getElementById('editor-mode-banner');

    if (heading) heading.textContent = `Nuevo Contrato para el ${ContractModel.formatDateHuman(dateStr)} (Folio #${nextFolio})`;
    if (subtitle) subtitle.textContent = `Llena los datos del cliente y los cambios se reflejarán en vivo.`;
    if (banner) banner.classList.add('hidden');

    setTimeout(() => {
      const clientInput = document.getElementById('input-client-name');
      if (clientInput) clientInput.focus();
    }, 150);
  },

  /**
   * ULTRA-ROBUST EDIT CONTRACT
   */
  editContract(contractId) {
    try {
      const contracts = StorageManager.getContracts() || [];
      let contract = contracts.find(c => String(c.id) === String(contractId) || String(c.folio) === String(contractId));

      if (!contract) {
        contract = StorageManager.getContract(contractId);
      }

      if (!contract) {
        this.showToast('No se encontró el contrato seleccionado.', 'warning');
        return;
      }

      // Close modal if open
      this.closeModal('event-detail-modal');
      this.closeModal('quick-anticipo-modal');

      // Deep clone so editing does not mutate original until saved
      this.editingContract = JSON.parse(JSON.stringify(contract));
      this.loadContractIntoForm(this.editingContract);
      this.navigate('editor');
      this.updateLivePreview();

      // Update banner & headings
      const heading = document.getElementById('editor-title-heading');
      const subtitle = document.getElementById('editor-subtitle-text');
      const banner = document.getElementById('editor-mode-banner');
      const bannerText = document.getElementById('editor-mode-banner-text');

      if (heading) heading.textContent = `Editando Folio #${contract.folio || '0000'}`;
      if (subtitle) subtitle.textContent = `Cliente: ${contract.client && contract.client.name ? contract.client.name : 'Sin nombre'} • Realiza tus cambios y presiona Guardar.`;
      if (banner && bannerText) {
        bannerText.innerHTML = `<strong>Editando Folio #${contract.folio}:</strong> Modifica los datos que desees y pulsa <strong>Guardar Contrato</strong>.`;
        banner.classList.remove('hidden');
      }

      setTimeout(() => {
        const clientInput = document.getElementById('input-client-name');
        if (clientInput) {
          clientInput.focus();
          clientInput.select();
        }
      }, 150);

      this.showToast(`Cargado contrato Folio #${contract.folio} para editar.`, 'info');
    } catch (err) {
      console.error('Error al editar contrato:', err);
      this.showToast('Error al abrir el editor: ' + err.message, 'error');
    }
  },

  duplicateContract(contractId) {
    const original = StorageManager.getContract(contractId);
    if (!original) return;

    const nextFolio = StorageManager.getNextFolio();
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = ContractModel.generateId();
    copy.folio = nextFolio;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    copy.contractDate = new Date().toISOString().split('T')[0];
    copy.payments.anticipos = [];
    copy.payments.totalAnticipos = 0;
    copy.payments.remainingBalance = copy.payments.total;
    copy.payments.status = 'pending';
    delete copy.cancellation;

    this.editingContract = copy;
    this.loadContractIntoForm(copy);
    this.navigate('editor');
    this.updateLivePreview();
    this.showToast(`Copia creada con nuevo Folio #${nextFolio}`, 'info');
  },

  /**
   * Blinded Safe Form Population
   */
  loadContractIntoForm(contract) {
    if (!contract) return;
    
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = (val !== undefined && val !== null) ? val : '';
    };

    setVal('input-folio', contract.folio || '');
    setVal('input-contract-date', contract.contractDate || '');
    
    // Client
    setVal('input-client-name', (contract.client && contract.client.name) || '');
    setVal('input-client-phone', (contract.client && contract.client.phone) || '');
    setVal('input-client-reference', (contract.client && contract.client.reference) || '');
    setVal('input-client-address', (contract.client && contract.client.address) || '');

    // Event Menu & Price
    setVal('input-event-type', (contract.event && contract.event.type) || '');
    setVal('input-event-amount', (contract.event && contract.event.amount) || '');
    setVal('input-travel-cost', (contract.event && contract.event.travelCost) || 0);
    setVal('input-complements', (contract.event && contract.event.complementsText) || ContractModel.DEFAULT_COMPLEMENTS_TEXT);
    setVal('input-additionals', (contract.event && contract.event.additionals) || '');
    setVal('input-additionals-amount', (contract.event && contract.event.additionalsAmount) || 0);

    // Logistics
    setVal('input-event-date', (contract.event && contract.event.date) || '');
    setVal('input-event-day', (contract.event && contract.event.dayOfWeek) || '');
    setVal('input-arrival-time', (contract.event && contract.event.arrivalTime) || '');
    setVal('input-start-time', (contract.event && contract.event.startTime) || '');
    setVal('input-service-time', (contract.event && contract.event.serviceTime) || '2 HORAS');
    setVal('input-end-time', (contract.event && contract.event.endTime) || '');
    setVal('input-assigned-staff', (contract.event && contract.event.assignedStaff) || '');
    setVal('input-elaborated-by', contract.elaboratedBy || 'Alexis Lira');

    // Payments & Anticipos
    setVal('input-iva-rate', (contract.payments && contract.payments.ivaRate) || 0);
    this.renderFormAnticipos(contract.payments ? contract.payments.anticipos : []);
    this.recalculateFormTotals();
  },

  renderFormAnticipos(anticipos = []) {
    const container = document.getElementById('form-anticipos-container');
    if (!container) return;

    if (anticipos.length === 0) {
      container.innerHTML = `
        <div class="text-center py-2 text-xs text-slate-400 italic">
          No hay anticipos registrados aún. Pulsa "+ Agregar Anticipo" para registrar uno.
        </div>
      `;
      return;
    }

    container.innerHTML = anticipos.map((ant, index) => `
      <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
        <span class="font-bold text-slate-600 w-5">#${index + 1}</span>
        <div class="flex-1 min-w-[120px]">
          <input type="date" value="${ant.date || ''}" onchange="App.onAnticipoFieldChange(${index}, 'date', this.value)" class="w-full text-xs p-1.5 border border-slate-300 rounded-lg bg-white">
        </div>
        <div class="w-28">
          <select onchange="App.onAnticipoFieldChange(${index}, 'type', this.value)" class="w-full text-xs p-1.5 border border-slate-300 rounded-lg bg-white">
            <option value="Efectivo" ${ant.type === 'Efectivo' ? 'selected' : ''}>Efectivo</option>
            <option value="Transferencia" ${ant.type === 'Transferencia' ? 'selected' : ''}>Transferencia</option>
            <option value="Tarjeta" ${ant.type === 'Tarjeta' ? 'selected' : ''}>Tarjeta</option>
          </select>
        </div>
        <div class="w-28">
          <input type="number" step="any" min="0" placeholder="Monto $" value="${ant.amount || ''}" oninput="App.onAnticipoFieldChange(${index}, 'amount', this.value)" class="w-full text-xs font-bold p-1.5 border border-slate-300 rounded-lg bg-white text-right">
        </div>
        <button type="button" onclick="App.removeAnticipoRow(${index})" class="text-red-500 hover:text-red-700 p-1 font-bold text-sm cursor-pointer" title="Quitar este anticipo">
          ✕
        </button>
      </div>
    `).join('');
  },

  addAnticipoRow() {
    if (!this.editingContract.payments) this.editingContract.payments = {};
    if (!this.editingContract.payments.anticipos) this.editingContract.payments.anticipos = [];

    const todayStr = new Date().toISOString().split('T')[0];
    this.editingContract.payments.anticipos.push({
      id: 'ant-' + Date.now(),
      date: todayStr,
      type: 'Transferencia',
      amount: 0,
      note: ''
    });

    this.renderFormAnticipos(this.editingContract.payments.anticipos);
    this.recalculateFormTotals();
    this.updateLivePreview();
  },

  removeAnticipoRow(index) {
    if (this.editingContract.payments && this.editingContract.payments.anticipos) {
      this.editingContract.payments.anticipos.splice(index, 1);
      this.renderFormAnticipos(this.editingContract.payments.anticipos);
      this.recalculateFormTotals();
      this.updateLivePreview();
    }
  },

  onAnticipoFieldChange(index, field, value) {
    if (this.editingContract.payments && this.editingContract.payments.anticipos && this.editingContract.payments.anticipos[index]) {
      if (field === 'amount') {
        this.editingContract.payments.anticipos[index].amount = parseFloat(value) || 0;
      } else {
        this.editingContract.payments.anticipos[index][field] = value;
      }
      this.recalculateFormTotals();
      this.updateLivePreview();
    }
  },

  onEventDateChange(dateValue) {
    const dayInput = document.getElementById('input-event-day');
    if (dayInput && dateValue) {
      const dayName = ContractModel.getDayOfWeekSpanish(dateValue);
      dayInput.value = dayName;
    }
    this.onFormChange();
  },

  onStartTimeChange() {
    const startVal = document.getElementById('input-start-time').value;
    const servVal = document.getElementById('input-service-time').value;
    const endInput = document.getElementById('input-end-time');

    if (startVal && endInput) {
      const endCalculated = ContractModel.calculateEndTime(startVal, servVal);
      endInput.value = endCalculated;
    }
    this.onFormChange();
  },

  onFormChange() {
    this.syncFormToModel();
    this.recalculateFormTotals();
    this.updateLivePreview();
  },

  syncFormToModel() {
    if (!this.editingContract) return;

    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };

    this.editingContract.folio = getVal('input-folio').trim();
    this.editingContract.contractDate = getVal('input-contract-date');

    if (!this.editingContract.client) this.editingContract.client = {};
    this.editingContract.client.name = getVal('input-client-name').trim();
    this.editingContract.client.phone = getVal('input-client-phone').trim();
    this.editingContract.client.reference = getVal('input-client-reference').trim();
    this.editingContract.client.address = getVal('input-client-address').trim();

    if (!this.editingContract.event) this.editingContract.event = {};
    this.editingContract.event.type = getVal('input-event-type');
    this.editingContract.event.amount = parseFloat(getVal('input-event-amount')) || 0;
    this.editingContract.event.travelCost = parseFloat(getVal('input-travel-cost')) || 0;
    this.editingContract.event.complementsText = getVal('input-complements');
    this.editingContract.event.additionals = getVal('input-additionals');
    this.editingContract.event.additionalsAmount = parseFloat(getVal('input-additionals-amount')) || 0;

    this.editingContract.event.date = getVal('input-event-date');
    this.editingContract.event.dayOfWeek = getVal('input-event-day').toUpperCase();
    this.editingContract.event.arrivalTime = getVal('input-arrival-time');
    this.editingContract.event.startTime = getVal('input-start-time');
    this.editingContract.event.serviceTime = getVal('input-service-time');
    this.editingContract.event.endTime = getVal('input-end-time');
    this.editingContract.event.assignedStaff = getVal('input-assigned-staff');
    this.editingContract.elaboratedBy = getVal('input-elaborated-by');

    if (!this.editingContract.payments) this.editingContract.payments = {};
    this.editingContract.payments.ivaRate = parseFloat(getVal('input-iva-rate')) || 0;
  },

  recalculateFormTotals() {
    if (!this.editingContract) return;
    this.editingContract = ContractModel.calculateFinancials(this.editingContract);

    const subtotalEl = document.getElementById('display-form-subtotal');
    const totalEl = document.getElementById('display-form-total');
    const saldoEl = document.getElementById('display-form-saldo');

    if (subtotalEl) subtotalEl.textContent = ContractModel.formatCurrency(this.editingContract.payments.subtotal);
    if (totalEl) totalEl.textContent = ContractModel.formatCurrency(this.editingContract.payments.total);
    if (saldoEl) saldoEl.textContent = ContractModel.formatCurrency(this.editingContract.payments.remainingBalance);
  },

  updateLivePreview() {
    const previewContainer = document.getElementById('live-preview-container');
    if (!previewContainer || !this.editingContract) return;
    previewContainer.innerHTML = PDFGenerator.renderContractHTML(this.editingContract);
  },

  saveCurrentContract() {
    this.syncFormToModel();
    if (!this.editingContract.client || !this.editingContract.client.name) {
      this.showToast('Por favor escribe el nombre del cliente.', 'warning');
      const nameInput = document.getElementById('input-client-name');
      if (nameInput) nameInput.focus();
      return;
    }

    this.recalculateFormTotals();
    const saved = StorageManager.upsertContract(this.editingContract);
    this.showToast(`¡Contrato #${saved.folio} guardado exitosamente!`, 'success');
    this.renderStats();
    this.renderContractsTable();
    if (typeof CalendarManager !== 'undefined') CalendarManager.render();
  },

  saveAndReturn() {
    this.saveCurrentContract();
    setTimeout(() => {
      this.navigate('contracts');
    }, 350);
  },

  viewAndPrintContract(contractId) {
    let contract = null;
    if (contractId) {
      contract = StorageManager.getContract(contractId);
    } else if (this.editingContract) {
      this.syncFormToModel();
      this.recalculateFormTotals();
      contract = this.editingContract;
    }

    if (!contract) return;
    PDFGenerator.printContract(contract);
  },

  downloadContractPDF(contractId) {
    let contract = null;
    if (contractId) {
      contract = StorageManager.getContract(contractId);
    } else if (this.editingContract) {
      this.syncFormToModel();
      this.recalculateFormTotals();
      contract = this.editingContract;
    }

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
    const saldoActual = contract.payments ? contract.payments.remainingBalance : 0;

    content.innerHTML = `
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <span class="text-xs font-bold text-red-600 uppercase">Abono Rápido</span>
          <h3 class="text-lg font-black text-slate-900">Folio #${contract.folio} - ${contract.client.name}</h3>
        </div>
        <button onclick="App.closeModal('quick-anticipo-modal')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer">✕</button>
      </div>

      <div class="bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4 flex justify-between items-center text-xs">
        <span>Saldo Pendiente Actual:</span>
        <strong class="text-base text-red-600 font-black">${ContractModel.formatCurrency(saldoActual)}</strong>
      </div>

      <form onsubmit="event.preventDefault(); App.submitQuickAnticipo('${contract.id}')" class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Monto del Anticipo / Abono ($ MXN) *</label>
          <input type="number" step="any" min="1" id="quick-ant-amount" required placeholder="Ej. 1500" class="w-full text-base font-black p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Fecha de Pago</label>
            <input type="date" id="quick-ant-date" value="${todayStr}" class="w-full p-2 border border-slate-300 rounded-xl bg-white">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Método de Pago</label>
            <select id="quick-ant-type" class="w-full p-2 border border-slate-300 rounded-xl bg-white">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia" selected>Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Nota o Referencia (Opcional)</label>
          <input type="text" id="quick-ant-note" placeholder="Ej. Anticipo 50% / Liquidación" class="w-full p-2 border border-slate-300 rounded-xl bg-white">
        </div>

        <div class="pt-3 flex gap-2 justify-end border-t mt-4">
          <button type="button" onclick="App.closeModal('quick-anticipo-modal')" class="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 cursor-pointer">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer">
            💾 Registrar Abono
          </button>
        </div>
      </form>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
      const input = document.getElementById('quick-ant-amount');
      if (input) input.focus();
    }, 100);
  },

  submitQuickAnticipo(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    const amountInput = document.getElementById('quick-ant-amount');
    const dateInput = document.getElementById('quick-ant-date');
    const typeInput = document.getElementById('quick-ant-type');
    const noteInput = document.getElementById('quick-ant-note');

    const amount = parseFloat(amountInput.value) || 0;
    if (amount <= 0) {
      this.showToast('Ingresa un monto de anticipo válido.', 'warning');
      return;
    }

    if (!contract.payments) contract.payments = {};
    if (!contract.payments.anticipos) contract.payments.anticipos = [];

    contract.payments.anticipos.push({
      id: 'ant-' + Date.now(),
      date: dateInput.value,
      type: typeInput.value,
      amount: amount,
      note: noteInput.value.trim()
    });

    const updated = ContractModel.calculateFinancials(contract);
    StorageManager.upsertContract(updated);

    this.closeModal('quick-anticipo-modal');
    this.showToast(`¡Anticipo de ${ContractModel.formatCurrency(amount)} registrado!`, 'success');
    this.renderStats();
    this.renderContractsTable();
    if (typeof CalendarManager !== 'undefined') CalendarManager.render();
  },

  sendWhatsAppMessage(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    const phone = (contract.client.phone || '').replace(/\D/g, '');
    const clientName = contract.client.name || 'Cliente';
    const eventDate = ContractModel.formatDateHuman(contract.event.date);
    const time = ContractModel.formatTime12(contract.event.startTime);
    const service = contract.event.serviceTime || '2 HORAS';
    
    const message = 
      `🌮 *TAKIRIN LA CHIMENEA - RESUMEN DE TAQUIZA* 🌮\n\n` +
      `¡Hola ${clientName}! Le compartimos los detalles de su servicio:\n\n` +
      `📄 *Folio de Contrato:* #${contract.folio}\n` +
      `📅 *Fecha:* ${contract.event.dayOfWeek} ${eventDate}\n` +
      `⏰ *Horario de Servicio:* ${time} (${service})\n` +
      `📍 *Lugar:* ${contract.client.address || 'Córdoba, Ver.'}\n\n` +
      `💰 *Total del Servicio:* ${ContractModel.formatCurrency(contract.payments.total)}\n` +
      `✅ *Anticipo Registrado:* ${ContractModel.formatCurrency(contract.payments.totalAnticipos)}\n` +
      `⏳ *Saldo Restante:* ${ContractModel.formatCurrency(contract.payments.remainingBalance)}\n\n` +
      `¡Gracias por su preferencia! Donde la carne es más suave que la tortilla. 🌮🔥\n` +
      `📞 Tel: 271 157 1770 | Calle 15 #221, Col. Centro, Córdoba, Ver.`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/52${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
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
