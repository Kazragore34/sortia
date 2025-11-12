# 🚀 INICIO AQUÍ - Guía Rápida

## 📋 ¿Qué hacer primero?

Sigue estos pasos en orden:

### 1️⃣ Ejecutar el Script SQL en Supabase

**Archivo**: `INSTRUCCIONES_EJECUCION.md`

Este es el paso más importante. Necesitas ejecutar el script SQL en Supabase para crear/actualizar la estructura de la base de datos.

👉 **Lee**: `INSTRUCCIONES_EJECUCION.md` para ver cómo hacerlo paso a paso.

**Tiempo estimado**: 5 minutos

---

### 2️⃣ Actualizar el Prompt del Agente en n8n

**Archivo**: `PROMPT_LEO_ACTUALIZADO.md`

Copia el contenido de este archivo y reemplaza el prompt actual en tu nodo "AI Agent" de n8n.

👉 **Lee**: `PROMPT_LEO_ACTUALIZADO.md` para ver el prompt completo actualizado.

**Tiempo estimado**: 2 minutos

---

### 3️⃣ Arreglar Postgres Chat Memory (IMPORTANTE)

**Archivo**: `GUIA_POSTGRES_CHAT_MEMORY.md` y `fix_chat_memory.sql`

El nodo "Postgres Chat Memory" necesita que la tabla tenga la estructura correcta.

👉 **Lee**: `GUIA_POSTGRES_CHAT_MEMORY.md` para ver cómo arreglarlo.

**Tiempo estimado**: 5 minutos

---

### 4️⃣ Configurar Herramientas SQL en n8n

**Archivos**: 
- `CONFIGURACION_N8N_SIMPLIFICADA.md` (recomendado - más fácil)
- `CONFIGURACION_N8N.md` (versión completa con más detalles)

Necesitas darle al agente la capacidad de ejecutar SQL directo.

👉 **Lee primero**: `CONFIGURACION_N8N_SIMPLIFICADA.md` (más fácil de entender)

**Tiempo estimado**: 10-15 minutos

---

### 5️⃣ Consultar la Documentación (Opcional)

**Archivos**: 
- `README.md` - Estructura completa de la base de datos
- `CONFIGURACION_N8N.md` - Configuración detallada de n8n

Consulta estos archivos si necesitas entender mejor cómo funciona el sistema o resolver problemas.

---

## ✅ Checklist Rápido

- [ ] Ejecuté el script SQL en Supabase
- [ ] Verifiqué que las tablas se crearon correctamente
- [ ] Actualicé el prompt del agente en n8n
- [ ] Configuré herramientas SQL en n8n (reemplacé Vector Store)
- [ ] Probé una consulta de disponibilidad
- [ ] Probé una reserva de tickets

---

## 🆘 ¿Problemas?

1. **Error al ejecutar SQL**: Revisa `INSTRUCCIONES_EJECUCION.md` - Sección "Solución de Problemas"
2. **Error en n8n**: Revisa `CONFIGURACION_N8N.md` - Sección "Consideraciones Importantes"
3. **No entiendo la estructura**: Revisa `README.md` - Tiene ejemplos de todas las consultas

---

## 📁 Archivos Disponibles

- `supabase_schema.sql` - Script SQL completo para ejecutar
- `INSTRUCCIONES_EJECUCION.md` - Cómo ejecutar el script (PASO 1)
- `PROMPT_LEO_ACTUALIZADO.md` - Prompt actualizado para el agente (PASO 2)
- `CONFIGURACION_N8N.md` - Cómo configurar n8n (PASO 3)
- `README.md` - Documentación completa de la base de datos

---

## 🎯 Objetivo Final

Después de completar estos pasos, tendrás:

✅ Base de datos con 3 estados de tickets (disponible/reservado/ocupado)  
✅ Agente IA que puede consultar y actualizar tickets usando SQL  
✅ Sistema sincronizado entre WhatsApp (n8n) y tienda web  
✅ Sin errores de `match_documents` (ya no se usa Vector Store para disponibilidad)

---

**¡Empieza por el PASO 1!** 👉 `INSTRUCCIONES_EJECUCION.md`

