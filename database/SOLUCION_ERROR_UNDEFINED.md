# Solución: Error "Got unexpected type: undefined" en Postgres Chat Memory

## 🔴 Tu Problema Específico

El nodo "Postgres Chat Memory" muestra:
- Error: `Got unexpected type: undefined`
- En el OUTPUT muestra: `{"action": "loadMemoryVariables", "chatHistory": []}`
- El workflow se detiene después del error

**Causa**: El nodo no está recibiendo el `sessionKey` correctamente.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar que Ejecutaste el Script SQL

**IMPORTANTE**: Primero asegúrate de ejecutar `fix_chat_memory.sql` en Supabase.

1. Ve a Supabase SQL Editor
2. Ejecuta el script `fix_chat_memory.sql`
3. Verifica que la tabla tenga la estructura correcta:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'n8n_chat_histories';
```

Debe mostrar: `id`, `session_id`, `message`, `created_at`

---

### Paso 2: Corregir la Configuración en n8n (IMPORTANTE)

El problema está en cómo está configurado el campo "Session ID" en la interfaz de n8n.

**En el nodo "Postgres Chat Memory"**:

1. **Abre el nodo** en n8n

2. **Busca el campo "Session ID"**:
   - Actualmente dice: "Define below" (esto está mal)
   - Debe estar en modo **"Expression"** (no "Fixed")

3. **Cambia a modo Expression**:
   - Haz clic en el botón **"Expression"** (no "Fixed")
   - En el campo que aparece, pega: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`

4. **Verifica que el valor se resuelva**:
   - Haz clic en el icono de "preview" o "test" junto al campo
   - Debe mostrar algo como: `34614465691@s.whatsapp.net`
   - Si muestra `undefined` o está vacío, la expresión está mal

5. **Verifica estos otros campos**:
   - **Table Name**: `n8n_chat_histories`
   - **Context Window Length**: `20`
   - **Credential to connect with**: `tickets` (tu credencial)

---

### Paso 3: Si el Campo "Session ID" No Aparece Correctamente

A veces el nodo tiene una configuración diferente. Busca estos campos:

**Opción A - Si ves "Session ID Type"**:
- **Session ID Type**: `Custom Key`
- **Session Key**: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`
  - **IMPORTANTE**: Este campo debe estar en modo **"Expression"**, no "Fixed"

**Opción B - Si ves solo "Session ID"**:
- **Session ID**: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`
  - Debe estar en modo **"Expression"**

---

### Paso 4: Verificar que la Expresión Funcione

Antes de probar el nodo completo, verifica que la expresión obtenga el valor correcto:

1. **Agrega un nodo "Set" temporal** antes del "Postgres Chat Memory"
2. **Configura**:
   - Agrega un campo: `test_session`
   - Valor: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`
3. **Ejecuta el workflow** y verifica que `test_session` tenga un valor (no `undefined`)

Si `test_session` es `undefined`, el problema es la expresión. Verifica la estructura de tu webhook.

---

### Paso 5: Verificar la Estructura del Webhook

El error puede ser que la ruta del webhook esté mal. Verifica:

1. **Abre el nodo "Webhook"** en n8n
2. **Ejecuta el workflow** con un mensaje de prueba
3. **Revisa el OUTPUT del nodo "Webhook"**
4. **Verifica la ruta**: `body.data.messages.remoteJid`

Si la estructura es diferente, ajusta la expresión. Por ejemplo:
- Si es `body.messages.remoteJid`: `={{ $('Webhook').item.json.body.messages.remoteJid }}`
- Si es `body.data.remoteJid`: `={{ $('Webhook').item.json.body.data.remoteJid }}`

---

### Paso 6: Configurar "Continue on Error" (Temporal)

Mientras arreglas el error, puedes hacer que el workflow continúe:

1. **Abre el nodo "Postgres Chat Memory"**
2. **Ve a la pestaña "Settings"** (o "Configuración")
3. **Busca "On Error"** o "Continue on Fail"
4. **Cámbialo a "Continue"** o "Continue on Error"

**NOTA**: Esto es temporal. Es mejor arreglar el error que ignorarlo.

---

## 🔍 Verificación Final

Después de hacer los cambios:

1. **Ejecuta el workflow** con un mensaje de prueba
2. **Verifica que NO aparezca el error** "Got unexpected type: undefined"
3. **Verifica en Supabase**:
```sql
SELECT * FROM n8n_chat_histories 
ORDER BY created_at DESC 
LIMIT 5;
```
   Deberías ver registros nuevos.

4. **Verifica que el agente recuerde**:
   - Envía: "Mi nombre es Juan"
   - Luego envía: "¿Cuál es mi nombre?"
   - El agente debe recordar

---

## 🐛 Errores Comunes y Soluciones

### Error: "Session Key is undefined"

**Causa**: La expresión no se está resolviendo.

**Solución**:
1. Verifica que el campo esté en modo "Expression" (no "Fixed")
2. Prueba la expresión en un nodo "Set" primero
3. Verifica la estructura del webhook

---

### Error: "Table n8n_chat_histories does not exist"

**Causa**: La tabla no existe o tiene otro nombre.

**Solución**: Ejecuta el script `fix_chat_memory.sql` en Supabase.

---

### El workflow se detiene después del error

**Causa**: El nodo tiene "Stop on Error" activado.

**Solución Temporal**: 
- En Settings del nodo, cambia "On Error" a "Continue"
- **PERO**: Es mejor arreglar el error que ignorarlo

---

## 📝 Configuración Correcta del Nodo

La configuración correcta debe ser:

```
Session ID Type: Custom Key
Session Key: ={{ $('Webhook').item.json.body.data.messages.remoteJid }}
  ↑ Este campo DEBE estar en modo "Expression"
Table Name: n8n_chat_histories
Context Window Length: 20
Credential: tickets (tu credencial de Postgres)
```

**IMPORTANTE**: El campo "Session Key" (o "Session ID") **DEBE** estar en modo **"Expression"**, no "Fixed" con "Define below".

---

## 🎯 Resumen Rápido

1. ✅ Ejecuta `fix_chat_memory.sql` en Supabase
2. ✅ Abre el nodo "Postgres Chat Memory" en n8n
3. ✅ Cambia el campo "Session ID" o "Session Key" a modo **"Expression"**
4. ✅ Pega la expresión: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`
5. ✅ Verifica que el valor se resuelva correctamente (no `undefined`)
6. ✅ Prueba el workflow

Si después de esto sigue dando error, el problema puede ser:
- La estructura del webhook es diferente
- Las credenciales de Postgres están mal
- La tabla no tiene la estructura correcta

