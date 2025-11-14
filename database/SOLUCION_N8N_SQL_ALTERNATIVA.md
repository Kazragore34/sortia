# Solución: n8n sin Nodo PostgreSQL Directo

## 🔴 Problema

Tu agente IA en n8n NO puede ejecutar consultas SQL directamente porque:
- No tienes nodo PostgreSQL nativo en n8n
- El Vector Store NO ejecuta SQL (solo búsqueda semántica)
- El agente necesita una herramienta (tool) para consultar la base de datos

---

## ✅ Solución: HTTP Request a Supabase REST API

Como n8n NO tiene nodo PostgreSQL directo, usaremos **HTTP Request** para llamar a la API REST de Supabase.

### Opción 1: Usar Funciones SQL en Supabase (RECOMENDADO)

**Ventaja**: Más seguro, más rápido, más fácil de mantener.

**Cómo funciona**:
1. Crear funciones SQL en Supabase (ya las tienes en `funciones_sql_supabase.sql`)
2. Crear un nodo "Code" en n8n que prepare las llamadas HTTP
3. Conectar ese nodo como herramienta al agente
4. El agente puede "llamar" a estas funciones

---

## 🛠️ Implementación Paso a Paso

### Paso 1: Ejecutar Funciones SQL en Supabase

1. Ve a Supabase SQL Editor
2. Ejecuta el archivo `database/funciones_sql_supabase.sql`
3. Verifica que las funciones se crearon:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'check%' OR routine_name LIKE 'get%';
```

---

### Paso 2: Crear Nodo "Code" en n8n (Herramienta SQL)

**Agrega un nodo "Code" ANTES del "AI Agent"**:

```javascript
// Este nodo crea funciones SQL que el agente puede usar
const items = $input.all();

// Obtener el mensaje del agente
const agentMessage = items[0]?.json?.input || items[0]?.json?.text || '';

// Función para extraer números de tickets del mensaje
function extractTicketNumbers(text) {
    const numbers = text.match(/\b\d{1,3}\b/g);
    return numbers ? numbers.map(n => parseInt(n)).filter(n => n >= 0 && n <= 999) : [];
}

// Función para detectar qué tipo de consulta necesita
function detectQueryType(text) {
    const lowerText = text.toLowerCase();
    
    // Verificar disponibilidad de un ticket específico
    if (lowerText.match(/\b(tienes|tiene|está|esta|disponible|libre)\s+(el\s+)?\d+/)) {
        const numbers = extractTicketNumbers(text);
        if (numbers.length === 1) {
            return {
                type: 'check_single',
                ticket: numbers[0],
                function: 'check_ticket_availability',
                params: [numbers[0]]
            };
        }
    }
    
    // Verificar varios tickets
    if (lowerText.match(/\b(quiero|dame|necesito|tickets?|números?)\s+.*\d+/)) {
        const numbers = extractTicketNumbers(text);
        if (numbers.length > 0) {
            return {
                type: 'check_multiple',
                tickets: numbers,
                function: 'check_tickets_availability',
                params: [numbers]
            };
        }
    }
    
    // Contar disponibles
    if (lowerText.match(/\b(cuantos|cuántos|quedan|disponibles?|hay)\b/)) {
        return {
            type: 'count',
            function: 'count_available_tickets',
            params: []
        };
    }
    
    // Buscar al azar
    if (lowerText.match(/\b(al\s+azar|aleatorio|random|algunos)\b/)) {
        const countMatch = text.match(/\b(\d+)\b/);
        const count = countMatch ? parseInt(countMatch[1]) : 5;
        return {
            type: 'random',
            count: count,
            function: 'get_random_tickets',
            params: [count]
        };
    }
    
    return null;
}

// Detectar qué consulta necesita
const queryInfo = detectQueryType(agentMessage);

if (queryInfo) {
    return [{
        json: {
            action: 'execute_sql',
            function: queryInfo.function,
            params: queryInfo.params,
            queryType: queryInfo.type,
            originalMessage: agentMessage
        }
    }];
} else {
    // Si no detecta consulta SQL, pasar el mensaje tal cual
    return items;
}
```

**Nombre del nodo**: "SQL Query Detector" o "Detector SQL"

---

### Paso 3: Crear Nodo HTTP Request para Llamar a Supabase

**Agrega un nodo "HTTP Request" DESPUÉS del nodo Code**:

**Configuración**:
- **Method**: `POST`
- **URL**: `https://[TU-PROYECTO].supabase.co/rest/v1/rpc/{{ $json.function }}`
  - Reemplaza `[TU-PROYECTO]` con tu URL de Supabase
- **Authentication**: `Generic Credential Type` → `Header Auth`
- **Headers**:
  - `apikey`: Tu API key de Supabase
  - `Authorization`: `Bearer [TU-ANON-KEY]`
  - `Content-Type`: `application/json`
- **Body**: JSON
```json
{
  "ticket_number": "={{ $json.params[0] }}",
  "ticket_numbers": "={{ $json.params }}",
  "count_tickets": "={{ $json.params[0] }}"
}
```

**Nombre del nodo**: "Supabase SQL Executor"

---

### Paso 4: Conectar como Herramienta al Agente

**Problema**: n8n no permite conectar nodos "Code" o "HTTP Request" directamente como herramientas al agente.

**Solución Alternativa**: Usar un nodo "Function" o crear un workflow separado.

---

## 🎯 Solución Alternativa: Workflow Separado + Webhook

### Opción A: Workflow Separado para SQL

1. **Crear un workflow separado** llamado "SQL Queries"
2. **Agregar un Webhook** que reciba las consultas
3. **Procesar la consulta** y devolver resultados
4. **Llamar desde el agente** usando HTTP Request

---

### Opción B: Usar Supabase REST API Directamente en el Prompt

**Modificar el prompt del agente** para que "sepa" cómo llamar a Supabase:

Agregar al prompt:
```
Tienes acceso a la base de datos Supabase a través de estas funciones:

1. Para verificar un ticket: Llamar a https://[proyecto].supabase.co/rest/v1/rpc/check_ticket_availability con {"ticket_number": 50}

2. Para verificar varios tickets: Llamar a https://[proyecto].supabase.co/rest/v1/rpc/check_tickets_availability con {"ticket_numbers": [8, 7, 50]}

3. Para contar disponibles: Llamar a https://[proyecto].supabase.co/rest/v1/rpc/count_available_tickets

Cuando necesites consultar la base de datos, debes indicar que necesitas hacer una consulta SQL y el sistema la ejecutará.
```

**PERO**: El agente no puede hacer HTTP requests directamente sin una herramienta.

---

## ✅ Solución Final: Nodo "Function" como Herramienta

### Crear Nodo Function que el Agente Pueda Usar

**Agrega un nodo "Function"** (si está disponible en tu versión de n8n):

```javascript
// Función que el agente puede llamar
async function executeSQLQuery(queryType, params) {
    const supabaseUrl = 'https://[TU-PROYECTO].supabase.co/rest/v1/rpc/';
    const apiKey = '[TU-API-KEY]';
    
    let functionName = '';
    let body = {};
    
    switch(queryType) {
        case 'check_single':
            functionName = 'check_ticket_availability';
            body = { ticket_number: params[0] };
            break;
        case 'check_multiple':
            functionName = 'check_tickets_availability';
            body = { ticket_numbers: params };
            break;
        case 'count':
            functionName = 'count_available_tickets';
            body = {};
            break;
        case 'random':
            functionName = 'get_random_tickets';
            body = { count_tickets: params[0] };
            break;
    }
    
    // Hacer la llamada HTTP
    const response = await fetch(supabaseUrl + functionName, {
        method: 'POST',
        headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    
    return await response.json();
}

return executeSQLQuery($json.queryType, $json.params);
```

---

## 🚀 Solución Más Simple: Modificar el Agente para Usar HTTP Request

### Configurar el Agente para que Use HTTP Request como Herramienta

**Problema**: n8n no permite conectar HTTP Request como herramienta directamente.

**Solución**: Crear un **sub-workflow** o usar **expresiones** en el prompt.

---

## 💡 Solución Recomendada: Prompt + HTTP Request Manual

### Modificar el Prompt del Agente

Agregar al final del prompt de LEO:

```
🔧 HERRAMIENTAS DISPONIBLES:

Cuando necesites consultar la base de datos, debes responder con un formato especial:

Para consultar un ticket: "SQL_QUERY:check_ticket_availability:50"
Para consultar varios: "SQL_QUERY:check_tickets_availability:[8,7,50]"
Para contar: "SQL_QUERY:count_available_tickets"
Para aleatorios: "SQL_QUERY:get_random_tickets:5"

El sistema procesará estas consultas y te dará los resultados.
```

Luego, en n8n, agregar un nodo "Switch" después del agente que detecte "SQL_QUERY:" y ejecute la consulta HTTP.

---

## 📋 Plan de Acción Inmediato

1. **Ejecutar funciones SQL en Supabase** (5 min)
2. **Modificar el prompt del agente** para usar formato SQL_QUERY (5 min)
3. **Agregar nodo Switch + HTTP Request** para procesar consultas (15 min)
4. **Probar** (5 min)

**Total**: 30 minutos

¿Quieres que te guíe paso a paso con esta solución?

