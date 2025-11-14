# 🔑 Cómo Obtener y Configurar la API Key de Google Sheets

## ⚠️ IMPORTANTE: API Key vs OAuth

Para leer Google Sheets desde el navegador, necesitas una **API Key**, NO OAuth (Client ID/Secret).

- **API Key**: Para leer datos públicos o privados con permisos específicos
- **OAuth (Client ID/Secret)**: Para autenticación de usuarios (no necesario aquí)

## 📋 Paso 1: Obtener la API Key

### 1.1. Ir a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Selecciona tu proyecto (o crea uno nuevo)

### 1.2. Habilitar la API de Google Sheets

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google Sheets API"**
3. Haz clic en **"Habilitar"**

### 1.3. Crear la API Key

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"Clave de API"**
3. Se creará una API Key automáticamente
4. **Copia la API Key** (algo como: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 1.4. Restringir la API Key (Recomendado para Seguridad)

1. Haz clic en la API Key que acabas de crear
2. En **"Restricciones de API"**, selecciona **"Restringir clave"**
3. En **"Seleccionar APIs"**, marca solo **"Google Sheets API"**
4. En **"Restricciones de aplicación"**, puedes:
   - **"Ninguna"** (para desarrollo)
   - **"Referencias HTTP"** (para producción, agrega tu dominio)
5. Haz clic en **"Guardar"**

## ⚙️ Paso 2: Configurar en el Código

Abre el archivo `js/main.js` y busca la sección `CONFIG`:

```javascript
googleSheets: {
    sheetId: '11AJDOkCz9hdMGI0LHaub41qWxwOSXBx_zXaeW-Fdp5s',
    sheetName: 'Sheet1',
    method: 'api', // Ya está configurado como 'api'
    options: {
        apiKey: 'TU_API_KEY_AQUI', // ← Pega aquí tu API Key
        range: 'D2:D1002' // Rango de la columna D
    }
}
```

**Reemplaza `'TU_API_KEY_AQUI'` con tu API Key real.**

## 📊 Paso 3: Estructura del Google Sheet

Tu Google Sheet debe tener:

- **Columna D**: Contiene el estado de cada ticket
- **Fila 1**: Puede ser el header (se ignorará si no hay header)
- **Filas 2-1002**: Estados de los tickets (000-999)

**Valores reconocidos en la columna D:**
- `disponible` = Ticket disponible
- `vendido` = Ticket vendido (no disponible)
- `reservado` = Ticket reservado (no disponible)

### Ejemplo de estructura:

| A | B | C | D |
|---|---|---|---|
| Número | Nombre | Teléfono | Estado |
| 000 | Juan | 123456 | disponible |
| 001 | María | 789012 | vendido |
| 002 | Pedro | 345678 | reservado |
| ... | ... | ... | ... |

## 🔒 Paso 4: Permisos del Google Sheet

Para que la API pueda leer el Sheet:

### Opción A: Sheet Público (Más Simple)

1. Abre tu Google Sheet
2. Haz clic en **"Compartir"** (arriba a la derecha)
3. Haz clic en **"Cambiar a cualquier persona con el enlace"**
4. Selecciona **"Lector"**
5. Guarda

### Opción B: Sheet Privado con Service Account (Avanzado)

Si prefieres mantener el Sheet privado, necesitas:
1. Crear una Service Account en Google Cloud Console
2. Compartir el Sheet con el email de la Service Account
3. Usar la Service Account para autenticación

**Para este caso, la Opción A (Sheet público) es más simple y suficiente.**

## ✅ Paso 5: Verificar que Funciona

1. Abre tu página web
2. Abre la consola del navegador (F12)
3. Deberías ver mensajes como:
   - `📊 Columna D detectada - Vendidos: X, Reservados: Y, Disponibles: Z`
   - Si hay errores, aparecerán en rojo

## ❌ Solución de Problemas

### Error: "API key not valid"

**Problema:** La API Key no es válida o no está habilitada.

**Solución:**
1. Verifica que copiaste la API Key correctamente
2. Verifica que la API de Google Sheets esté habilitada
3. Verifica que la API Key no tenga restricciones que bloqueen tu dominio

### Error: "The caller does not have permission"

**Problema:** El Sheet no es público o la API Key no tiene permisos.

**Solución:**
1. Haz el Sheet público (Paso 4, Opción A)
2. O configura una Service Account (Paso 4, Opción B)

### Error: "Unable to parse range"

**Problema:** El rango especificado no es válido.

**Solución:**
1. Verifica que el nombre de la hoja sea correcto (`sheetName`)
2. Verifica que el rango sea correcto (`D2:D1002`)
3. Verifica que haya datos en ese rango

### El contador muestra 0

**Problema:** No se están leyendo los datos correctamente.

**Solución:**
1. Abre la consola del navegador (F12) y revisa los errores
2. Verifica que la columna D tenga datos
3. Verifica que los valores sean: `disponible`, `vendido`, o `reservado`

## 🔐 Seguridad de la API Key

⚠️ **IMPORTANTE:** La API Key será visible en el código JavaScript del navegador.

**Para protegerla:**
1. **Restringe la API Key** a solo Google Sheets API
2. **Restringe por dominio** (en producción)
3. **Usa límites de cuota** en Google Cloud Console
4. **Monitorea el uso** de la API Key

## 📝 Notas Finales

- ✅ La API Key es pública (visible en el código), pero está restringida
- ✅ El Sheet puede ser público (solo lectura)
- ✅ El contador se actualiza cada 30 segundos automáticamente
- ✅ El sistema lee solo la columna D (rango D2:D1002)

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa la consola del navegador (F12) para ver errores
2. Verifica que la API Key sea correcta
3. Verifica que el Sheet sea público
4. Verifica que el rango D2:D1002 tenga datos

