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
 * @returns {Object} Resultado de la operación
 */
function updateTicketsStatus(ticketNumbers, newStatus = 'reservado') {
  try {
    // Obtener la hoja activa
    // Si tu hoja tiene un nombre específico, cambia 'Hoja 1' por el nombre real
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Hoja 1');
    
    // Si no existe, usar la hoja activa
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    // Columna D es la columna 4 (A=1, B=2, C=3, D=4)
    const statusColumn = 4;
    
    let updatedCount = 0;
    const errors = [];
    
    // Actualizar cada ticket
    ticketNumbers.forEach(ticketNumber => {
      try {
        // La fila es: número de ticket + 2 (porque fila 1 es header, fila 2 es ticket 000)
        const rowNumber = ticketNumber + 2;
        
        // Verificar que la fila existe
        if (rowNumber > sheet.getLastRow()) {
          errors.push(`Ticket #${String(ticketNumber).padStart(3, '0')}: Fila ${rowNumber} no existe`);
          return;
        }
        
        // Obtener el estado actual
        const currentStatus = sheet.getRange(rowNumber, statusColumn).getValue();
        
        // Solo actualizar si está disponible (evitar sobrescribir tickets ya vendidos)
        if (currentStatus.toString().toLowerCase().trim() === 'disponible') {
          sheet.getRange(rowNumber, statusColumn).setValue(newStatus);
          updatedCount++;
        } else {
          errors.push(`Ticket #${String(ticketNumber).padStart(3, '0')}: Ya está ${currentStatus}`);
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
    
    // Intentar parsear como JSON primero
    if (e.postData && e.postData.contents) {
      try {
        const data = JSON.parse(e.postData.contents);
        ticketNumbers = data.ticketNumbers || [];
        newStatus = data.status || 'reservado';
      } catch (jsonError) {
        // Si no es JSON, intentar leer como formulario HTML
        if (e.parameter && e.parameter.data) {
          try {
            const formData = JSON.parse(e.parameter.data);
            ticketNumbers = formData.ticketNumbers || [];
            newStatus = formData.status || 'reservado';
          } catch (formError) {
            // Si tampoco funciona, intentar leer parámetros directos
            if (e.parameter.ticketNumbers) {
              ticketNumbers = JSON.parse(e.parameter.ticketNumbers);
            }
            if (e.parameter.status) {
              newStatus = e.parameter.status;
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
    const result = updateTicketsStatus(ticketNumbers, newStatus);
    
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

