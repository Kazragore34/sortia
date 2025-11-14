# Solución Definitiva: n8n sin Nodo PostgreSQL

## 🎯 Problema

- n8n NO tiene nodo PostgreSQL que puedas conectar como herramienta al agente
- El Vector Store NO ejecuta SQL
- El agente necesita consultar la base de datos

---

## ✅ Solución: Pre-procesar Mensajes ANTES del Agente

**Idea**: Detectar si el mensaje necesita consulta SQL, ejecutarla ANTES de enviar al agente, y pasar los resultados junto con el mensaje.

---

## 🛠️ Implementación Paso a Paso

### Paso 1: Ejecutar Funciones SQL en Supabase

1. Ve a Supabase SQL Editor
2. Ejecuta `database/funciones_sql_supabase.sql`
3. Verifica que las funciones se crearon

---

### Paso 2: Agregar Nodo "Code" ANTES del Agente

**Agrega un nodo "Code" DESPUÉS de "Edit Fields5" y ANTES del "AI Agent"**:

**Nombre**: "SQL Query Processor"

```javascript
// Detectar si el mensaje necesita consulta SQL y ejecutarla
const items = $input.all();
const item = items[0];
const message = item.json.input || item.json.mensaje || '';

// Función para extraer números de tickets
function extractTicketNumbers(text) {
    const numbers = text.match(/\b\d{1,3}\b/g);
    return numbers ? numbers.map(n => parseInt(n)).filter(n => n >= 0 && n <= 999) : [];
}

// Detectar tipo de consulta
const lowerMessage = message.toLowerCase();
let sqlResult = null;
let needsSQL = false;

// 1. Consulta de ticket específico
if (lowerMessage.match(/\b(tienes|tiene|está|esta|disponible|libre|ocupado)\s+(el\s+)?\d+/)) {
    const numbers = extractTicketNumbers(message);
    if (numbers.length === 1) {
        needsSQL = true;
        sqlResult = {
            type: 'check_single',
            ticket: numbers[0],
            function: 'check_ticket_availability',
            params: { ticket_number: numbers[0] }
        };
    }
}

// 2. Consulta de varios tickets
if (!needsSQL && lowerMessage.match(/\b(quiero|dame|necesito|tickets?|números?)\s+.*\d+/)) {
    const numbers = extractTicketNumbers(message);
    if (numbers.length > 0) {
        needsSQL = true;
        sqlResult = {
            type: 'check_multiple',
            tickets: numbers,
            function: 'check_tickets_availability',
            params: { ticket_numbers: numbers }
        };
    }
}

// 3. Contar disponibles
if (!needsSQL && lowerMessage.match(/\b(cuantos|cuántos|quedan|disponibles?|hay)\b/)) {
    needsSQL = true;
    sqlResult = {
        type: 'count',
        function: 'count_available_tickets',
        params: {}
    };
}

// 4. Buscar al azar
if (!needsSQL && lowerMessage.match(/\b(al\s+azar|aleatorio|random|algunos)\b/)) {
    const countMatch = message.match(/\b(\d+)\b/);
    const count = countMatch ? parseInt(countMatch[1]) : 5;
    needsSQL = true;
    sqlResult = {
        type: 'random',
        count: count,
        function: 'get_random_tickets',
        params: { count_tickets: count }
    };
}

// Preparar output
const output = {
    ...item.json,
    input: message,
    needsSQL: needsSQL,
    sqlQuery: sqlResult
};

return [output];
```

---

### Paso 3: Agregar Nodo "HTTP Request" para Ejecutar SQL

**Agrega un nodo "HTTP Request" DESPUÉS del nodo "SQL Query Processor"**:

**Nombre**: "Execute SQL Query"

**Configuración**:
- **Method**: `POST`
- **URL**: `https://[TU-PROYECTO].supabase.co/rest/v1/rpc/{{ $json.sqlQuery.function }}`
  - Reemplaza `[TU-PROYECTO]` con tu URL de Supabase
- **Authentication**: `Generic Credential Type` → `Header Auth`
- **Headers**:
  - `apikey`: `[TU-API-KEY]`
  - `Authorization`: `Bearer [TU-ANON-KEY]`
  - `Content-Type`: `application/json`
- **Body**: JSON
```json
={{ $json.sqlQuery.params }}
```

**Condición**: Solo ejecutar si `needsSQL = true`

---

### Paso 4: Agregar Nodo "Switch" para Rutear

**Agrega un nodo "Switch" DESPUÉS del "HTTP Request"**:

**Reglas**:
- **Ruta 1** (si `needsSQL = true`): Conectar a nodo que procesa resultado SQL
- **Ruta 2** (si `needsSQL = false`): Conectar directamente al agente

---

### Paso 5: Procesar Resultado SQL y Enviar al Agente

**Agrega un nodo "Code" DESPUÉS del Switch (ruta 1)**:

**Nombre**: "Format SQL Result"

```javascript
const items = $input.all();
const item = items[0];

const sqlResult = item.json.sqlQuery;
const httpResponse = item.json; // Resultado del HTTP Request

// Formatear resultado para el agente
let formattedResult = '';

if (sqlResult.type === 'check_single') {
    if (httpResponse && httpResponse.length > 0) {
        const ticket = httpResponse[0];
        formattedResult = `Información del ticket ${ticket.id_tickets}: Estado = ${ticket.estado}`;
    } else {
        formattedResult = `El ticket ${sqlResult.ticket} no fue encontrado.`;
    }
} else if (sqlResult.type === 'check_multiple') {
    if (httpResponse && httpResponse.length > 0) {
        const tickets = httpResponse.map(t => `Ticket ${t.id_tickets}: ${t.estado}`).join(', ');
        formattedResult = `Resultados: ${tickets}`;
    } else {
        formattedResult = 'No se encontraron tickets.';
    }
} else if (sqlResult.type === 'count') {
    if (httpResponse && httpResponse.length > 0) {
        formattedResult = `Total de tickets disponibles: ${httpResponse[0].total_disponibles}`;
    }
} else if (sqlResult.type === 'random') {
    if (httpResponse && httpResponse.length > 0) {
        const numbers = httpResponse.map(t => t.id_tickets).join(', ');
        formattedResult = `Tickets disponibles al azar: ${numbers}`;
    }
}

// Agregar resultado al input del agente
return [{
    json: {
        ...item.json,
        input: `${item.json.input}\n\n[INFORMACIÓN DE BASE DE DATOS: ${formattedResult}]`,
        sqlResult: formattedResult
    }
}];
```

**Conectar este nodo al "AI Agent"**

---

### Paso 6: Conectar Ruta 2 Directamente al Agente

Si `needsSQL = false`, conectar directamente del Switch al "AI Agent".

---

## 📋 Flujo Completo

```
Edit Fields5
    ↓
SQL Query Processor (detecta si necesita SQL)
    ↓
Switch
    ├─→ [needsSQL = true] → HTTP Request (ejecuta SQL) → Format SQL Result → AI Agent
    └─→ [needsSQL = false] → AI Agent
```

---

## 🔧 Configuración de Credenciales

### Obtener Credenciales de Supabase

1. Ve a Supabase Dashboard
2. Settings → API
3. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Para Authorization header
   - **service_role key**: Para operaciones admin (opcional)

---

## ✅ Ventajas de Esta Solución

1. ✅ No necesitas nodo PostgreSQL en n8n
2. ✅ Funciona con HTTP Request (disponible en todas las versiones)
3. ✅ El agente recibe los datos SQL antes de responder
4. ✅ Puedes procesar y formatear los resultados
5. ✅ Fácil de mantener y depurar

---

## 🧪 Prueba

1. Ejecuta el workflow con: "Quiero los tickets 8, 7 y 50"
2. Verifica que:
   - El nodo "SQL Query Processor" detecta la consulta
   - El nodo "HTTP Request" ejecuta la función SQL
   - El nodo "Format SQL Result" formatea el resultado
   - El agente recibe la información y responde correctamente

---

## 📝 Notas Importantes

1. **Reemplaza `[TU-PROYECTO]`** con tu URL de Supabase
2. **Reemplaza `[TU-API-KEY]`** con tu anon key de Supabase
3. **Ajusta las expresiones** según la estructura de tu webhook
4. **Prueba cada nodo** individualmente antes de conectar todo

---

¿Quieres que te ayude a configurar cada nodo paso a paso?

