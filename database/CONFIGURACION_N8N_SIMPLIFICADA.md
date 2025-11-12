# Configuración de n8n - Guía Simplificada

## 🎯 Objetivo

Configurar el agente IA para que pueda consultar y actualizar tickets usando SQL directo en lugar de Vector Store.

---

## 📋 Paso a Paso (Versión Simple)

### 1️⃣ Arreglar Postgres Chat Memory (PRIMERO)

**Problema**: El nodo muestra error porque la tabla no tiene la estructura correcta.

**Solución**:
1. Ve a Supabase SQL Editor
2. Ejecuta el archivo `fix_chat_memory.sql`
3. Verifica que el nodo "Postgres Chat Memory" ya no tenga error

👉 **Lee**: `GUIA_POSTGRES_CHAT_MEMORY.md` para más detalles.

---

### 2️⃣ Entender el Problema del Vector Store

**Situación actual**:
- Tienes un nodo "Supabase Vector Store1" conectado al agente
- Este nodo busca documentos usando búsqueda semántica (embeddings)
- Pero necesitas consultar disponibilidad de tickets, que es una consulta SQL directa

**Solución**: Necesitas darle al agente la capacidad de ejecutar SQL directamente.

---

### 3️⃣ Opciones para Agregar SQL al Agente

Tienes **3 opciones**. Elige la que sea más fácil para ti:

#### **Opción A: Usar el Nodo Supabase (Si existe en tu n8n)**

1. **Busca** en n8n si tienes un nodo llamado "Supabase" o "PostgreSQL"
2. Si lo tienes:
   - Agrega el nodo antes del "AI Agent"
   - Conéctalo al "AI Agent" como herramienta (tool)
   - Configura las credenciales de Supabase
   - El agente podrá ejecutar SQL automáticamente

**Ventaja**: Más fácil, n8n lo maneja automáticamente.

---

#### **Opción B: Mantener Vector Store PERO Agregar SQL Manual**

Si no encuentras el nodo Supabase, puedes:

1. **Mantener** el nodo "Supabase Vector Store1" (déjalo como está)
2. **Agregar** un nodo "Code" antes del agente que prepare funciones SQL
3. El agente usará el Vector Store para búsqueda semántica Y las funciones SQL para consultas directas

**Ventaja**: No necesitas cambiar mucho, solo agregar.

---

#### **Opción C: Usar HTTP Request a Supabase API**

1. **Crear funciones SQL en Supabase** (ej: `check_tickets_availability`)
2. **Agregar nodo HTTP Request** en n8n
3. **Llamar** a esas funciones desde el agente

**Ventaja**: Más control, pero más trabajo.

---

### 4️⃣ Recomendación: Opción B (Más Simple)

**¿Por qué?** Porque:
- No necesitas cambiar mucho tu workflow actual
- El Vector Store puede seguir funcionando para otras cosas
- Solo necesitas agregar un nodo Code

**Pasos**:

1. **Agregar Nodo Code** antes del "AI Agent"
   - Nombre: "SQL Helper" o "Database Functions"

2. **Pegar este código**:
```javascript
// Preparar funciones SQL que el agente puede usar
const sqlFunctions = {
  // Verificar disponibilidad de un ticket
  checkTicket: (ticketNumber) => {
    return {
      query: `SELECT id_tickets, estado FROM documents WHERE id_tickets = ${ticketNumber}`,
      description: "Verifica el estado de un ticket específico"
    };
  },
  
  // Verificar varios tickets
  checkTickets: (ticketNumbers) => {
    const numbers = ticketNumbers.join(',');
    return {
      query: `SELECT id_tickets, estado FROM documents WHERE id_tickets IN (${numbers})`,
      description: "Verifica el estado de varios tickets"
    };
  },
  
  // Contar tickets disponibles
  countAvailable: () => {
    return {
      query: `SELECT COUNT(*) as total FROM documents WHERE estado = 'disponible'`,
      description: "Cuenta cuántos tickets están disponibles"
    };
  },
  
  // Buscar tickets al azar
  randomTickets: (count) => {
    return {
      query: `SELECT id_tickets FROM documents WHERE estado = 'disponible' ORDER BY random() LIMIT ${count}`,
      description: "Busca tickets disponibles al azar"
    };
  }
};

return [{ json: { sqlFunctions, instructions: "Usa estas funciones SQL para consultar la base de datos de tickets" } }];
```

3. **Conectar** el nodo Code al "AI Agent" como herramienta (tool)

4. **Actualizar el prompt** del agente para que sepa usar estas funciones

---

### 5️⃣ Actualizar el Prompt del Agente

Ya actualizaste el prompt con `PROMPT_LEO_ACTUALIZADO.md`, pero asegúrate de que incluya:

- Instrucciones para usar SQL directo
- Referencias a los estados: 'disponible', 'reservado', 'ocupado'
- No usar `disponibilidad = true/false` (ya no existe)

---

## ✅ Checklist Final

- [ ] Ejecuté `fix_chat_memory.sql` en Supabase
- [ ] El nodo "Postgres Chat Memory" ya no tiene error
- [ ] Elegí una opción para agregar SQL (A, B o C)
- [ ] Configuré el nodo correspondiente
- [ ] Actualicé el prompt del agente
- [ ] Probé una consulta de disponibilidad
- [ ] El agente puede consultar tickets correctamente

---

## 🆘 ¿Necesitas Ayuda?

1. **Error en Postgres Chat Memory**: Lee `GUIA_POSTGRES_CHAT_MEMORY.md`
2. **No entiendo las opciones**: Empieza con la Opción B (más simple)
3. **El agente no consulta SQL**: Verifica que el nodo esté conectado como "tool" al agente

---

## 📝 Nota Importante

**NO necesitas eliminar el Vector Store** si no quieres. Puedes tener ambos:
- Vector Store: Para búsqueda semántica (si lo necesitas en el futuro)
- SQL Directo: Para consultas de disponibilidad de tickets

El agente puede usar ambos según lo necesite.

