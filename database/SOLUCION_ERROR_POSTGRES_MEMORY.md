# Solución: Error "Got unexpected type: undefined" en Postgres Chat Memory

## 🔴 Problema

El nodo "Postgres Chat Memory" muestra el error:
- `Got unexpected type: undefined`
- El workflow se detiene después del error
- El agente responde pero no continúa

## ✅ Solución Paso a Paso

### Paso 1: Verificar que la Tabla Esté Correcta

**IMPORTANTE**: Primero asegúrate de que ejecutaste el script `fix_chat_memory.sql` en Supabase.

1. Ve a Supabase SQL Editor
2. Ejecuta este comando para verificar la estructura:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'n8n_chat_histories'
ORDER BY ordinal_position;
```

**Debe mostrar**:
- `id` (bigint, NOT NULL) ← PRIMARY KEY
- `session_id` (text, NOT NULL)
- `message` (text, NOT NULL)
- `created_at` (timestamp with time zone, NOT NULL)

Si NO tiene esta estructura, ejecuta `fix_chat_memory.sql`.

---

### Paso 2: Corregir la Configuración del Nodo en n8n

El problema está en cómo está configurado el campo "Session ID" en el nodo.

**Configuración CORRECTA**:

1. **Abre el nodo "Postgres Chat Memory"** en n8n

2. **En el campo "Session ID"**:
   - **NO** debe decir "Define below"
   - Debe estar en modo **"Expression"** (no "Fixed")
   - El valor debe ser: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`

3. **Verifica estos campos**:
   - **Credential to connect with**: `tickets` (tu credencial de Postgres)
   - **Table Name**: `n8n_chat_histories`
   - **Context Window Length**: `20` (o el número que prefieras)

---

### Paso 3: Configuración Detallada del Nodo

En el nodo "Postgres Chat Memory", la configuración debe ser:

```
Session ID Type: Custom Key
Session Key: ={{ $('Webhook').item.json.body.data.messages.remoteJid }}
Table Name: n8n_chat_histories
Context Window Length: 20
```

**IMPORTANTE**: 
- El campo "Session ID" debe estar en modo **"Expression"** (botón "Expression" seleccionado, no "Fixed")
- La expresión debe obtener el `remoteJid` del webhook

---

### Paso 4: Verificar la Conexión

1. **Verifica que el nodo esté conectado**:
   - Debe estar conectado al nodo "AI Agent" en el puerto "Memory" (línea punteada)
   - NO debe tener icono de error (X rojo)

2. **Prueba la expresión**:
   - En el campo "Session Key", haz clic en el icono de "test" o "preview"
   - Debe mostrar algo como: `51986548321@s.whatsapp.net`
   - Si muestra `undefined` o está vacío, la expresión está mal

---

### Paso 5: Si el Error Persiste

Si después de estos pasos sigue dando error, prueba esto:

1. **Desconecta y reconecta** el nodo "Postgres Chat Memory" del "AI Agent"

2. **Verifica las credenciales de Postgres**:
   - Asegúrate de que las credenciales "tickets" estén correctas
   - Verifica que la conexión a Supabase funcione

3. **Prueba con un Session ID fijo temporalmente**:
   - Cambia a modo "Fixed"
   - Pon un valor de prueba: `test-session-123`
   - Ejecuta el workflow
   - Si funciona, el problema es la expresión del Session ID
   - Si no funciona, el problema es la tabla o las credenciales

---

## 🔍 Verificación Final

Después de hacer los cambios:

1. **Ejecuta el workflow** con un mensaje de prueba
2. **Verifica en Supabase**:
```sql
SELECT * FROM n8n_chat_histories 
ORDER BY created_at DESC 
LIMIT 5;
```
   Deberías ver registros nuevos.

3. **Verifica que el agente recuerde**:
   - Envía: "Mi nombre es Juan"
   - Luego envía: "¿Cuál es mi nombre?"
   - El agente debe recordar

---

## 📝 Nota sobre el Workflow que se Detiene

Si el workflow se detiene después del error del Postgres Chat Memory:

1. **El nodo tiene "Stop and Error" activado por defecto**
2. **Solución**: En la configuración del nodo, busca la opción "Continue on Fail" o "On Error" y cámbiala a "Continue"

**PERO**: Es mejor arreglar el error del Postgres Chat Memory para que funcione correctamente, en lugar de ignorarlo.

---

## 🐛 Errores Comunes

### Error: "Session ID is undefined"

**Causa**: La expresión no está obteniendo el valor correcto.

**Solución**: Verifica que la expresión sea:
```
={{ $('Webhook').item.json.body.data.messages.remoteJid }}
```

Y que el webhook tenga ese campo. Prueba la expresión en un nodo "Set" antes para ver qué valor tiene.

---

### Error: "Table n8n_chat_histories does not exist"

**Causa**: La tabla no existe o tiene otro nombre.

**Solución**: Ejecuta el script `fix_chat_memory.sql` en Supabase.

---

### Error: "Permission denied"

**Causa**: Las políticas RLS no están configuradas.

**Solución**: Verifica que las políticas RLS estén activas (el script `fix_chat_memory.sql` las crea automáticamente).

