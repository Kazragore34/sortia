# Configuración de Google Sheets para Tickets en Tiempo Real

Esta guía te explica cómo configurar tu Google Sheet para que la página web lea la cantidad de tickets disponibles en tiempo real.

## 📋 Requisitos Previos

1. Un Google Sheet con los datos de los tickets
2. El Sheet debe ser **público** (para el método CSV) o necesitas una API key (para el método API)

## 🔧 Paso 1: Hacer el Google Sheet Público

Para que la página pueda leer los datos, el Sheet debe ser público:

1. Abre tu Google Sheet
2. Haz clic en el botón **"Compartir"** (arriba a la derecha)
3. En la ventana de compartir, haz clic en **"Cambiar a cualquier persona con el enlace"**
4. Selecciona **"Lector"** en los permisos
5. Copia el enlace del Sheet

## 📊 Paso 2: Estructura Recomendada del Google Sheet

Tu Google Sheet debe tener una estructura similar a esta:

### Opción A: Con Columna de Estado (Recomendado)

| Número Ticket | Nombre | Teléfono | Estado |
|---------------|--------|----------|--------|
| 001           | Juan   | 123456   | vendido |
| 002           | María  | 789012   | disponible |
| 003           | Pedro  | 345678   | reservado |

**Columnas detectadas automáticamente:**
- `Estado`, `Status`, `estado`, `status`, `ESTADO`, `STATUS`, `Estado del Ticket`

**Valores reconocidos:**
- `vendido` o `reservado` = Ticket no disponible
- `disponible` = Ticket disponible

### Opción B: Sin Columna de Estado

Si no tienes una columna de estado, el sistema contará todas las filas con datos (excepto el header) como tickets vendidos.

| Número Ticket | Nombre | Teléfono |
|---------------|--------|----------|
| 001           | Juan   | 123456   |
| 002           | María  | 789012   |

En este caso, cada fila con datos cuenta como un ticket vendido.

## ⚙️ Paso 3: Configurar en el Código

El código ya está configurado con tu Google Sheet. Puedes verificar o modificar la configuración en `js/main.js`:

```javascript
const CONFIG = {
    // ... otras configuraciones
    googleSheets: {
        // ID del Sheet (ya configurado con tu Sheet)
        sheetId: '11AJDOkCz9hdMGI0LHaub41qWxwOSXBx_zXaeW-Fdp5s',
        // Nombre de la pestaña/hoja (por defecto 'Sheet1')
        sheetName: 'Sheet1',
        // Método de lectura
        method: 'csv', // 'csv', 'api', o 'appsscript'
    }
};
```

### Cambiar el Nombre de la Hoja

Si tu hoja tiene otro nombre (por ejemplo, "Tickets" o "Ventas"), cambia:

```javascript
sheetName: 'Tickets', // Cambia 'Sheet1' por el nombre de tu pestaña
```

## 🔄 Actualización Automática

El contador se actualiza automáticamente cada **30 segundos**. Esto significa que:

- ✅ Los visitantes verán los números actualizados sin recargar la página
- ✅ No hay necesidad de hacer nada manualmente
- ✅ El sistema usa caché para evitar demasiadas solicitudes

## 🧪 Probar la Configuración

1. Abre la consola del navegador (F12)
2. Recarga la página
3. Deberías ver mensajes como:
   - `📊 Tickets vendidos: X, Reservados: Y, Total: Z`
   - Si hay errores, aparecerán en rojo

## ❌ Solución de Problemas

### Error: "Failed to fetch" o CORS

**Problema:** El Sheet no es público o hay problemas de CORS.

**Solución:**
1. Verifica que el Sheet sea público (Paso 1)
2. Asegúrate de que el enlace de compartir permita "Cualquier persona con el enlace"

### Error: "No se encontró la columna de estado"

**Problema:** El Sheet no tiene una columna llamada "Estado" o similar.

**Solución:**
- Agrega una columna "Estado" con valores: `vendido`, `reservado`, o `disponible`
- O el sistema contará todas las filas con datos como tickets vendidos

### El contador muestra 0 o números incorrectos

**Problema:** La estructura del Sheet no coincide con lo esperado.

**Solución:**
1. Verifica que el nombre de la hoja sea correcto (`sheetName`)
2. Verifica que haya datos en el Sheet
3. Revisa la consola del navegador para ver mensajes de depuración

## 🔐 Métodos Alternativos (Avanzado)

### Método 2: Google Sheets API

Si prefieres usar la API oficial de Google Sheets:

1. Obtén una API key de Google Cloud Console
2. Habilita la API de Google Sheets
3. Configura en el código:

```javascript
googleSheets: {
    sheetId: 'TU_SHEET_ID',
    method: 'api',
    options: {
        apiKey: 'TU_API_KEY'
    }
}
```

### Método 3: Google Apps Script

Para mayor control y seguridad, puedes crear un Google Apps Script:

1. Ve a tu Google Sheet → Extensiones → Apps Script
2. Crea un script que devuelva los datos en JSON
3. Despliega como Web App
4. Configura en el código:

```javascript
googleSheets: {
    sheetId: 'TU_SHEET_ID',
    method: 'appsscript',
    options: {
        scriptUrl: 'URL_DEL_SCRIPT_DESPLEGADO'
    }
}
```

## 📝 Notas Importantes

- ⚠️ El método CSV requiere que el Sheet sea **público**
- ✅ El sistema usa caché de 30 segundos para mejorar el rendimiento
- 🔄 Las actualizaciones son automáticas cada 30 segundos
- 📊 El contador muestra: `Tickets Disponibles = Total (1000) - Tickets Vendidos/Reservados`

## 🆘 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12) para ver errores
2. Que el Sheet sea público
3. Que el nombre de la hoja sea correcto
4. Que haya datos en el Sheet

