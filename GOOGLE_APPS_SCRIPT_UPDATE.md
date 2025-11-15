# 📝 Configuración de Google Apps Script para Actualizar Tickets

Esta guía te explica cómo configurar un Google Apps Script para actualizar automáticamente el estado de los tickets en Google Sheets.

## 🔧 Paso 1: Crear el Google Apps Script

1. **Abre tu Google Sheet** (el que contiene los tickets)
2. Ve a **Extensiones** → **Apps Script**
3. Se abrirá un editor de código
4. **Borra todo el contenido** y pega el siguiente código:

```javascript
/**
 * Función para actualizar el estado de tickets en Google Sheets
 * @param {Array<number>} ticketNumbers - Array de números de tickets a actualizar
 * @param {string} newStatus - Nuevo estado (por defecto "reservado")
 * @returns {Object} Resultado de la operación
 */
function updateTicketsStatus(ticketNumbers, newStatus = 'reservado') {
  try {
    // Obtener la hoja activa (o puedes especificar el nombre de la hoja)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Si tu hoja tiene un nombre específico, usa:
    // const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Hoja 1');
    
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
 * Función doPost para recibir peticiones HTTP POST desde la web
 * @param {Object} e - Evento de la petición HTTP
 * @returns {Object} Respuesta JSON
 */
function doPost(e) {
  try {
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    const ticketNumbers = data.ticketNumbers || [];
    const newStatus = data.status || 'reservado';
    
    // Validar que hay tickets
    if (!Array.isArray(ticketNumbers) || ticketNumbers.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No se proporcionaron números de tickets'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Actualizar los tickets
    const result = updateTicketsStatus(ticketNumbers, newStatus);
    
    // Devolver resultado
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función de prueba (opcional, para probar desde el editor)
 */
function testUpdate() {
  const testNumbers = [0, 1, 2]; // Prueba con tickets 000, 001, 002
  const result = updateTicketsStatus(testNumbers, 'reservado');
  console.log(result);
}
```

5. **Guarda el proyecto**:
   - Haz clic en el icono de **💾 Guardar** (o Ctrl+S)
   - Dale un nombre al proyecto, por ejemplo: "Actualizar Tickets"

## 🚀 Paso 2: Desplegar como Web App

1. En el editor de Apps Script, haz clic en **Desplegar** → **Nueva implementación**
2. Haz clic en el icono de **⚙️ Configuración** (al lado de "Tipo")
3. Selecciona **Aplicación web**
4. Configura:
   - **Descripción**: "API para actualizar tickets" (opcional)
   - **Ejecutar como**: "Yo" (tu cuenta)
   - **Quién tiene acceso**: **"Cualquiera"** (importante para que funcione desde la web)
5. Haz clic en **Desplegar**
6. **Autoriza el acceso**:
   - Te pedirá autorización, haz clic en **Autorizar acceso**
   - Selecciona tu cuenta de Google
   - Haz clic en **Avanzado** → **Ir a [nombre del proyecto] (no es seguro)**
   - Haz clic en **Permitir**
7. **Copia la URL de la Web App**:
   - Se mostrará una URL como: `https://script.google.com/macros/s/AKfycby.../exec`
   - **¡GUARDA ESTA URL!** La necesitarás para configurar en el código

## ⚙️ Paso 3: Configurar en el Código

**¡Ya está configurado!** La URL de tu script ya está en el código:

```javascript
updateScriptUrl: 'https://script.google.com/macros/s/AKfycbyZFnHjKHCl03l_VBQm-cyPSF2cx96m2fQYGjKLYM9yDCiQKlCGdG3t6dl5Qgg8TtGc9g/exec'
```

Si necesitas cambiarla en el futuro, busca esta línea en `js/main.js` (línea 33).

## ✅ Paso 4: Actualizar el Script (IMPORTANTE)

**IMPORTANTE:** El código del script ha sido actualizado para solucionar problemas de CORS. Debes actualizar tu script en Google Apps Script:

1. Abre tu Google Sheet → **Extensiones** → **Apps Script**
2. **Reemplaza TODO el código** con el contenido del archivo `google-apps-script-code.js`
3. **Guarda** el proyecto (Ctrl+S)
4. **Vuelve a desplegar**:
   - Haz clic en **Desplegar** → **Gestionar implementaciones**
   - Haz clic en el icono de **lápiz (✏️)** para editar
   - Haz clic en **Desplegar** (no necesitas cambiar nada, solo volver a desplegar)

## ✅ Paso 5: Probar

1. Abre tu página web (https://sortia.eu)
2. Selecciona algunos tickets y completa el formulario
3. Haz clic en "Enviar a WhatsApp"
4. Revisa la consola del navegador (F12) para ver los mensajes
5. Verifica en tu Google Sheet que los tickets se hayan actualizado a "reservado"

## 🔍 Solución de Problemas

### Error: "Script function not found"
- Verifica que el nombre de la función sea exactamente `doPost`
- Verifica que hayas guardado el script

### Error: "Access denied" o 403
- Verifica que en "Quién tiene acceso" hayas seleccionado **"Cualquiera"**
- Vuelve a desplegar el script

### Los tickets no se actualizan
- Abre la consola del navegador (F12) y revisa los errores
- Verifica que la URL del script sea correcta
- Verifica que el nombre de la hoja en el script coincida con tu Google Sheet

### Error CORS
- Google Apps Script maneja CORS automáticamente, pero si hay problemas, verifica que el script esté desplegado correctamente

## 📝 Notas Importantes

- El script solo actualiza tickets que estén en estado "disponible"
- Si un ticket ya está "ocupado" o "vendido", no se sobrescribirá
- El script valida que las filas existan antes de actualizar
- Puedes probar el script manualmente ejecutando la función `testUpdate()` desde el editor

