/**
 * Takirin La Chimenea - Exact FOP-01 Contract Renderer & PDF Generator
 * Tipografía Homogénea en Arial y Espacio Amplio para Firmas
 */

const PDFGenerator = {
  /**
   * Render 1:1 identical FOP-01 contract markup
   * @param {Object} contract 
   * @returns {string} HTML markup
   */
  renderContractHTML(contract) {
    const settings = (typeof StorageManager !== 'undefined' && StorageManager.getSettings) ? StorageManager.getSettings() : {};
    
    // Parse contract creation date
    const dateParts = ContractModel.parseDateParts(contract.contractDate || (contract.createdAt ? contract.createdAt.split('T')[0] : ''));
    
    // Format Anticipos rows (ensure exactly 3 rows minimum matching physical sheet)
    const anticipos = (contract.payments && contract.payments.anticipos) ? contract.payments.anticipos : [];
    let anticiposRowsHTML = '';
    const minRows = 3;

    for (let i = 0; i < Math.max(minRows, anticipos.length); i++) {
      const ant = anticipos[i];
      if (ant && ant.amount > 0) {
        anticiposRowsHTML += `
          <tr style="height:18px;">
            <td style="width:33%; text-align:center; font-size:10px; font-family:Arial, Helvetica, sans-serif; padding:2px 4px; border:1px solid #000;">${ContractModel.formatDateHuman(ant.date)}</td>
            <td style="width:33%; text-align:center; font-size:10px; font-family:Arial, Helvetica, sans-serif; padding:2px 4px; border:1px solid #000;">${ant.type || 'Efectivo'}</td>
            <td style="width:34%; text-align:right; font-weight:bold; font-size:10.5px; font-family:Arial, Helvetica, sans-serif; padding:2px 8px; border:1px solid #000;">${ContractModel.formatCurrency(ant.amount)}</td>
          </tr>
        `;
      } else {
        anticiposRowsHTML += `
          <tr style="height:18px;">
            <td style="width:33%; font-size:10px; font-family:Arial, Helvetica, sans-serif; padding:2px 4px; border:1px solid #000;">&nbsp;</td>
            <td style="width:33%; font-size:10px; font-family:Arial, Helvetica, sans-serif; padding:2px 4px; border:1px solid #000;">&nbsp;</td>
            <td style="width:34%; font-size:10.5px; font-family:Arial, Helvetica, sans-serif; padding:2px 8px; border:1px solid #000;">&nbsp;</td>
          </tr>
        `;
      }
    }

    // Complements list bullets
    const complementsText = (contract.event && contract.event.complementsText) ? contract.event.complementsText : ContractModel.DEFAULT_COMPLEMENTS_TEXT;
    const complementsList = complementsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `• ${line.replace(/^[•\-\*]\s*/, '')}`)
      .join('<br>');

    // Format numbers
    const eventAmount = contract.event ? contract.event.amount : 0;
    const additionalsAmount = contract.event ? contract.event.additionalsAmount : 0;
    const travelCost = contract.event ? contract.event.travelCost : 0;
    const subtotal = contract.payments ? contract.payments.subtotal : 0;
    const ivaRate = contract.payments ? contract.payments.ivaRate : 0;
    const ivaAmount = contract.payments ? contract.payments.ivaAmount : 0;
    const total = contract.payments ? contract.payments.total : 0;
    const remainingBalance = contract.payments ? contract.payments.remainingBalance : 0;

    return `
      <div class="contract-paper" id="printable-contract-sheet" style="box-sizing:border-box; width:100%; max-width:760px; margin:0 auto; background:#ffffff; color:#000000; font-family:Arial, Helvetica, sans-serif; padding:14px 22px; border:1px solid #cbd5e1;">
        
        <!-- 1. HEADER SECTION -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:5px; font-family:Arial, Helvetica, sans-serif;">
          <tr>
            <!-- Left Logo -->
            <td style="width:140px; vertical-align:middle; text-align:left; padding-right:8px;">
              <img src="assets/logo.png" alt="Takirin La Chimenea" style="max-width:130px; height:auto; max-height:80px; display:block;" onerror="this.src='assets/media_1788204842733.png'">
            </td>

            <!-- Center Company Info -->
            <td style="text-align:center; vertical-align:middle; padding:0 8px; font-family:Arial, Helvetica, sans-serif;">
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; letter-spacing:0.5px; margin:0 0 2px 0; color:#000;">${settings.businessName || 'TAKIRIN LA CHIMENEA'}</div>
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; margin:0 0 2px 0; color:#000;">${settings.address || 'CALLE 15 #221, COL. CENTRO, CP 94500, CÓRDOBA, VER.'}</div>
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; margin:0 0 4px 0; color:#000;">${settings.phone || '271 157 1770'}</div>
              <div style="font-family:Arial, Helvetica, sans-serif; background-color:${contract.payments && contract.payments.status === 'cancelled' ? '#64748b' : '#e60000'}; color:#ffffff; font-size:12px; font-weight:bold; padding:3px 8px; text-align:center; letter-spacing:1px;">
                ${contract.payments && contract.payments.status === 'cancelled' ? 'CONTRATO CANCELADO' : 'CONTRATO DE TAQUIZA'}
              </div>
            </td>

            <!-- Right: Folio & Date Boxes -->
            <td style="width:145px; vertical-align:middle; text-align:right; font-family:Arial, Helvetica, sans-serif;">
              <!-- Folio Box -->
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:4px; font-family:Arial, Helvetica, sans-serif;">
                <tr>
                  <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; text-align:center; padding:2px 0; letter-spacing:1px;">FOLIO</td>
                </tr>
                <tr>
                  <td style="background-color:#ffffff; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:bold; text-align:center; padding:3px 0; min-height:19px;">
                    ${contract.folio || '0001'}
                  </td>
                </tr>
              </table>

              <!-- Date Box -->
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; font-family:Arial, Helvetica, sans-serif;">
                <tr>
                  <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:9px; font-weight:bold; text-align:center; padding:2px 0; width:33%; border-right:1px solid #ffffff;">DIA</td>
                  <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:9px; font-weight:bold; text-align:center; padding:2px 0; width:33%; border-right:1px solid #ffffff;">MES</td>
                  <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:9px; font-weight:bold; text-align:center; padding:2px 0; width:34%;">AÑO</td>
                </tr>
                <tr>
                  <td style="text-align:center; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; padding:2px 0; border-right:1px solid #000000;">${dateParts.day || '&nbsp;'}</td>
                  <td style="text-align:center; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; padding:2px 0; border-right:1px solid #000000;">${dateParts.month || '&nbsp;'}</td>
                  <td style="text-align:center; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; padding:2px 0;">${dateParts.year || '&nbsp;'}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- 2. CLIENT INFORMATION BOX -->
        <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:5px; font-family:Arial, Helvetica, sans-serif;">
          <tr style="border-bottom:1px solid #000000; height:21px;">
            <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; padding:2px 8px; width:95px; letter-spacing:0.5px;">CLIENTE:</td>
            <td style="padding:2px 8px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${(contract.client && contract.client.name) || ''}</td>
          </tr>
          <tr style="border-bottom:1px solid #000000; height:21px;">
            <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; padding:2px 8px; width:95px; letter-spacing:0.5px;">DIRECCIÓN:</td>
            <td style="padding:2px 8px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${(contract.client && contract.client.address) || ''}</td>
          </tr>
          <tr style="border-bottom:1px solid #000000; height:21px;">
            <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; padding:2px 8px; width:95px; letter-spacing:0.5px;">REFERENCIA:</td>
            <td style="padding:2px 8px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${(contract.client && contract.client.reference) || ''}</td>
          </tr>
          <tr style="height:21px;">
            <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; padding:2px 8px; width:95px; letter-spacing:0.5px;">TELÉFONO:</td>
            <td style="padding:2px 8px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${(contract.client && contract.client.phone) || ''}</td>
          </tr>
        </table>

        <!-- 3. MAIN TABLE (TIPO DE EVENTOS, COMPLEMENTOS, IMPORTE) -->
        <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:5px; font-family:Arial, Helvetica, sans-serif;">
          <thead>
            <tr>
              <th style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; text-align:center; padding:3px 4px; width:35%; border:1px solid #000000; letter-spacing:0.5px;">TIPO DE EVENTOS</th>
              <th style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; text-align:center; padding:3px 4px; width:39%; border:1px solid #000000; letter-spacing:0.5px;">COMPLEMENTOS</th>
              <th style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; text-align:center; padding:3px 4px; width:26%; border:1px solid #000000; letter-spacing:0.5px;">IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            <!-- Row 1: Event description, complements bullets, and package amount -->
            <tr style="height:115px;">
              <td style="border:1px solid #000000; padding:5px 8px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; vertical-align:top; line-height:1.35;">
                ${((contract.event && contract.event.type) || '').replace(/\n/g, '<br>')}
              </td>
              <td style="border:1px solid #000000; padding:5px 8px; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-style:italic; color:#4b5563; text-align:center; vertical-align:top; line-height:1.35;">
                ${complementsList}
              </td>
              <td style="border:1px solid #000000; padding:5px 8px; text-align:right; font-family:Arial, Helvetica, sans-serif; font-size:11.5px; font-weight:bold; vertical-align:middle;">
                ${ContractModel.formatCurrency(eventAmount)}
              </td>
            </tr>

            <!-- Row 2: Adicionales Header -->
            <tr>
              <td colspan="3" style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; text-align:center; padding:2.5px 4px; border:1px solid #000000; letter-spacing:0.5px;">
                ADICIONALES
              </td>
            </tr>
            <!-- Row 2 Body: Adicionales content -->
            <tr style="height:38px;">
              <td colspan="2" style="border:1px solid #000000; padding:4px 8px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; vertical-align:top;">
                ${((contract.event && contract.event.additionals) || '').replace(/\n/g, '<br>')}
              </td>
              <td style="border:1px solid #000000; padding:4px 8px; text-align:right; font-family:Arial, Helvetica, sans-serif; font-size:11.5px; font-weight:bold; vertical-align:middle;">
                ${ContractModel.formatCurrency(additionalsAmount)}
              </td>
            </tr>

            <!-- Row 3: Costo de Traslado -->
            <tr>
              <td colspan="2" style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; text-align:center; padding:2.5px 4px; border:1px solid #000000; letter-spacing:0.5px;">
                COSTO DE TRASLADO (FUERA DE CÓRDOBA)
              </td>
              <td style="border:1px solid #000000; padding:2.5px 8px; text-align:right; font-family:Arial, Helvetica, sans-serif; font-size:11.5px; font-weight:bold; vertical-align:middle;">
                ${ContractModel.formatCurrency(travelCost)}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 4. SPLIT SECTION: LOGISTICS (LEFT) vs ANTICIPOS & TOTALS (RIGHT) -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:5px; font-family:Arial, Helvetica, sans-serif;">
          <tr>
            <!-- LEFT COLUMN: LOGISTICS -->
            <td style="width:49%; vertical-align:top; padding-right:6px;">
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; font-family:Arial, Helvetica, sans-serif;">
                <tr style="border-bottom:1px solid #000000; height:21px;">
                  <td style="background-color:#cfd8dc; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; width:52%; border-right:1px solid #000000;">FECHA DEL EVENTO:</td>
                  <td style="padding:2px 6px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${ContractModel.formatDateHuman((contract.event && contract.event.date) || '')}</td>
                </tr>
                <tr style="border-bottom:1px solid #000000; height:21px;">
                  <td style="background-color:#cfd8dc; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; width:52%; border-right:1px solid #000000;">DIA DEL EVENTO:</td>
                  <td style="padding:2px 6px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${((contract.event && contract.event.dayOfWeek) || '').toUpperCase()}</td>
                </tr>
                <tr style="border-bottom:1px solid #000000; height:21px;">
                  <td style="background-color:#cfd8dc; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; width:52%; border-right:1px solid #000000;">HORA DE LLEGADA:</td>
                  <td style="padding:2px 6px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${ContractModel.formatTime12((contract.event && contract.event.arrivalTime) || '')}</td>
                </tr>
                <tr style="border-bottom:1px solid #000000; height:21px;">
                  <td style="background-color:#cfd8dc; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; width:52%; border-right:1px solid #000000;">HORA DE INICIO:</td>
                  <td style="padding:2px 6px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${ContractModel.formatTime12((contract.event && contract.event.startTime) || '')}</td>
                </tr>
                <tr style="border-bottom:1px solid #000000; height:21px;">
                  <td style="background-color:#cfd8dc; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; width:52%; border-right:1px solid #000000;">TIEMPO DE SERVICIO:</td>
                  <td style="padding:2px 6px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${((contract.event && contract.event.serviceTime) || '2 HORAS').toUpperCase()}</td>
                </tr>
                <tr style="height:21px;">
                  <td style="background-color:#cfd8dc; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; width:52%; border-right:1px solid #000000;">HORA DE FIN EVENTO:</td>
                  <td style="padding:2px 6px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000;">${ContractModel.formatTime12((contract.event && contract.event.endTime) || '')}</td>
                </tr>
              </table>

              <!-- Extra Hour Red Banner -->
              <div style="background-color:#e60000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; text-align:center; padding:3px 4px; margin-top:4px; border:1px solid #000000; letter-spacing:0.5px;">
                HORA DE SERVICIO EXTRA $300
              </div>
            </td>

            <!-- RIGHT COLUMN: ANTICIPOS & TOTALS -->
            <td style="width:51%; vertical-align:top; padding-left:6px;">
              <!-- Anticipos Table -->
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:4px; font-family:Arial, Helvetica, sans-serif;">
                <tr>
                  <th colspan="3" style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; text-align:center; padding:2px 4px; border:1px solid #000000; letter-spacing:0.5px;">
                    ANTICIPOS
                  </th>
                </tr>
                <tr>
                  <th style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9px; font-weight:bold; text-align:center; padding:2px 4px; border:1px solid #000000; width:33%;">FECHA</th>
                  <th style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9px; font-weight:bold; text-align:center; padding:2px 4px; border:1px solid #000000; width:33%;">TIPO</th>
                  <th style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:9px; font-weight:bold; text-align:center; padding:2px 4px; border:1px solid #000000; width:34%;">MONTO</th>
                </tr>
                ${anticiposRowsHTML}
              </table>

              <!-- Totals Table -->
              <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; font-family:Arial, Helvetica, sans-serif;">
                <!-- SALDO RESTANTE ROW -->
                <tr style="height:20px;">
                  <td style="background-color:#f5a623; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; padding:2px 6px; border:1px solid #000000; width:50%;">
                    SALDO RESTANTE:
                  </td>
                  <td style="background-color:#ffffff; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; text-align:right; padding:2px 8px; border:1px solid #000000; width:50%;">
                    ${ContractModel.formatCurrency(remainingBalance)}
                  </td>
                </tr>
                <!-- SUBTOTAL ROW -->
                <tr style="height:19px;">
                  <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; border:1px solid #000000; width:50%;">
                    SUBTOTAL
                  </td>
                  <td style="background-color:#ffffff; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; text-align:right; padding:2px 8px; border:1px solid #000000; width:50%;">
                    ${ContractModel.formatCurrency(subtotal)}
                  </td>
                </tr>
                <!-- IVA ROW -->
                <tr style="height:19px;">
                  <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; border:1px solid #000000; width:50%;">
                    IVA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${ivaRate > 0 ? ivaRate + '%' : '%'}
                  </td>
                  <td style="background-color:#ffffff; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; text-align:right; padding:2px 8px; border:1px solid #000000; width:50%;">
                    ${ContractModel.formatCurrency(ivaAmount)}
                  </td>
                </tr>
                <!-- TOTAL ROW -->
                <tr style="height:19px;">
                  <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:9.5px; font-weight:bold; padding:2px 6px; border:1px solid #000000; width:50%;">
                    TOTAL
                  </td>
                  <td style="background-color:#ffffff; color:#000000; font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; text-align:right; padding:2px 8px; border:1px solid #000000; width:50%;">
                    ${ContractModel.formatCurrency(total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- 5. PENALTIES BOX (AGRANDADO LIGERAMENTE PARA MAYOR CLARIDAD) -->
        <div style="background-color:#e60000; color:#ffffff; border:1.5px solid #000000; padding:5px 8px; font-family:Arial, Helvetica, sans-serif; margin-bottom:6px; text-align:center;">
          <div style="font-weight:bold; font-size:10px; margin-bottom:2px; letter-spacing:0.3px;">En caso de <strong>cancelación</strong> del presente contrato, se aplicarán las siguientes penalizaciones:</div>
          <div style="font-size:9.5px; font-weight:bold; line-height:1.3;">• Cancelación con más de 15 días de anticipación: 5% del monto total. &nbsp;&nbsp;&nbsp;&nbsp; • Cancelación con 10 días o menos de anticipación: 10% del monto total.</div>
        </div>

        <!-- 6. SIGNATURE LINES (ESPACIO AMPLIO PARA FIRMAR Y LLENAR) -->
        <table style="width:100%; border-collapse:collapse; margin-top:26px; margin-bottom:12px; font-family:Arial, Helvetica, sans-serif;">
          <tr>
            <!-- Elaboró Column -->
            <td style="width:50%; text-align:center; vertical-align:bottom; padding:0 35px;">
              <div style="min-height:48px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:4px;">
                <span style="font-size:10.5px; font-weight:bold; color:#000000;">${contract.elaboratedBy || ''}</span>
              </div>
              <div style="border-top:1.5px solid #000000; margin-bottom:4px; width:100%;"></div>
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; color:#000000;">Elaboró</div>
            </td>

            <!-- Cliente Column -->
            <td style="width:50%; text-align:center; vertical-align:bottom; padding:0 35px;">
              <div style="min-height:48px; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; padding-bottom:4px;">
                <span style="font-size:10.5px; font-weight:bold; color:#000000;">${(contract.client && contract.client.name) || ''}</span>
              </div>
              <div style="border-top:1.5px solid #000000; margin-bottom:4px; width:100%;"></div>
              <div style="font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; color:#000000;">Cliente</div>
            </td>
          </tr>
        </table>

        <!-- 7. PERSONAL ASIGNADO -->
        <table style="width:100%; border-collapse:collapse; border:1.5px solid #000000; margin-bottom:5px; height:24px; font-family:Arial, Helvetica, sans-serif;">
          <tr>
            <td style="background-color:#000000; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; padding:2px 8px; width:135px; letter-spacing:0.5px;">
              PERSONAL ASIGNADO:
            </td>
            <td style="padding:2px 8px; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000000;">
              ${(contract.event && contract.event.assignedStaff) || ''}
            </td>
          </tr>
        </table>

        <!-- 8. FOOTER WITH SOCIAL MEDIA & CREDITS -->
        <table style="width:100%; border-collapse:collapse; margin-top:3px; border-top:1px solid #cbd5e1; padding-top:2px; font-family:Arial, Helvetica, sans-serif;">
          <tr>
            <td style="text-align:left; vertical-align:middle;">
              <div style="display:flex; align-items:center; gap:16px; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; color:#000000;">
                <span style="display:inline-flex; align-items:center; gap:3px;">
                  <svg style="width:13px; height:13px; fill:#000;" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z"/></svg>
                  Takirin La Chimenea
                </span>
                <span style="display:inline-flex; align-items:center; gap:3px;">
                  <svg style="width:13px; height:13px; fill:#000;" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  @takirinlachimenea
                </span>
                <span style="display:inline-flex; align-items:center; gap:3px;">
                  <svg style="width:13px; height:13px; fill:#000;" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.11V9.32a6.34 6.34 0 0 0-.85-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.18 8.18 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.05-.14z"/></svg>
                  takirinlachimenea
                </span>
              </div>
            </td>
            <td style="text-align:right; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000000; letter-spacing:0.5px;">
              ${settings.docCode || 'FOP-01'}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align:center; font-family:Arial, Helvetica, sans-serif; font-size:8px; font-weight:bold; color:#64748b; padding-top:3px; letter-spacing:0.4px;">
              Diseñado por Lira Soluciones
            </td>
          </tr>
        </table>

      </div>
    `;
  },

  printContract(contract) {
    let printMount = document.getElementById('print-mount-area');
    if (!printMount) {
      printMount = document.createElement('div');
      printMount.id = 'print-mount-area';
      document.body.appendChild(printMount);
    }
    printMount.innerHTML = this.renderContractHTML(contract);
    printMount.classList.remove('hidden');

    setTimeout(() => {
      window.print();
    }, 250);
  },

  async downloadPDF(contract) {
    let printMount = document.getElementById('print-mount-area');
    if (!printMount) {
      printMount = document.createElement('div');
      printMount.id = 'print-mount-area';
      document.body.appendChild(printMount);
    }
    printMount.innerHTML = this.renderContractHTML(contract);
    printMount.classList.remove('hidden');

    const sheet = document.getElementById('printable-contract-sheet');
    const clientNameClean = (contract.client && contract.client.name ? contract.client.name : 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');

    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: [4, 6, 4, 6],
        filename: `Contrato_Taquiza_${contract.folio || '0000'}_${clientNameClean}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
      };

      try {
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Generando PDF tamaño Carta en Arial...', 'info');
        }
        await html2pdf().set(opt).from(sheet).save();
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('¡PDF descargado con éxito!', 'success');
        }
      } catch (err) {
        console.error('html2pdf error:', err);
        window.print();
      }
    } else {
      window.print();
    }
  }
};

window.PDFGenerator = PDFGenerator;
