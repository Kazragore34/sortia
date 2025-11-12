# Pasos Inmediatos para Resolver el Error

## 🎯 Lo que Necesitas Hacer AHORA

### 1️⃣ Ejecutar Script SQL (5 minutos)

1. Ve a **Supabase SQL Editor**
2. Abre el archivo `database/fix_chat_memory.sql`
3. Copia TODO el contenido
4. Pégalo en el editor SQL de Supabase
5. Haz clic en **"Run"** (o presiona Ctrl+Enter)
6. Verifica que no haya errores

---

### 2️⃣ Actualizar el JSON del Workflow (2 minutos)

Ya actualicé el archivo `tickets con ia.json` para agregar el parámetro `tableName` que faltaba.

**Lo que cambié**:
- Agregué: `"tableName": "n8n_chat_histories"` en los parámetros del nodo "Postgres Chat Memory"

**Qué hacer**:
1. Guarda el archivo `tickets con ia.json` (si está abierto)
2. En n8n, importa el workflow actualizado O manualmente agrega el campo:
   - Abre el nodo "Postgres Chat Memory"
   - Busca el campo "Table Name"
   - Pon: `n8n_chat_histories`

---

### 3️⃣ Verificar la Configuración en n8n (3 minutos)

En el nodo "Postgres Chat Memory":

1. **Session ID Type**: `Custom Key` ✅
2. **Session Key**: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`
   - **IMPORTANTE**: Este campo debe estar en modo **"Expression"** (no "Fixed")
   - Haz clic en el botón "Expression" si está en "Fixed"
3. **Table Name**: `n8n_chat_histories` ← **AGREGAR ESTO**
4. **Context Window Length**: `20`
5. **Credential**: `tickets` (tu credencial de Postgres)

---

### 4️⃣ Probar la Expresión (2 minutos)

Antes de probar el workflow completo:

1. **Abre el nodo "Postgres Chat Memory"**
2. **En el campo "Session Key"**, haz clic en el icono de "preview" o "test"
3. **Debe mostrar**: `51986548321@s.whatsapp.net` (o tu número de WhatsApp)
4. **Si muestra `undefined`**: La expresión está mal o el webhook no tiene ese campo

---

### 5️⃣ Probar el Workflow (2 minutos)

1. **Ejecuta el workflow** con un mensaje de prueba
2. **Verifica que NO aparezca el error** "Got unexpected type: undefined"
3. **Verifica en Supabase**:
```sql
SELECT * FROM n8n_chat_histories 
ORDER BY created_at DESC 
LIMIT 5;
```
   Deberías ver registros nuevos.

---

## ✅ Checklist Rápido

- [ ] Ejecuté `fix_chat_memory.sql` en Supabase
- [ ] Agregué `tableName: "n8n_chat_histories"` en el nodo
- [ ] El campo "Session Key" está en modo "Expression"
- [ ] La expresión se resuelve correctamente (no `undefined`)
- [ ] Probé el workflow y no da error
- [ ] Veo registros nuevos en la tabla `n8n_chat_histories`

---

## 🆘 Si Sigue Dando Error

1. **Lee**: `database/SOLUCION_ERROR_UNDEFINED.md` (guía completa)
2. **Verifica**: Que la tabla tenga la estructura correcta (ejecuta el script SQL)
3. **Verifica**: Que la expresión del Session Key funcione (prueba en un nodo "Set" primero)
4. **Verifica**: Que las credenciales de Postgres sean correctas

---

## 📝 Nota sobre el Workflow que se Detiene

Si el workflow se detiene después del error:

1. **Abre el nodo "Postgres Chat Memory"**
2. **Ve a "Settings"** (Configuración)
3. **Busca "On Error"** o "Continue on Fail"
4. **Cámbialo a "Continue"** (temporalmente, mientras arreglas el error)

**PERO**: Es mejor arreglar el error que ignorarlo. Sigue los pasos de arriba primero.

