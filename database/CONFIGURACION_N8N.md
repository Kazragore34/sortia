# Configuración de n8n para Sistema de Tickets

## 🔧 Cambios Necesarios en n8n

### Problema Actual

El nodo "Supabase Vector Store1" está configurado para usar búsqueda semántica, pero necesitas consultas SQL directas para verificar disponibilidad de tickets.

---

## ✅ Solución: Usar Herramientas SQL Directas

### Opción 1: Nodo Supabase (Recomendado)

Si n8n tiene un nodo nativo de Supabase con soporte SQL:

1. **Eliminar o Deshabilitar**:
   - Nodo "Supabase Vector Store1" (modo retrieve-as-tool)
   - Conexión al nodo "Embeddings OpenAI" (si no la necesitas)

2. **Agregar Nodo Supabase**:
   - Tipo: `Supabase` o `PostgreSQL`
   - Configuración:
     - **Operation**: `Execute Query` o `Custom Query`
     - **Credentials**: Usa las mismas credenciales de Supabase que ya tienes
     - **Query**: Dejar vacío (se configurará como herramienta del agente)

3. **Conectar al Agente IA**:
   - Conecta el nodo Supabase al nodo "AI Agent" como herramienta (tool)
   - El agente podrá ejecutar consultas SQL directamente

---

### Opción 2: Nodo Code con Supabase Client (Alternativa)

Si no tienes nodo Supabase nativo, puedes usar un nodo Code:

1. **Agregar Nodo Code** antes del Agente IA
2. **Configurar** para crear funciones SQL que el agente pueda usar
3. **Conectar** como herramienta al agente

**Ejemplo de código (JavaScript)**:
```javascript
// Este nodo prepara funciones SQL que el agente puede usar
const sqlFunctions = {
  checkAvailability: (ticketNumbers) => {
    return `SELECT id_tickets, estado FROM documents WHERE id_tickets IN (${ticketNumbers.join(',')})`;
  },
  reserveTickets: (ticketId, ticketNumbers) => {
    return `UPDATE documents SET estado = 'reservado', N_Whats = '${ticketId}' WHERE id_tickets IN (${ticketNumbers.join(',')}) AND estado = 'disponible'`;
  },
  // ... más funciones
};

return [{ json: { sqlFunctions } }];
```

---

### Opción 3: HTTP Request a Supabase REST API

Usar la API REST de Supabase directamente:

1. **Agregar Nodo HTTP Request**
2. **Configurar**:
   - **Method**: `POST`
   - **URL**: `https://[tu-proyecto].supabase.co/rest/v1/rpc/[nombre-funcion]`
   - **Headers**:
     - `apikey`: Tu API key de Supabase
     - `Authorization`: `Bearer [tu-token]`
     - `Content-Type`: `application/json`

3. **Crear Funciones en Supabase** (opcional pero recomendado):
   ```sql
   -- Ejemplo: Función para verificar disponibilidad
   CREATE OR REPLACE FUNCTION check_tickets_availability(ticket_numbers integer[])
   RETURNS TABLE(id_tickets integer, estado ticket_estado_document)
   AS $$
   BEGIN
     RETURN QUERY
     SELECT d.id_tickets, d.estado
     FROM documents d
     WHERE d.id_tickets = ANY(ticket_numbers);
   END;
   $$ LANGUAGE plpgsql;
   ```

---

## 🤖 Configurar el Agente IA

### Actualizar el Prompt

1. **Abrir** el nodo "AI Agent" en n8n
2. **Ir a** la sección "System Message" o "Prompt"
3. **Reemplazar** el prompt actual con el contenido de `PROMPT_LEO_ACTUALIZADO.md`
4. **Guardar** los cambios

### Configurar Herramientas (Tools)

El agente necesita acceso a funciones SQL. Dependiendo de la opción elegida:

- **Opción 1 (Nodo Supabase)**: El nodo se conecta automáticamente como herramienta
- **Opción 2 (Code)**: Conectar el nodo Code como herramienta
- **Opción 3 (HTTP Request)**: Crear un nodo que envuelva las peticiones HTTP como herramientas

---

## 📋 Checklist de Configuración

- [ ] Ejecutar script SQL en Supabase (`supabase_schema.sql`)
- [ ] Verificar que las tablas se crearon correctamente
- [ ] Eliminar/deshabilitar nodo "Supabase Vector Store1"
- [ ] Agregar nodo para consultas SQL (Supabase/Code/HTTP Request)
- [ ] Conectar el nodo SQL al Agente IA como herramienta
- [ ] Actualizar prompt del agente con `PROMPT_LEO_ACTUALIZADO.md`
- [ ] Probar consulta de disponibilidad
- [ ] Probar reserva de tickets
- [ ] Probar confirmación de pago

---

## 🧪 Pruebas Recomendadas

### Test 1: Consulta de Disponibilidad
**Mensaje de prueba**: "¿Tienes el ticket 55?"

**Resultado esperado**: El agente consulta la base de datos y responde si está disponible, reservado o ocupado.

### Test 2: Reserva de Tickets
**Mensaje de prueba**: "Quiero los tickets 10, 20 y 30"

**Resultado esperado**: 
1. El agente verifica disponibilidad
2. Crea registro en `tickets`
3. Actualiza `documents` a estado 'reservado'
4. Pide nombre completo
5. Proporciona datos de pago

### Test 3: Confirmación de Pago
**Mensaje de prueba**: (Después de reservar) "Aquí está el comprobante" (simular)

**Resultado esperado**:
1. El agente actualiza `tickets` a 'pagado'
2. Actualiza `documents` a 'ocupado'
3. Confirma la compra

---

## ⚠️ Consideraciones Importantes

1. **Seguridad**: Asegúrate de que las credenciales de Supabase estén configuradas correctamente y no expuestas.

2. **Transacciones**: Cuando reserves tickets, verifica que estén disponibles antes de actualizarlos para evitar conflictos.

3. **Sincronización**: La tienda web y n8n leen/escriben en las mismas tablas, así que los cambios se reflejan en tiempo real.

4. **Errores**: Implementa manejo de errores para casos como:
   - Ticket ya reservado por otro cliente
   - Error de conexión a la base de datos
   - Datos inválidos

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de n8n para ver errores específicos
2. Verifica que las credenciales de Supabase sean correctas
3. Asegúrate de que el script SQL se ejecutó correctamente
4. Prueba las consultas SQL directamente en Supabase SQL Editor

