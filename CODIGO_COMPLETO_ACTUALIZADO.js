/**
 * Google Apps Script para Actualizar Tickets en Google Sheets
 * 
 * COPIA TODO ESTE CÓDIGO Y PÉGALO EN GOOGLE APPS SCRIPT
 */

function updateTicketsStatus(ticketNumbers, newStatus = 'reservado', customerName = '', customerPhone = '', reservationDate = '') {
  try {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Hoja 1');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    const ticketNumberColumn = 1; // Columna A contiene los números de tickets (para buscar)
    const phoneColumn = 3; // Columna C contiene el teléfono
    const nameColumn = 2; // Columna B se actualizará con nombre completo
    const statusColumn = 4; // Columna D contiene el estado
    const dateColumn = 5; // Columna E contiene la fecha
    
    let updatedCount = 0;
    const errors = [];
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return {
        success: false,
        error: 'No hay datos en la hoja'
      };
    }
    
    const ticketNumbersRange = sheet.getRange(2, ticketNumberColumn, lastRow - 1, 1).getValues();
    
    const ticketToRowMap = new Map();
    for (let i = 0; i < ticketNumbersRange.length; i++) {
      const ticketNum = ticketNumbersRange[i][0];
      const ticketNumValue = Number(ticketNum);
      if (!isNaN(ticketNumValue) && ticketNumValue >= 0) {
        ticketToRowMap.set(ticketNumValue, i + 2);
      }
    }
    
    ticketNumbers.forEach(ticketNumber => {
      try {
        const rowNumber = ticketToRowMap.get(ticketNumber);
        
        if (!rowNumber) {
          errors.push(`Ticket #${String(ticketNumber).padStart(3, '0')}: No encontrado en la hoja`);
          return;
        }
        
        const currentStatus = sheet.getRange(rowNumber, statusColumn).getValue();
        const currentStatusStr = currentStatus.toString().toLowerCase().trim();
        
        if (currentStatusStr === 'disponible') {
          sheet.getRange(rowNumber, statusColumn).setValue(newStatus);
          
          if (customerName && customerName.trim() !== '') {
            sheet.getRange(rowNumber, nameColumn).setValue(customerName.trim());
          }
          
          if (customerPhone && customerPhone.trim() !== '') {
            sheet.getRange(rowNumber, phoneColumn).setValue(customerPhone.trim());
          }
          
          if (reservationDate && reservationDate.trim() !== '') {
            sheet.getRange(rowNumber, dateColumn).setValue(reservationDate.trim());
          } else {
            const today = new Date();
            const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
            sheet.getRange(rowNumber, dateColumn).setValue(dateStr);
          }
          
          updatedCount++;
        } else {
          errors.push(`Ticket #${String(ticketNumber).padStart(3, '0')}: Ya está ${currentStatus} (no se puede cambiar a ${newStatus})`);
        }
      } catch (error) {
        errors.push(`Ticket #${String(ticketNumber).padStart(3, '0')}: ${error.message}`);
      }
    });
    
    return {
      success: true,
      updated: updatedCount,
      total: ticketNumbers.length,
      errors: errors
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function doGet(e) {
  try {
    // Leer datos de tickets desde Google Sheets
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Hoja 1');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      const output = ContentService.createTextOutput(JSON.stringify({
        error: 'No hay datos en la hoja',
        fecha: new Date().toISOString()
      }));
      output.setMimeType(ContentService.MimeType.JSON);
      return output;
    }
    
    // Leer rango A2:D1001 (número, nombre, teléfono, estado)
    const ticketNumberColumn = 1; // Columna A
    const statusColumn = 4; // Columna D
    const totalTickets = 1000;
    
    const dataRange = sheet.getRange(2, ticketNumberColumn, lastRow - 1, 4).getValues();
    
    // Separar tickets disponibles y ocupados
    const disponibles = [];
    const ocupados = [];
    
    for (let i = 0; i < dataRange.length; i++) {
      const row = dataRange[i];
      const ticketNumberRaw = row[0]; // Columna A (número)
      const estado = (row[3] || '').toString().toLowerCase().trim(); // Columna D (estado)
      
      // Convertir número de ticket
      const ticketNumber = ticketNumberRaw !== null && ticketNumberRaw !== undefined && ticketNumberRaw !== '' 
        ? Number(ticketNumberRaw) 
        : i; // Si no hay número, usar el índice
      
      // Verificar que sea un número válido (0-999)
      if (!isNaN(ticketNumber) && ticketNumber >= 0 && ticketNumber <= 999) {
        if (estado === 'disponible') {
          disponibles.push(ticketNumber);
        } else {
          // Considerar ocupado: ocupado, ocupada, vendido, vendida, reservado, reservada, etc.
          ocupados.push(ticketNumber);
        }
      }
    }
    
    const totalOcupados = ocupados.length;
    const totalDisponibles = disponibles.length;
    const now = new Date();
    
    // Decidir qué lista incluir (optimización de tokens)
    // Si hay menos de 500 ocupados, listar ocupados
    // Si hay 500 o más ocupados, listar disponibles
    const incluirOcupados = totalOcupados < 500;
    
    // Formatear lista de números (ordenar y unir con comas)
    function formatNumberList(numbers) {
      const sorted = [...numbers].sort((a, b) => a - b);
      return sorted.join(',');
    }
    
    const jsonData = {
      fecha: now.toISOString(),
      fecha_formateada: Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'),
      tickets_disponibles: totalDisponibles,
      tickets_totales: totalTickets,
      tickets_ocupados: totalOcupados,
      timestamp: Math.floor(now.getTime() / 1000)
    };
    
    // Agregar lista según corresponda (solo números, sin texto adicional)
    if (incluirOcupados) {
      jsonData.numeros_ocupados = formatNumberList(ocupados);
      jsonData.lista_tipo = 'ocupados';
    } else {
      jsonData.numeros_disponibles = formatNumberList(disponibles);
      jsonData.lista_tipo = 'disponibles';
    }
    
    const output = ContentService.createTextOutput(JSON.stringify(jsonData));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    const output = ContentService.createTextOutput(JSON.stringify({
      error: error.message,
      fecha: new Date().toISOString()
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

function doPost(e) {
  try {
    let ticketNumbers = [];
    let newStatus = 'reservado';
    let customerName = '';
    let customerPhone = '';
    let reservationDate = '';
    
    if (e.postData && e.postData.contents) {
      try {
        const data = JSON.parse(e.postData.contents);
        ticketNumbers = data.ticketNumbers || [];
        newStatus = data.status || 'reservado';
        customerName = data.customerName || '';
        customerPhone = data.customerPhone || '';
        reservationDate = data.reservationDate || '';
      } catch (jsonError) {
        if (e.parameter && e.parameter.data) {
          try {
            const formData = JSON.parse(e.parameter.data);
            ticketNumbers = formData.ticketNumbers || [];
            newStatus = formData.status || 'reservado';
            customerName = formData.customerName || '';
            customerPhone = formData.customerPhone || '';
            reservationDate = formData.reservationDate || '';
          } catch (formError) {
            if (e.parameter.ticketNumbers) {
              ticketNumbers = JSON.parse(e.parameter.ticketNumbers);
            }
            if (e.parameter.status) {
              newStatus = e.parameter.status;
            }
            if (e.parameter.customerName) {
              customerName = e.parameter.customerName;
            }
            if (e.parameter.customerPhone) {
              customerPhone = e.parameter.customerPhone;
            }
            if (e.parameter.reservationDate) {
              reservationDate = e.parameter.reservationDate;
            }
          }
        }
      }
    } else if (e.parameter) {
      if (e.parameter.data) {
        try {
          const formData = JSON.parse(e.parameter.data);
          ticketNumbers = formData.ticketNumbers || [];
          newStatus = formData.status || 'reservado';
          customerName = formData.customerName || '';
          customerPhone = formData.customerPhone || '';
          reservationDate = formData.reservationDate || '';
        } catch (e) {
        }
      }
    }
    
    if (!Array.isArray(ticketNumbers) || ticketNumbers.length === 0) {
      const output = ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No se proporcionaron números de tickets'
      }));
      output.setMimeType(ContentService.MimeType.JSON);
      return output;
    }
    
    const result = updateTicketsStatus(ticketNumbers, newStatus, customerName, customerPhone, reservationDate);
    
    const output = ContentService.createTextOutput(JSON.stringify(result));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
      
  } catch (error) {
    const output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

