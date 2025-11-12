# Análisis de Problemas en el Workflow

## 🔴 Problemas Identificados

### 1. **Postgres Chat Memory - Configuración en UI**

**Problema**: En el JSON está correcto, pero en la UI de n8n el campo "Session ID" está en modo "Fixed" con "Define below" en lugar de "Expression".

**Solución**: 
- Abre el nodo "Postgres Chat Memory" en n8n
- Cambia el campo "Session ID" a modo **"Expression"** (no "Fixed")
- Asegúrate de que use: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`

---

### 2. **Supabase Vector Store1 - NO Puede Ejecutar SQL Directo** ⚠️ **PROBLEMA PRINCIPAL**

**Problema**: El nodo "Supabase Vector Store1" está configurado para búsqueda semántica (vector store), pero el agente está intentando usarlo para ejecutar consultas SQL directas como:
```sql
SELECT estado FROM public.documents WHERE id_tickets = 50;
```

**Por qué falla**:
- El Vector Store busca documentos usando embeddings (vectores)
- NO puede ejecutar consultas SQL directas
- Por eso devuelve `{"response": []}` - no encuentra nada porque está buscando embeddings, no ejecutando SQL

**Solución**: Necesitas agregar una herramienta SQL directa al agente. Tienes 3 opciones:

#### **Opción A: Agregar Nodo PostgreSQL/Supabase (Recomendado)**

1. Busca en n8n si tienes un nodo "PostgreSQL" o "Supabase" (no Vector Store)
2. Si lo tienes:
   - Agrégalo antes del "AI Agent"
   - Conéctalo al "AI Agent" como herramienta (tool)
   - Configura las credenciales de Supabase
   - El agente podrá ejecutar SQL directamente

#### **Opción B: Crear Funciones SQL en Supabase y Llamarlas vía HTTP**

1. Crea funciones SQL en Supabase (ej: `check_tickets_availability`)
2. Agrega un nodo "HTTP Request" que llame a esas funciones
3. Conéctalo al agente como herramienta

#### **Opción C: Deshabilitar Vector Store y Usar Solo el Prompt**

Si no necesitas búsqueda semántica, puedes:
1. Desconectar el nodo "Supabase Vector Store1" del agente
2. El agente usará solo el prompt (pero NO podrá consultar la base de datos automáticamente)

---

### 3. **El Agente No Tiene Herramienta SQL**

**Problema**: El agente solo tiene:
- ✅ Postgres Chat Memory (para recordar conversaciones)
- ✅ Supabase Vector Store1 (para búsqueda semántica, NO SQL directo)
- ❌ **FALTA**: Herramienta para ejecutar SQL directo

**Solución**: Agrega una herramienta SQL (Opción A o B de arriba).

---

## ✅ Configuración Correcta del Workflow

### Nodos Necesarios:

1. **Webhook** → Recibe mensajes
2. **Edit Fields** → Procesa datos
3. **Switch1** → Filtra mensajes
4. **Edit Fields5** → Prepara input para el agente
5. **AI Agent** → Agente principal
   - **Chat Model**: OpenAI Chat Model ✅
   - **Memory**: Postgres Chat Memory ✅ (arreglar en UI)
   - **Tools**: 
     - ❌ Supabase Vector Store1 (NO funciona para SQL directo)
     - ✅ **AGREGAR**: Nodo PostgreSQL/Supabase para SQL directo
6. **Code** → Limpia output
7. **HTTP Request1** → Envía respuesta

---

## 🎯 Pasos para Arreglar

### Paso 1: Arreglar Postgres Chat Memory (5 min)

1. Abre el nodo "Postgres Chat Memory" en n8n
2. Cambia "Session ID" a modo **"Expression"**
3. Verifica que la expresión funcione

### Paso 2: Agregar Herramienta SQL (15 min)

**Si tienes nodo PostgreSQL/Supabase**:
1. Agrega el nodo antes del "AI Agent"
2. Configura:
   - **Operation**: `Execute Query` o `Custom Query`
   - **Credentials**: Usa las mismas credenciales de Supabase
3. Conéctalo al "AI Agent" como herramienta (tool)

**Si NO tienes nodo PostgreSQL**:
1. Crea funciones SQL en Supabase (ver `database/funciones_sql_supabase.sql`)
2. Agrega nodo "HTTP Request" que llame a esas funciones
3. Conéctalo al agente como herramienta

### Paso 3: Probar

1. Ejecuta el workflow con: "Quiero los tickets 8, 7 y 50"
2. Verifica que el agente pueda consultar la base de datos
3. Verifica que devuelva resultados correctos

---

## 📝 Nota sobre Vector Store

El nodo "Supabase Vector Store1" puede quedarse conectado si planeas usarlo para búsqueda semántica en el futuro (ej: buscar información sobre la rifa, premios, etc.). Pero para consultas SQL directas de disponibilidad de tickets, necesitas una herramienta SQL separada.

---

## 🔍 Verificación Final

Después de hacer los cambios:

- [ ] Postgres Chat Memory funciona (no da error "undefined")
- [ ] El agente tiene una herramienta SQL directa
- [ ] El agente puede consultar `SELECT estado FROM documents WHERE id_tickets = 50`
- [ ] El agente devuelve resultados correctos
- [ ] El workflow completa sin errores

