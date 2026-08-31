/**
 * Takirin La Chimenea - Interactive Event Calendar
 */

const CalendarManager = {
  currentDate: new Date(),
  selectedDate: null,
  currentView: 'month', // 'month' | 'agenda'

  MONTH_NAMES: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],

  /**
   * Initialize calendar UI and event listeners
   */
  init() {
    this.render();
  },

  /**
   * Change current month
   * @param {number} delta -1 or 1
   */
  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.render();
  },

  /**
   * Jump to current today
   */
  goToToday() {
    this.currentDate = new Date();
    this.render();
  },

  /**
   * Render calendar view
   */
  render() {
    const calendarEl = document.getElementById('calendar-container');
    if (!calendarEl) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const contracts = StorageManager.getContracts();

    // Update Header Label
    const titleEl = document.getElementById('calendar-month-title');
    if (titleEl) {
      titleEl.textContent = `${this.MONTH_NAMES[month]} ${year}`;
    }

    // Filter events for this month or calculate metrics
    const monthEvents = contracts.filter(c => {
      if (!c.event || !c.event.date) return false;
      const [y, m] = c.event.date.split('-').map(Number);
      return y === year && (m - 1) === month;
    });

    if (this.currentView === 'agenda') {
      this.renderAgendaView(calendarEl, monthEvents);
    } else {
      this.renderMonthGrid(calendarEl, year, month, contracts);
    }

    this.renderUpcomingSidebar(contracts);
  },

  /**
   * Render classic month grid
   */
  renderMonthGrid(container, year, month, contracts) {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Group contracts by date YYYY-MM-DD
    const eventsByDate = {};
    contracts.forEach(c => {
      if (c.event && c.event.date) {
        if (!eventsByDate[c.event.date]) {
          eventsByDate[c.event.date] = [];
        }
        eventsByDate[c.event.date].push(c);
      }
    });

    let html = `
      <div class="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <!-- Day Names Header -->
        <div class="bg-slate-800 text-white font-semibold text-xs py-2 text-center">DOM</div>
        <div class="bg-slate-800 text-white font-semibold text-xs py-2 text-center">LUN</div>
        <div class="bg-slate-800 text-white font-semibold text-xs py-2 text-center">MAR</div>
        <div class="bg-slate-800 text-white font-semibold text-xs py-2 text-center">MIÉ</div>
        <div class="bg-slate-800 text-white font-semibold text-xs py-2 text-center">JUE</div>
        <div class="bg-slate-800 text-white font-semibold text-xs py-2 text-center">VIE</div>
        <div class="bg-slate-800 text-white font-semibold text-xs py-2 text-center">SÁB</div>
    `;

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      html += `
        <div class="bg-slate-50 min-h-[105px] p-1.5 opacity-40 text-slate-400">
          <div class="text-xs font-semibold">${dayNum}</div>
        </div>
      `;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = eventsByDate[dateStr] || [];
      const isToday = dateStr === todayStr;

      html += `
        <div class="bg-white min-h-[115px] p-2 transition-all hover:bg-red-50/40 relative group cursor-pointer ${isToday ? 'ring-2 ring-red-500 ring-inset bg-red-50/20' : ''}"
             onclick="CalendarManager.onDayClick('${dateStr}')">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${isToday ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700'}">
              ${day}
            </span>
            <button class="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 text-xs font-bold transition-opacity p-0.5"
                    title="Agendar taquiza este día"
                    onclick="event.stopPropagation(); App.newContractForDate('${dateStr}')">
              +
            </button>
          </div>

          <div class="space-y-1.5 overflow-y-auto max-h-[85px]">
            ${dayEvents.map(ev => {
              const status = ev.payments.status;
              let badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
              let dotColor = 'bg-amber-500';
              let statusText = 'Anticipo';

              if (status === 'paid') {
                badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                dotColor = 'bg-emerald-500';
                statusText = 'Liquidado';
              } else if (status === 'cancelled') {
                badgeColor = 'bg-slate-100 text-slate-600 border-slate-300 line-through';
                dotColor = 'bg-slate-400';
                statusText = 'Cancelado';
              } else if (ev.payments.remainingBalance === ev.payments.total) {
                badgeColor = 'bg-red-100 text-red-900 border-red-300';
                dotColor = 'bg-red-500';
                statusText = 'Sin anticipo';
              }

              return `
                <div class="text-[11px] p-1.5 rounded-lg border ${badgeColor} font-medium cursor-pointer shadow-xs hover:shadow-md transition-all flex flex-col gap-0.5"
                     onclick="event.stopPropagation(); CalendarManager.showEventModal('${ev.id}')">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold truncate flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full ${dotColor} inline-block"></span>
                      ${ev.client.name || 'Cliente sin nombre'}
                    </span>
                    <span class="text-[9px] font-black uppercase tracking-wider">${ev.folio ? '#' + ev.folio : ''}</span>
                  </div>
                  <div class="text-[10px] text-slate-600 flex justify-between">
                    <span>${ContractModel.formatTime12(ev.event.startTime) || 'Sin hora'}</span>
                    <span class="font-bold text-slate-800">${ContractModel.formatCurrency(ev.payments.total)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Next month filler days to complete 35 or 42 cells grid
    const totalCells = firstDayIndex + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      html += `
        <div class="bg-slate-50 min-h-[105px] p-1.5 opacity-40 text-slate-400">
          <div class="text-xs font-semibold">${i}</div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  /**
   * Render Agenda List View
   */
  renderAgendaView(container, monthEvents) {
    if (monthEvents.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-xl p-12 text-center border border-slate-200">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">No hay eventos programados en este mes</h3>
          <p class="text-sm text-slate-500 mb-4">Haz clic en el botón para registrar un nuevo contrato de taquiza.</p>
          <button onclick="App.newContract()" class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            + Nuevo Contrato de Taquiza
          </button>
        </div>
      `;
      return;
    }

    // Sort by event date ascending
    monthEvents.sort((a, b) => (a.event.date || '').localeCompare(b.event.date || ''));

    let html = `<div class="space-y-3">`;
    monthEvents.forEach(ev => {
      const isPaid = ev.payments.status === 'paid';
      html += `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
             onclick="CalendarManager.showEventModal('${ev.id}')">
          <div class="flex items-start gap-4">
            <div class="bg-red-600 text-white rounded-xl p-3 text-center min-w-[75px] shadow-xs">
              <div class="text-xs font-bold uppercase">${ev.event.dayOfWeek || 'DÍA'}</div>
              <div class="text-2xl font-black">${ev.event.date ? ev.event.date.split('-')[2] : '--'}</div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">FOLIO: ${ev.folio}</span>
                <h4 class="font-bold text-slate-900 text-base">${ev.client.name}</h4>
              </div>
              <p class="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <span>📍 ${ev.client.address || 'Sin dirección'}</span>
                <span>•</span>
                <span>⏰ ${ContractModel.formatTime12(ev.event.startTime)} - ${ContractModel.formatTime12(ev.event.endTime)}</span>
              </p>
              <p class="text-xs text-slate-500 mt-0.5">
                👨‍🍳 Personal: ${ev.event.assignedStaff || 'No asignado aún'}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
            <div class="text-right">
              <div class="text-xs text-slate-500">Total: <strong class="text-slate-900">${ContractModel.formatCurrency(ev.payments.total)}</strong></div>
              <div class="text-xs font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}">
                ${isPaid ? '✓ Liquidado' : `Saldo Pendiente: ${ContractModel.formatCurrency(ev.payments.remainingBalance)}`}
              </div>
            </div>

            <div class="flex gap-2">
              <button onclick="event.stopPropagation(); App.viewAndPrintContract('${ev.id}')" class="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Imprimir / PDF">
                🖨️
              </button>
              <button onclick="event.stopPropagation(); App.editContract('${ev.id}')" class="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                ✏️
              </button>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  },

  /**
   * Render right upcoming taquizas sidebar
   */
  renderUpcomingSidebar(contracts) {
    const sidebarEl = document.getElementById('upcoming-events-sidebar');
    if (!sidebarEl) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = contracts
      .filter(c => c.event && c.event.date && c.event.date >= todayStr && c.status !== 'cancelled')
      .sort((a, b) => a.event.date.localeCompare(b.event.date))
      .slice(0, 5);

    if (upcoming.length === 0) {
      sidebarEl.innerHTML = `
        <div class="p-4 text-center text-slate-400 text-xs">
          No hay taquizas próximas en agenda.
        </div>
      `;
      return;
    }

    let html = '';
    upcoming.forEach(ev => {
      const isPaid = ev.payments.status === 'paid';
      html += `
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-300 transition-colors cursor-pointer"
             onclick="CalendarManager.showEventModal('${ev.id}')">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs font-bold text-slate-800 truncate">${ev.client.name}</span>
            <span class="text-[10px] font-black bg-slate-800 text-white px-1.5 py-0.5 rounded">#${ev.folio}</span>
          </div>
          <div class="text-[11px] text-slate-600 flex items-center justify-between">
            <span>📅 ${ContractModel.formatDateHuman(ev.event.date)}</span>
            <span class="font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}">
              ${isPaid ? 'Liquidado' : 'Resta: ' + ContractModel.formatCurrency(ev.payments.remainingBalance)}
            </span>
          </div>
          <div class="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <span>⏰ ${ContractModel.formatTime12(ev.event.startTime)}</span>
            <span>•</span>
            <span class="truncate">📍 ${ev.client.address || 'Córdoba'}</span>
          </div>
        </div>
      `;
    });

    sidebarEl.innerHTML = html;
  },

  /**
   * Click on any calendar day
   * @param {string} dateStr YYYY-MM-DD
   */
  onDayClick(dateStr) {
    const contracts = StorageManager.getContracts();
    const dayEvents = contracts.filter(c => c.event && c.event.date === dateStr);

    if (dayEvents.length === 1) {
      this.showEventModal(dayEvents[0].id);
    } else if (dayEvents.length > 1) {
      this.showMultipleEventsModal(dateStr, dayEvents);
    } else {
      App.newContractForDate(dateStr);
    }
  },

  /**
   * Show modal with complete event details
   * @param {string} contractId 
   */
  showEventModal(contractId) {
    const contract = StorageManager.getContract(contractId);
    if (!contract) return;

    const isPaid = contract.payments.status === 'paid';
    const modalEl = document.getElementById('event-detail-modal');
    const contentEl = document.getElementById('event-detail-modal-content');

    if (!modalEl || !contentEl) return;

    contentEl.innerHTML = `
      <div class="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded">FOLIO: ${contract.folio}</span>
            <span class="text-xs font-bold px-2.5 py-1 rounded ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${isPaid ? '✓ Liquidado' : '⏳ Saldo Pendiente: ' + ContractModel.formatCurrency(contract.payments.remainingBalance)}
            </span>
          </div>
          <h3 class="text-xl font-black text-slate-900">${contract.client.name}</h3>
        </div>
        <button onclick="App.closeModal('event-detail-modal')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">✕</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
        <!-- Client Details -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <h4 class="font-bold text-xs uppercase text-slate-500 mb-2">Datos del Cliente</h4>
          <div class="space-y-1.5">
            <p><strong>📞 Teléfono:</strong> <a href="tel:${contract.client.phone}" class="text-blue-600 underline">${contract.client.phone || 'No registrado'}</a></p>
            <p><strong>📍 Dirección:</strong> ${contract.client.address || 'No especificada'}</p>
            <p><strong>🧭 Referencia:</strong> ${contract.client.reference || 'Ninguna'}</p>
          </div>
        </div>

        <!-- Logistics Details -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <h4 class="font-bold text-xs uppercase text-slate-500 mb-2">Logística del Evento</h4>
          <div class="space-y-1.5">
            <p><strong>📅 Fecha:</strong> ${contract.event.dayOfWeek} ${ContractModel.formatDateHuman(contract.event.date)}</p>
            <p><strong>⏰ Horario:</strong> Llegada: ${ContractModel.formatTime12(contract.event.arrivalTime)} | Servicio: ${ContractModel.formatTime12(contract.event.startTime)} - ${ContractModel.formatTime12(contract.event.endTime)}</p>
            <p><strong>👨‍🍳 Personal:</strong> ${contract.event.assignedStaff || 'Pendiente por asignar'}</p>
          </div>
        </div>
      </div>

      <!-- Financials Breakdown -->
      <div class="bg-amber-50/50 p-4 rounded-xl border border-amber-200 mb-6">
        <h4 class="font-bold text-xs uppercase text-amber-900 mb-3">Resumen de Pagos y Anticipos</h4>
        <div class="grid grid-cols-3 gap-3 text-center mb-3">
          <div class="bg-white p-2 rounded-lg border border-amber-200">
            <span class="text-[11px] text-slate-500 block">Total Contrato</span>
            <span class="text-base font-black text-slate-900">${ContractModel.formatCurrency(contract.payments.total)}</span>
          </div>
          <div class="bg-white p-2 rounded-lg border border-amber-200">
            <span class="text-[11px] text-slate-500 block">Total Anticipos</span>
            <span class="text-base font-black text-emerald-700">${ContractModel.formatCurrency(contract.payments.totalAnticipos)}</span>
          </div>
          <div class="bg-white p-2 rounded-lg border border-amber-200">
            <span class="text-[11px] text-slate-500 block">Saldo Restante</span>
            <span class="text-base font-black text-red-600">${ContractModel.formatCurrency(contract.payments.remainingBalance)}</span>
          </div>
        </div>

        <div class="text-xs">
          <h5 class="font-bold text-slate-700 mb-1">Historial de Anticipos:</h5>
          <div class="space-y-1">
            ${(contract.payments.anticipos || []).map(ant => `
              <div class="flex justify-between bg-white px-3 py-1.5 rounded border border-amber-100 text-slate-700">
                <span>${ContractModel.formatDateHuman(ant.date)} (${ant.type || 'Efectivo'}) ${ant.note ? '- ' + ant.note : ''}</span>
                <strong class="text-emerald-700">${ContractModel.formatCurrency(ant.amount)}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2 justify-end border-t pt-4">
        <button onclick="App.openQuickAnticipoModal('${contract.id}')" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors text-sm shadow-xs flex items-center gap-1.5">
          💵 Registrar Anticipo
        </button>
        <button onclick="App.sendWhatsAppMessage('${contract.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm shadow-xs flex items-center gap-1.5">
          📱 WhatsApp
        </button>
        <button onclick="App.viewAndPrintContract('${contract.id}')" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors text-sm shadow-xs flex items-center gap-1.5">
          🖨️ Ver / Imprimir
        </button>
        <button onclick="App.editContract('${contract.id}')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-xs flex items-center gap-1.5">
          ✏️ Editar
        </button>
      </div>
    `;

    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
  },

  /**
   * Show modal when multiple events are on the same day
   */
  showMultipleEventsModal(dateStr, events) {
    const modalEl = document.getElementById('event-detail-modal');
    const contentEl = document.getElementById('event-detail-modal-content');
    if (!modalEl || !contentEl) return;

    let html = `
      <div class="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h3 class="text-xl font-black text-slate-900">Eventos para el ${ContractModel.formatDateHuman(dateStr)}</h3>
          <p class="text-xs text-slate-500">Hay ${events.length} taquizas programadas para esta fecha.</p>
        </div>
        <button onclick="App.closeModal('event-detail-modal')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">✕</button>
      </div>

      <div class="space-y-3 mb-6">
        ${events.map(ev => `
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-red-400 transition-colors flex justify-between items-center cursor-pointer"
               onclick="CalendarManager.showEventModal('${ev.id}')">
            <div>
              <div class="flex items-center gap-2">
                <span class="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">#${ev.folio}</span>
                <strong class="text-slate-900">${ev.client.name}</strong>
              </div>
              <p class="text-xs text-slate-600 mt-1">⏰ ${ContractModel.formatTime12(ev.event.startTime)} - ${ContractModel.formatTime12(ev.event.endTime)} | 📍 ${ev.client.address}</p>
            </div>
            <div class="text-right">
              <span class="font-bold text-slate-900 block">${ContractModel.formatCurrency(ev.payments.total)}</span>
              <span class="text-xs ${ev.payments.status === 'paid' ? 'text-emerald-600 font-bold' : 'text-amber-600'}">
                ${ev.payments.status === 'paid' ? 'Liquidado' : 'Saldo: ' + ContractModel.formatCurrency(ev.payments.remainingBalance)}
              </span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="flex justify-end gap-2 border-t pt-3">
        <button onclick="App.newContractForDate('${dateStr}')" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm">
          + Agregar otra taquiza este día
        </button>
      </div>
    `;

    contentEl.innerHTML = html;
    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
  }
};

window.CalendarManager = CalendarManager;
