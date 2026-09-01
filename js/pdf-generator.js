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

        <!-- 8. FOOTER WITH SOCIAL MEDIA -->
        <table style="width:100%; border-collapse:collapse; margin-top:4px; border-top:1px solid #000000; padding-top:2px; font-family:Arial, Helvetica, sans-serif;">
          <tr>
            <td style="text-align:left; vertical-align:middle;">
              <div style="display:flex; align-items:center; gap:16px; font-family:Arial, Helvetica, sans-serif; font-size:10px; font-weight:bold; color:#000000;">
                <!-- Facebook -->
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <svg style="width:13px; height:13px; vertical-align:middle; display:inline-block;" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#000000"/><path d="M15.5 12h-2.5v8h-3v-8h-2v-2.5h2v-2c0-2.2 1.3-3.5 3.5-3.5h2v2.5h-1.5c-1 0-1 .5-1 1v2h2.5l-.5 2.5z" fill="#ffffff"/></svg>
                  Takirin La Chimenea
                </span>
                <!-- Instagram -->
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <svg style="width:13px; height:13px; vertical-align:middle; display:inline-block;" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#000000"/><rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#ffffff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.3" fill="none" stroke="#ffffff" stroke-width="1.8"/><circle cx="16" cy="8" r="0.9" fill="#ffffff"/></svg>
                  @takirinlachimenea
                </span>
                <!-- TikTok -->
                <span style="display:inline-flex; align-items:center; gap:4px;">
                  <svg style="width:13px; height:13px; vertical-align:middle; display:inline-block;" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#000000"/><path d="M16.6 8.2c-.9-.4-1.5-1.2-1.6-2.2h-2.2v10.5c0 1.2-1 2.2-2.2 2.2s-2.2-1-2.2-2.2 1-2.2 2.2-2.2c.3 0 .5.1.7.2v-2.3c-.2 0-.5-.1-.7-.1-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5v-5.6c1.1.8 2.4 1.2 3.8 1.2V9.5c-.8 0-1.6-.5-2.3-1.3z" fill="#ffffff"/></svg>
                  takirinlachimenea
                </span>
              </div>
            </td>
            <td style="text-align:right; font-family:Arial, Helvetica, sans-serif; font-size:10.5px; font-weight:bold; color:#000000; letter-spacing:0.5px;">
              ${settings.docCode || 'FOP-01'}
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
