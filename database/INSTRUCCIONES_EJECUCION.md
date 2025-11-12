# Instrucciones para Ejecutar el Script SQL en Supabase

## ⚠️ IMPORTANTE: Es GRATIS y NO necesitas servidor propio

El script SQL se ejecuta directamente en Supabase, que es un servicio **gratuito** que ya estás usando. No necesitas instalar nada en tu PC ni pagar por servidores.

---

## 📋 Pasos para Ejecutar el Script

### 1. Acceder a Supabase

1. Abre tu navegador web
2. Ve a: **https://supabase.com**
3. Inicia sesión con tu cuenta (la misma que usas para n8n)
4. Selecciona tu proyecto (el que tiene las credenciales que usas en n8n)

### 2. Abrir el SQL Editor

1. En el menú lateral izquierdo, busca **"SQL Editor"** (o "Editor SQL")
2. Haz clic en **"New query"** o **"Nueva consulta"**
   - También puedes usar el botón **"+"** o **"New"**

### 3. Copiar y Pegar el Script

1. Abre el archivo `supabase_schema.sql` que está en la carpeta `database/`
2. Selecciona **TODO** el contenido (Ctrl+A)
3. Copia el contenido (Ctrl+C)
4. Pégalo en el editor SQL de Supabase (Ctrl+V)

### 4. Ejecutar el Script

1. Revisa que el script esté completo en el editor
2. Haz clic en el botón **"Run"** (o presiona **Ctrl+Enter**)
3. Espera a que termine la ejecución (puede tardar 10-30 segundos)
4. Verás mensajes de confirmación en la parte inferior

### 5. Verificar que Funcionó

1. En el menú lateral, ve a **"Table Editor"** (o "Editor de Tablas")
2. Deberías ver las siguientes tablas:
   - ✅ `documents` (con 1000 filas: tickets 0-999)
   - ✅ `tickets` (vacía inicialmente)
   - ✅ `document_embeddings` (si la mantuviste)
   - ✅ `n8n_chat_histories` (para memoria del agente)

3. Haz clic en la tabla `documents` y verifica:
   - Tiene columnas: `id_tickets`, `estado`, `N_Whats`
   - La columna `estado` tiene valores: `disponible`, `reservado`, o `ocupado`
   - **NO** debe tener la columna `disponibilidad` (boolean)

---

## 🔍 Solución de Problemas

### Error: "relation already exists"
- **No te preocupes**: El script está diseñado para ser seguro y no borrar datos existentes
- Si ya tienes datos, el script los migrará automáticamente

### Error: "permission denied"
- Verifica que estés usando la cuenta correcta (la del proyecto)
- Asegúrate de tener permisos de administrador en el proyecto

### Error: "type already exists"
- Normal si ya ejecutaste el script antes
- El script usa `DROP TYPE IF EXISTS` para evitar conflictos

### No veo los cambios en las tablas
- Refresca la página del Table Editor (F5)
- Verifica que ejecutaste el script completo (no solo una parte)

---

## ✅ Después de Ejecutar

Una vez ejecutado correctamente:

1. **Actualiza n8n**: El agente IA ahora debe usar SQL directo en lugar de Vector Store
2. **Actualiza el prompt**: Usa el nuevo prompt que está en `database/PROMPT_LEO_ACTUALIZADO.md`
3. **Prueba el sistema**: Envía un mensaje de prueba al bot de WhatsApp

---

## 📞 ¿Necesitas Ayuda?

Si tienes algún problema:
1. Revisa los mensajes de error en el SQL Editor
2. Verifica que copiaste TODO el script completo
3. Asegúrate de estar en el proyecto correcto de Supabase

