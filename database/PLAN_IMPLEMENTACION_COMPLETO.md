# Plan de Implementación Completo

## 🎯 Objetivos

1. **PRIORIDAD 1**: Solucionar n8n para que el agente pueda consultar SQL
2. **PRIORIDAD 2**: Crear panel admin con estructura específica

---

## 📋 Fase 1: Solucionar n8n (30-45 minutos)

### Paso 1: Ejecutar Funciones SQL en Supabase (5 min)
- [ ] Ejecutar `database/funciones_sql_supabase.sql` en Supabase
- [ ] Verificar que las funciones se crearon

### Paso 2: Arreglar Postgres Chat Memory (5 min)
- [ ] Abrir nodo "Postgres Chat Memory" en n8n
- [ ] Cambiar "Session ID" a modo "Expression"
- [ ] Verificar que funciona

### Paso 3: Agregar Nodos para SQL (20 min)
- [ ] Agregar nodo "Code" - "SQL Query Processor"
- [ ] Agregar nodo "HTTP Request" - "Execute SQL Query"
- [ ] Agregar nodo "Switch" para rutear
- [ ] Agregar nodo "Code" - "Format SQL Result"
- [ ] Conectar todos los nodos

### Paso 4: Configurar Credenciales (5 min)
- [ ] Obtener credenciales de Supabase
- [ ] Configurar HTTP Request con credenciales
- [ ] Probar una consulta

### Paso 5: Probar (10 min)
- [ ] Probar: "Quiero los tickets 8, 7 y 50"
- [ ] Verificar que consulta SQL funciona
- [ ] Verificar que el agente responde correctamente

---

## 📋 Fase 2: Crear Panel Admin (2-3 horas)

### Estructura de Archivos

```
sortia.eu/
├── index.html          # Página principal pública (YA EXISTE)
├── admin/
│   ├── login.php       # Login con link único
│   ├── dashboard.php   # Panel principal
│   ├── tickets.php     # Gestión de tickets
│   ├── config.php      # Configuración Supabase
│   └── logout.php      # Cerrar sesión
```

### Paso 1: Crear Estructura Base (30 min)
- [ ] Crear carpeta `admin/`
- [ ] Crear `admin/config.php` con credenciales Supabase
- [ ] Crear `.htaccess` para seguridad

### Paso 2: Crear Login (45 min)
- [ ] Crear `admin/login.php` con validación de token
- [ ] Generar token único para dueños
- [ ] Crear formulario de login
- [ ] Implementar autenticación

### Paso 3: Crear Dashboard (30 min)
- [ ] Crear `admin/dashboard.php`
- [ ] Mostrar estadísticas (disponibles, reservados, ocupados)
- [ ] Agregar navegación

### Paso 4: Crear Gestión de Tickets (60 min)
- [ ] Crear `admin/tickets.php`
- [ ] Listar todos los tickets
- [ ] Filtrar por estado
- [ ] Marcar como pagado
- [ ] Liberar tickets no pagados
- [ ] Buscar por número

### Paso 5: Crear Logout (5 min)
- [ ] Crear `admin/logout.php`
- [ ] Destruir sesión
- [ ] Redirigir a index.html

### Paso 6: Probar Panel (10 min)
- [ ] Probar login con token
- [ ] Probar gestión de tickets
- [ ] Verificar que actualiza Supabase
- [ ] Verificar sincronización con n8n

---

## ✅ Checklist Final

### n8n
- [ ] Postgres Chat Memory funciona
- [ ] SQL Query Processor detecta consultas
- [ ] HTTP Request ejecuta funciones SQL
- [ ] Agente recibe resultados y responde correctamente

### Panel Admin
- [ ] Login funciona con token único
- [ ] Dashboard muestra estadísticas
- [ ] Gestión de tickets funciona
- [ ] Actualiza Supabase correctamente
- [ ] Sincronización con n8n funciona

---

## 🚀 Orden de Implementación

1. **AHORA**: Fase 1 - Solucionar n8n (30-45 min)
2. **DESPUÉS**: Fase 2 - Crear panel admin (2-3 horas)

---

¿Empezamos con la Fase 1?

