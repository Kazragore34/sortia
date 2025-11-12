# Documentación de Base de Datos - Sistema de Tickets

## 📊 Estructura de la Base de Datos

Esta base de datos está diseñada para gestionar un sistema de venta de tickets de rifa con 1000 números (0-999) a través de WhatsApp y una tienda web.

---

## 🗂️ Tablas Principales

### 1. `documents` - Tickets Individuales

Almacena los 1000 tickets disponibles para la rifa.

**Columnas:**
- `id_tickets` (integer, PRIMARY KEY): Número del ticket (0-999)
- `estado` (ENUM): Estado actual del ticket
  - `'disponible'`: Ticket libre, puede ser vendido
  - `'reservado'`: Ticket reservado, esperando pago
  - `'ocupado'`: Ticket vendido y pagado
- `N_Whats` (uuid, NULLABLE): Referencia al registro en `tickets` cuando está reservado/ocupado

**Ejemplo de consulta:**
```sql
-- Ver tickets disponibles
SELECT id_tickets, estado FROM documents WHERE estado = 'disponible';

-- Verificar estado de un ticket específico
SELECT estado FROM documents WHERE id_tickets = 55;
```

---

### 2. `tickets` - Registros de Compra

Almacena los registros de compra de tickets con información del comprador.

**Columnas:**
- `id` (uuid, PRIMARY KEY): Identificador único del registro
- `created_at` (timestamptz): Fecha y hora de creación
- `nombre_completo` (text): Nombre del comprador
- `estado` (ENUM): Estado del pago
  - `'pendiente'`: Ticket reservado, esperando pago
  - `'pagado'`: Pago confirmado
  - `'no_pagado'`: Reserva cancelada por falta de pago

**Ejemplo de consulta:**
```sql
-- Crear un nuevo registro de compra
INSERT INTO tickets (nombre_completo, estado) 
VALUES ('Juan Pérez', 'pendiente') 
RETURNING id;

-- Actualizar estado de pago
UPDATE tickets SET estado = 'pagado' WHERE id = 'uuid-del-ticket';
```

---

### 3. `document_embeddings` - Búsqueda Semántica (OPCIONAL)

Esta tabla es **opcional** y solo se usa si necesitas búsqueda semántica de información sobre la rifa (premios, reglas, etc.).

**Columnas:**
- `id` (bigserial, PRIMARY KEY)
- `content` (text): Contenido del documento
- `metadata` (jsonb): Metadatos adicionales
- `embedding` (vector(1536)): Vector de embedding para búsqueda semántica

**Nota:** Si NO usas búsqueda semántica, puedes ignorar esta tabla o eliminarla.

---

### 4. `n8n_chat_histories` - Memoria del Agente IA

Almacena el historial de conversaciones para que el agente IA (LEO) recuerde el contexto.

**Columnas:**
- `session_id` (text, PRIMARY KEY): Identificador de sesión (usualmente el número de WhatsApp)
- `message` (text): Mensaje de la conversación
- `created_at` (timestamptz): Fecha y hora del mensaje

---

## 🔄 Flujo de Estados de Tickets

### Estado en `documents` (ticket individual):

```
disponible → reservado → ocupado
     ↑           ↓
     └───────────┘ (si no se paga, vuelve a disponible)
```

1. **disponible**: Ticket libre, puede ser vendido
2. **reservado**: Cliente ha confirmado compra, esperando pago
3. **ocupado**: Pago confirmado, ticket vendido

### Estado en `tickets` (registro de compra):

```
pendiente → pagado
    ↓
no_pagado (si no se confirma el pago)
```

1. **pendiente**: Reserva creada, esperando pago
2. **pagado**: Pago confirmado
3. **no_pagado**: Reserva cancelada por falta de pago

---

## 🔧 Consultas SQL Comunes

### Verificar Disponibilidad de un Ticket
```sql
SELECT estado FROM documents WHERE id_tickets = 55;
```

### Contar Tickets Disponibles
```sql
SELECT COUNT(*) FROM documents WHERE estado = 'disponible';
```

### Reservar Tickets
```sql
-- 1. Crear registro de compra
INSERT INTO tickets (nombre_completo, estado) 
VALUES ('Juan Pérez', 'pendiente') 
RETURNING id;

-- 2. Reservar los tickets (usar el ID devuelto)
UPDATE documents 
SET estado = 'reservado', N_Whats = 'uuid-del-ticket' 
WHERE id_tickets IN (22, 45, 80) AND estado = 'disponible';
```

### Confirmar Pago
```sql
-- 1. Marcar ticket como pagado
UPDATE tickets SET estado = 'pagado' WHERE id = 'uuid-del-ticket';

-- 2. Marcar documentos como ocupados
UPDATE documents 
SET estado = 'ocupado' 
WHERE N_Whats = 'uuid-del-ticket';
```

### Liberar Tickets No Pagados
```sql
-- 1. Liberar documentos
UPDATE documents 
SET estado = 'disponible', N_Whats = NULL 
WHERE N_Whats = 'uuid-del-ticket' AND estado = 'reservado';

-- 2. Marcar ticket como no pagado
UPDATE tickets 
SET estado = 'no_pagado' 
WHERE id = 'uuid-del-ticket' AND estado = 'pendiente';
```

### Buscar Tickets al Azar Disponibles
```sql
SELECT id_tickets 
FROM documents 
WHERE estado = 'disponible' 
ORDER BY random() 
LIMIT 5;
```

### Ver Tickets de un Comprador
```sql
SELECT d.id_tickets, d.estado, t.nombre_completo, t.estado as estado_pago
FROM documents d
JOIN tickets t ON d.N_Whats = t.id
WHERE t.nombre_completo = 'Juan Pérez';
```

---

## 🔐 Seguridad (RLS - Row Level Security)

Todas las tablas tienen Row Level Security habilitado. Las políticas permiten:
- **Lectura**: Usuarios autenticados pueden leer todas las tablas
- **Escritura**: Usuarios autenticados pueden insertar/actualizar

**Importante:** Asegúrate de que n8n y tu tienda web usen las credenciales correctas de Supabase.

---

## 🔗 Relaciones entre Tablas

```
tickets (id)
    ↑
    │ (N_Whats)
    │
documents (id_tickets, estado, N_Whats)
```

- Un `ticket` puede tener múltiples `documents` asociados (varios números comprados)
- Un `document` puede estar asociado a un `ticket` vía `N_Whats`

---

## 📝 Notas Importantes

1. **Sincronización en Tiempo Real**: La tienda web y n8n leen/escriben en las mismas tablas, por lo que los cambios se reflejan inmediatamente.

2. **Transacciones**: Cuando reserves tickets, asegúrate de verificar que estén disponibles antes de actualizarlos (usar `AND estado = 'disponible'` en el UPDATE).

3. **Liberación Automática**: Considera implementar un proceso automático que libere tickets reservados después de X tiempo sin pago.

4. **Índices**: La base de datos tiene índices en `estado` y `N_Whats` para mejorar el rendimiento de las consultas.

---

## 🚀 Próximos Pasos

1. Ejecutar el script `supabase_schema.sql` en Supabase
2. Configurar el agente IA en n8n con herramientas SQL directas
3. Actualizar el prompt del agente con las nuevas instrucciones SQL
4. Probar el flujo completo de venta

