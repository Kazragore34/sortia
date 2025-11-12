# Guía: Configurar Postgres Chat Memory en n8n

## 🔴 Problema Común

El nodo "Postgres Chat Memory" muestra un error porque no encuentra el campo `id` en la tabla `n8n_chat_histories`.

**Error típico**: "Could not find column 'id' in table 'n8n_chat_histories'"

---

## ✅ Solución

### Paso 1: Ejecutar Script de Corrección

1. Ve a Supabase SQL Editor
2. Abre el archivo `fix_chat_memory.sql`
3. Copia y pega todo el contenido
4. Ejecuta el script (botón "Run" o Ctrl+Enter)

Este script recreará la tabla con la estructura correcta que espera n8n.

---

### Paso 2: Verificar la Estructura de la Tabla

Después de ejecutar el script, verifica en Supabase:

1. Ve a **Table Editor** → `n8n_chat_histories`
2. Debe tener estas columnas:
   - ✅ `id` (bigserial, PRIMARY KEY) ← **IMPORTANTE: Debe ser PRIMARY KEY**
   - ✅ `session_id` (text)
   - ✅ `message` (text)
   - ✅ `created_at` (timestamptz)

---

### Paso 3: Configurar el Nodo en n8n

En tu workflow de n8n:

1. **Abre el nodo "Postgres Chat Memory"**

2. **Verifica la configuración**:
   - **Session ID Type**: `Custom Key` (o `From Input`)
   - **Session Key**: `={{ $('Webhook').item.json.body.data.messages.remoteJid }}`
   - **Context Window Length**: `20` (o el número que prefieras)
   - **Credentials**: Debe estar conectado a tu base de datos Postgres/Supabase

3. **Verifica la conexión**:
   - El nodo debe estar conectado al nodo "AI Agent" en el puerto "Memory"
   - La conexión debe ser una línea punteada (dashed line)

---

### Paso 4: Probar la Conexión

1. **Ejecuta el workflow** con un mensaje de prueba
2. **Verifica en Supabase**:
   ```sql
   SELECT * FROM n8n_chat_histories ORDER BY created_at DESC LIMIT 5;
   ```
   Deberías ver registros nuevos con cada mensaje.

3. **Verifica que el agente recuerde**:
   - Envía un mensaje: "Mi nombre es Juan"
   - Luego envía: "¿Cuál es mi nombre?"
   - El agente debería recordar que te llamas Juan

---

## 🔍 Verificación de la Configuración

### En n8n:

✅ El nodo "Postgres Chat Memory" NO tiene icono de error (X rojo)  
✅ Está conectado al nodo "AI Agent" en el puerto "Memory"  
✅ La expresión `sessionKey` está correcta (debe obtener el número de WhatsApp)

### En Supabase:

✅ La tabla `n8n_chat_histories` tiene `id` como PRIMARY KEY  
✅ Tiene las columnas: `id`, `session_id`, `message`, `created_at`  
✅ Las políticas RLS están activas

---

## 🐛 Solución de Problemas

### Error: "Could not find column 'id'"

**Causa**: La tabla tiene `session_id` como PRIMARY KEY en lugar de `id`.

**Solución**: Ejecuta el script `fix_chat_memory.sql` en Supabase.

---

### Error: "Permission denied"

**Causa**: Las políticas RLS no están configuradas correctamente.

**Solución**: Verifica que las políticas RLS estén activas:
```sql
SELECT * FROM pg_policies WHERE tablename = 'n8n_chat_histories';
```

Si no hay políticas, ejecuta:
```sql
CREATE POLICY "Enable all access for chat histories" ON public.n8n_chat_histories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
```

---

### El agente no recuerda conversaciones anteriores

**Causa 1**: El `sessionKey` no es consistente entre mensajes.

**Solución**: Asegúrate de que `sessionKey` siempre use el mismo valor (el número de WhatsApp del usuario).

**Causa 2**: El `Context Window Length` es muy bajo.

**Solución**: Aumenta el valor (ej: de 20 a 50) para que recuerde más mensajes.

---

### No se crean registros en la tabla

**Causa**: El nodo no está conectado correctamente o hay un error en las credenciales.

**Solución**:
1. Verifica que el nodo esté conectado al "AI Agent"
2. Verifica las credenciales de Postgres en n8n
3. Revisa los logs de n8n para ver errores específicos

---

## 📝 Notas Importantes

1. **Session ID**: Debe ser único por conversación. Usa el número de WhatsApp (`remoteJid`) para que cada usuario tenga su propia sesión.

2. **Context Window**: Es el número de mensajes que el agente recordará. Un valor muy alto puede hacer que el agente sea más lento.

3. **Limpieza**: Considera crear un proceso que elimine conversaciones antiguas (ej: después de 30 días) para mantener la base de datos limpia.

---

## 🔗 Referencias

- [Documentación oficial de n8n Postgres Chat Memory](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorypostgreschat/)
- Videos mencionados: [YouTube - n8n Chat Memory](https://www.youtube.com/watch?v=hX6mzCrx1sQ)

