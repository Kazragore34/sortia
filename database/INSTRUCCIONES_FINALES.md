# Instrucciones Finales - Base de Datos Completa

## ✅ Script SQL Final Creado

He creado `database/supabase_schema_FINAL.sql` con la estructura EXACTA que necesitas:

### Tablas Creadas:

1. **`documents`** - Para Vector Store de n8n
   - `id` (bigserial, PRIMARY KEY)
   - `content` (text)
   - `metadata` (jsonb)
   - `embedding` (vector(1536))
   - Función `match_documents` incluida

2. **`n8n_chat_histories`** - EXACTA como la imagen
   - `id` (bigserial, PRIMARY KEY) ← int8
   - `session_id` (text, Default NULL)
   - `message` (jsonb, Default NULL) ← **JSON, NO TEXT** (CRÍTICO)
   - `created_at` (timestamptz)

3. **`tickets`** - Para gestionar compras
   - `id` (uuid, PRIMARY KEY)
   - `nombre_completo` (text)
   - `estado` (ENUM: pendiente, pagado, no_pagado)
   - `created_at` (timestamptz)

4. **`tickets_documents`** - Los 1000 tickets de la rifa (0-999)
   - `id_tickets` (integer, PRIMARY KEY)
   - `N_Whats` (uuid, referencia a tickets)
   - `estado` (ENUM: disponible, reservado, ocupado)

---

## 🚀 Pasos para Ejecutar

### Paso 1: Ejecutar Script SQL en Supabase

1. Ve a **Supabase SQL Editor**
2. Abre el archivo `database/supabase_schema_FINAL.sql`
3. Copia **TODO** el contenido
4. Pégalo en el editor SQL de Supabase
5. Haz clic en **"Run"** (o Ctrl+Enter)
6. Verifica que no haya errores

---

### Paso 2: Verificar Estructura de n8n_chat_histories

**IMPORTANTE**: Verifica que la tabla `n8n_chat_histories` tenga EXACTAMENTE esta estructura:

1. Ve a **Table Editor** en Supabase
2. Abre la tabla `n8n_chat_histories`
3. Verifica las columnas:
   - ✅ `id` - Tipo: **int8** (bigint), Primary Key
   - ✅ `session_id` - Tipo: **text**, Default: NULL
   - ✅ `message` - Tipo: **jsonb** (NO text), Default: NULL ← **CRÍTICO**
   - ✅ `created_at` - Tipo: **timestamptz**

**Si `message` es tipo `text` en lugar de `jsonb`, el script lo corregirá automáticamente.**

---

### Paso 3: Actualizar Referencias en el Prompt de LEO

**IMPORTANTE**: El prompt del agente debe usar `tickets_documents` en lugar de `documents`:

**Cambiar en el prompt**:
- ❌ `SELECT ... FROM documents` 
- ✅ `SELECT ... FROM tickets_documents`

**Consultas actualizadas**:
```sql
-- Disponibilidad General
SELECT COUNT(*) FROM public.tickets_documents WHERE estado = 'disponible';

-- Disponibilidad Específica
SELECT estado FROM public.tickets_documents WHERE id_tickets = 50;

-- Varios tickets
SELECT id_tickets, estado FROM public.tickets_documents WHERE id_tickets IN (8, 7, 50);

-- Al azar
SELECT id_tickets FROM public.tickets_documents WHERE estado = 'disponible' ORDER BY random() LIMIT 5;
```

---

### Paso 4: Configurar n8n

1. **Postgres Chat Memory**:
   - Table Name: `n8n_chat_histories`
   - Session Key: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`
   - Modo: **Expression** (no Fixed)

2. **Supabase Vector Store1**:
   - Table Name: `documents` (para búsqueda semántica)
   - Esta tabla es para embeddings, NO para consultas SQL de tickets

3. **Para consultas SQL de tickets**:
   - Usa las funciones SQL creadas (ver `SOLUCION_N8N_DEFINITIVA.md`)
   - O consulta directamente `tickets_documents`

---

## 📋 Resumen de Tablas

| Tabla | Propósito | Uso |
|-------|-----------|-----|
| `documents` | Vector Store (embeddings) | Búsqueda semántica en n8n |
| `n8n_chat_histories` | Memoria del agente | Postgres Chat Memory en n8n |
| `tickets` | Registros de compra | Gestionar compras |
| `tickets_documents` | 1000 tickets (0-999) | Consultas SQL de disponibilidad |

---

## ✅ Checklist

- [ ] Ejecuté `supabase_schema_FINAL.sql` en Supabase
- [ ] Verifiqué que `n8n_chat_histories.message` es tipo **jsonb** (NO text)
- [ ] Verifiqué que `n8n_chat_histories.id` es tipo **int8** (bigint)
- [ ] Actualicé el prompt de LEO para usar `tickets_documents`
- [ ] Configuré Postgres Chat Memory en n8n
- [ ] Probé que el agente funciona

---

## 🆘 Si Algo No Funciona

1. **Error en n8n_chat_histories**: Verifica que `message` sea tipo **jsonb**, no text
2. **Error en consultas SQL**: Verifica que uses `tickets_documents`, no `documents`
3. **Vector Store no funciona**: Verifica que la tabla `documents` tenga la función `match_documents`

---

## 📝 Notas Importantes

1. **`documents`** = Para Vector Store (búsqueda semántica con embeddings)
2. **`tickets_documents`** = Para consultas SQL de tickets (disponibilidad, estados, etc.)
3. **`n8n_chat_histories.message`** = DEBE ser **jsonb**, NO text

---

¿Ejecutaste el script? ¿Necesitas ayuda con algún paso?

