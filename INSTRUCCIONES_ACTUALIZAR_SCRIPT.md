# 🔧 Instrucciones para Actualizar el Script de Google Apps Script

## ⚠️ PROBLEMA: Error 403

Si ves el error 403, significa que el script necesita ser actualizado o re-autorizado.

## 📋 PASOS DETALLADOS:

### Paso 1: Abrir el Editor de Apps Script
1. Abre tu Google Sheet
2. Ve a **Extensiones** → **Apps Script**
3. Se abrirá el editor de código

### Paso 2: Eliminar TODO el Código Anterior
1. En el editor, selecciona **TODO** el código (Ctrl+A o Cmd+A)
2. **BORRA** todo el código (Delete o Backspace)
3. Asegúrate de que el editor esté completamente vacío

### Paso 3: Copiar el Código Nuevo
1. Abre el archivo `CODIGO_COMPLETO_ACTUALIZADO.js` en tu editor
2. Selecciona **TODO** el código (Ctrl+A)
3. **COPIA** el código (Ctrl+C)
4. Vuelve al editor de Google Apps Script
5. **PEGA** el código (Ctrl+V)

### Paso 4: Guardar el Proyecto
1. Haz clic en el icono de **💾 Guardar** (o presiona Ctrl+S)
2. Espera a que guarde (verás "Guardado" en la parte superior)

### Paso 5: Re-Autorizar el Script (IMPORTANTE)
1. En el editor, haz clic en **Ejecutar** (▶️) en la barra superior
2. Selecciona la función `doGet` del menú desplegable
3. Haz clic en **Ejecutar**
4. Te pedirá autorización:
   - Haz clic en **Revisar permisos**
   - Selecciona tu cuenta de Google
   - Haz clic en **Avanzado**
   - Haz clic en **Ir a [nombre del proyecto] (no es seguro)**
   - Haz clic en **Permitir**

### Paso 6: Desplegar como Web App
1. Haz clic en **Desplegar** → **Gestionar implementaciones**
2. Haz clic en el icono de **✏️ Editar** (lápiz) de la implementación activa
3. **VERIFICA** que:
   - **Ejecutar como:** "Yo (tu-email@gmail.com)"
   - **Quién tiene acceso:** **"Cualquier usuario"** ⚠️ ESTO ES CRÍTICO
4. Haz clic en **Implementar**
5. Si te pide confirmar, haz clic en **Implementar** de nuevo

### Paso 7: Verificar que Funciona
1. Copia la URL de la implementación (debería ser algo como):
   `https://script.google.com/macros/s/AKfycbyZFnHjKHCl03l_VBQm-cyPSF2cx96m2fQYGjKLYM9yDCiQKlCGdG3t6dl5Qgg8TtGc9g/exec`
2. Ábrela en una nueva pestaña del navegador
3. Deberías ver un JSON con:
   ```json
   {
     "success": true,
     "message": "Google Apps Script está funcionando correctamente",
     "version": "2.0",
     "availableFunctions": ["doPost - Actualizar tickets"]
   }
   ```
4. Si ves esto, ¡el script está funcionando! ✅

### Paso 8: Probar en la Web
1. Abre tu página web (sortia.eu)
2. Selecciona algunos tickets (por ejemplo, 4 y 5)
3. Completa el formulario
4. Haz clic en "Enviar a WhatsApp"
5. Verifica en tu Google Sheet que los tickets se hayan actualizado

## 🔍 Solución de Problemas

### Si sigues viendo el error 403:
1. **Verifica que copiaste TODO el código** - Debe incluir las funciones `doGet`, `doPost` y `updateTicketsStatus`
2. **Verifica los permisos** - "Quién tiene acceso" DEBE ser "Cualquier usuario"
3. **Re-autoriza el script** - Sigue el Paso 5 nuevamente
4. **Crea una nueva implementación**:
   - Desplegar → Nueva implementación
   - Tipo: Aplicación web
   - Ejecutar como: Yo
   - Quién tiene acceso: Cualquier usuario
   - Implementar

### Si el código no se guarda:
- Asegúrate de estar conectado a Internet
- Intenta refrescar la página del editor
- Guarda de nuevo

### Si no puedes autorizar:
- Asegúrate de estar usando la cuenta correcta de Google
- Cierra y vuelve a abrir el editor
- Intenta en modo incógnito

## ✅ Checklist Final

Antes de probar, verifica:
- [ ] El código está completamente pegado en el editor
- [ ] El proyecto está guardado
- [ ] El script está autorizado (Paso 5)
- [ ] La implementación tiene "Cualquier usuario" en acceso
- [ ] La URL del script funciona (Paso 7)
- [ ] Los tickets 4 y 5 están en estado "disponible" en Google Sheets

