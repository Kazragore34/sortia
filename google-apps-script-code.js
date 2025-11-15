/**
 * Google Apps Script para Actualizar Tickets en Google Sheets
 * 
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet
 * 2. Ve a Extensiones → Apps Script
 * 3. Pega este código completo
 * 4. Guarda el proyecto
 * 5. Despliega como Web App (ver GOOGLE_APPS_SCRIPT_UPDATE.md)
 */

/**
 * Función para actualizar el estado de tickets en Google Sheets
 * @param {Array<number>} ticketNumbers - Array de números de tickets a actualizar
 * @param {string} newStatus - Nuevo estado (por defecto "reservado")
 * @param {string} customerName - Nombre completo del cliente (nombre + apellido)
 * @param {string} customerPhone - Teléfono del cliente
 * @param {string} reservationDate - Fecha de la reserva
 * @returns {Object} Resultado de la operación
 */
function updateTicketsStatus(ticketNumbers, newStatus = 'reservado', customerName = '', customerPhone = '', reservationDate = '') {
  try {
    // Obtener la hoja activa
    // Si tu hoja tiene un nombre específico, cambia 'Hoja 1' por el nombre real
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Hoja 1');
    
    // Si no existe, usar la hoja activa
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    // Columnas: A=1 (numero - contiene el número de ticket), B=2 (nombre - se actualizará con nombre completo), C=3 (telefono), D=4 (estado), E=5 (fecha)
    const ticketNumberColumn = 1; // Columna A contiene los números de tickets (para buscar)
    const phoneColumn = 3; // Columna C contiene el teléfono
    const nameColumn = 2; // Columna B se actualizará con nombre completo
    const statusColumn = 4; // Columna D contiene el estado
    const dateColumn = 5; // Columna E contiene la fecha
    
    let updatedCount = 0;
    const errors = [];
    
    // Obtener todos los datos de una vez para mejor rendimiento
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return {
        success: false,
        error: 'No hay datos en la hoja'
      };
    }
    
    // Leer todos los números de tickets y estados
    const ticketNumbersRange = sheet.getRange(2, ticketNumberColumn, lastRow - 1, 1).getValues();
    const statusRange = sheet.getRange(2, statusColumn, lastRow - 1, 1).getValues();
    
    // Crear un mapa de número de ticket -> fila
    const ticketToRowMap = new Map();
    for (let i = 0; i < ticketNumbersRange.length; i++) {
      const ticketNum = ticketNumbersRange[i][0];
      // Convertir a número si es posible
      const ticketNumValue = Number(ticketNum);
      if (!isNaN(ticketNumValue) && ticketNumValue >= 0) {
        ticketToRowMap.set(ticketNumValue, i + 2); // +2 porque empezamos desde la fila 2
      }
    }
    
    // Actualizar cada ticket
    ticketNumbers.forEach(ticketNumber => {
      try {
        // Buscar la fila que contiene este número de ticket
        const rowNumber = ticketToRowMap.get(ticketNumber);
        
        if (!rowNumber) {
          errors.push(`Ticket #${String(ticketNumber).padStart(3, '0')}: No encontrado en la hoja`);
          return;
        }
        
        // Obtener el estado actual
        const currentStatus = sheet.getRange(rowNumber, statusColumn).getValue();
        const currentStatusStr = currentStatus.toString().toLowerCase().trim();
        
        // Solo actualizar si está disponible (evitar sobrescribir tickets ya vendidos/reservados)
        if (currentStatusStr === 'disponible') {
          // Actualizar estado
          sheet.getRange(rowNumber, statusColumn).setValue(newStatus);
          
          // Actualizar nombre completo (columna B)
          if (customerName && customerName.trim() !== '') {
            sheet.getRange(rowNumber, nameColumn).setValue(customerName.trim());
          }
          
          // Actualizar teléfono (columna A)
          if (customerPhone && customerPhone.trim() !== '') {
            sheet.getRange(rowNumber, phoneColumn).setValue(customerPhone.trim());
          }
          
          // Actualizar fecha (columna E)
          if (reservationDate && reservationDate.trim() !== '') {
            sheet.getRange(rowNumber, dateColumn).setValue(reservationDate.trim());
          } else {
            // Si no se proporciona fecha, usar la fecha actual
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

/**
 * Función doGet para verificar que el script está funcionando
 * Se ejecuta cuando accedes a la URL directamente en el navegador
 * @param {Object} e - Evento de la petición HTTP
 * @returns {Object} Respuesta JSON con headers CORS
 */
function doGet(e) {
  const output = ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Google Apps Script está funcionando correctamente',
    version: '1.0',
    availableFunctions: ['doPost - Actualizar tickets']
  }));
  
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Función doPost para recibir peticiones HTTP POST desde la web
 * Soporta tanto JSON como formularios HTML
 * @param {Object} e - Evento de la petición HTTP
 * @returns {Object} Respuesta JSON con headers CORS
 */
function doPost(e) {
  try {
    let ticketNumbers = [];
    let newStatus = 'reservado';
    let customerName = '';
    let customerPhone = '';
    let reservationDate = '';
    
    // Intentar parsear como JSON primero
    if (e.postData && e.postData.contents) {
      try {
        const data = JSON.parse(e.postData.contents);
        ticketNumbers = data.ticketNumbers || [];
        newStatus = data.status || 'reservado';
        customerName = data.customerName || '';
        customerPhone = data.customerPhone || '';
        reservationDate = data.reservationDate || '';
      } catch (jsonError) {
        // Si no es JSON, intentar leer como formulario HTML
        if (e.parameter && e.parameter.data) {
          try {
            const formData = JSON.parse(e.parameter.data);
            ticketNumbers = formData.ticketNumbers || [];
            newStatus = formData.status || 'reservado';
            customerName = formData.customerName || '';
            customerPhone = formData.customerPhone || '';
            reservationDate = formData.reservationDate || '';
          } catch (formError) {
            // Si tampoco funciona, intentar leer parámetros directos
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
      // Leer desde parámetros del formulario
      if (e.parameter.data) {
        try {
          const formData = JSON.parse(e.parameter.data);
          ticketNumbers = formData.ticketNumbers || [];
          newStatus = formData.status || 'reservado';
          customerName = formData.customerName || '';
          customerPhone = formData.customerPhone || '';
          reservationDate = formData.reservationDate || '';
        } catch (e) {
          // Ignorar error
        }
      }
    }
    
    // Validar que hay tickets
    if (!Array.isArray(ticketNumbers) || ticketNumbers.length === 0) {
      const output = ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No se proporcionaron números de tickets'
      }));
      output.setMimeType(ContentService.MimeType.JSON);
      return output;
    }
    
    // Actualizar los tickets
    const result = updateTicketsStatus(ticketNumbers, newStatus, customerName, customerPhone, reservationDate);
    
    // Devolver resultado
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

/**
 * Función de prueba (opcional, para probar desde el editor)
 * Ejecuta esta función desde el editor para probar que funciona
 */
function testUpdate() {
  const testNumbers = [0, 1, 2]; // Prueba con tickets 000, 001, 002
  const result = updateTicketsStatus(testNumbers, 'reservado');
  console.log(result);
}

