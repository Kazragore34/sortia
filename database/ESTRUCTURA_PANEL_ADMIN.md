# Estructura del Panel Admin - Como lo Quieres

## 🎯 Estructura Solicitada

```
sortia.eu/
├── index.html          # Página principal pública (sin login)
├── admin/
│   ├── login.php       # Login para dueños (acceso con link único)
│   ├── dashboard.php   # Panel de gestión (después del login)
│   ├── tickets.php     # Gestión de tickets
│   ├── config.php      # Configuración de Supabase
│   └── logout.php      # Cerrar sesión
```

---

## 📋 Descripción de Archivos

### `index.html` (Ya existe - Panel Principal Público)

- **Acceso**: Público, sin login
- **Contenido**: 
  - Información del sorteo
  - Contador de tickets disponibles
  - Información para clientes
  - **NO** tiene acceso al panel admin

---

### `admin/login.php` (Nuevo - Login para Dueños)

- **Acceso**: Link único que solo los dueños tienen
- **URL**: `sortia.eu/admin/login.php?token=[LINK_UNICO]`
- **Funcionalidad**:
  - Verifica el token del link
  - Si el token es válido, muestra formulario de login
  - Si el token es inválido, redirige a index.html
  - Formulario: usuario + contraseña
  - Después del login exitoso → `dashboard.php`

---

### `admin/dashboard.php` (Nuevo - Panel Principal)

- **Acceso**: Solo después de login exitoso
- **Funcionalidad**:
  - Dashboard con estadísticas
  - Enlaces a gestión de tickets
  - Vista general del estado del sorteo

---

### `admin/tickets.php` (Nuevo - Gestión de Tickets)

- **Acceso**: Solo después de login
- **Funcionalidad**:
  - Ver todos los tickets (0-999)
  - Filtrar por estado
  - Marcar como pagado
  - Liberar tickets no pagados
  - Buscar por número

---

### `admin/config.php` (Nuevo - Configuración)

- **Contenido**: Credenciales de Supabase
- **Seguridad**: No accesible desde web, solo include en otros archivos

---

### `admin/logout.php` (Nuevo - Cerrar Sesión)

- **Funcionalidad**: Destruye sesión y redirige a `index.html`

---

## 🔐 Sistema de Seguridad

### Link Único para Dueños

**Generar link único**:
```php
// Generar token único (hacerlo una vez)
$admin_token = bin2hex(random_bytes(32));
// Guardar en config.php o base de datos
// Ejemplo: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Link para dueños**:
```
https://sortia.eu/admin/login.php?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Validación en login.php**:
```php
$valid_token = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // Desde config.php
$token = $_GET['token'] ?? '';

if ($token !== $valid_token) {
    header('Location: /index.html');
    exit;
}
// Si el token es válido, mostrar formulario de login
```

---

## 👥 Usuarios del Sistema

### Clientes (Público)
- **Acceso**: `sortia.eu/index.html`
- **No necesitan login**
- **Solo ven información pública**

### Dueños (Privado)
- **Acceso**: Link único → `admin/login.php?token=[LINK]`
- **Después del login**: `admin/dashboard.php`
- **Pueden gestionar tickets**

---

## 🎨 Flujo de Usuario

### Cliente Normal:
```
sortia.eu/index.html
    ↓
Ve información pública
    ↓
Puede comprar tickets (vía WhatsApp)
```

### Dueño:
```
sortia.eu/admin/login.php?token=[LINK_UNICO]
    ↓
Formulario de login (usuario + contraseña)
    ↓
admin/dashboard.php (después de login exitoso)
    ↓
admin/tickets.php (gestión de tickets)
```

---

## 📝 Archivos a Crear

1. ✅ `admin/config.php` - Configuración y credenciales
2. ✅ `admin/login.php` - Login con validación de token
3. ✅ `admin/dashboard.php` - Panel principal
4. ✅ `admin/tickets.php` - Gestión de tickets
5. ✅ `admin/logout.php` - Cerrar sesión

---

## 🔒 Seguridad Adicional

### Protección de Archivos Admin

Crear `.htaccess` en carpeta `admin/`:
```apache
# Denegar acceso directo a config.php
<Files "config.php">
    Order Allow,Deny
    Deny from all
</Files>

# Requerir HTTPS (opcional)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## ✅ Checklist de Implementación

- [ ] Crear carpeta `admin/`
- [ ] Crear `admin/config.php` con credenciales Supabase
- [ ] Crear `admin/login.php` con validación de token
- [ ] Crear `admin/dashboard.php` con estadísticas
- [ ] Crear `admin/tickets.php` con gestión de tickets
- [ ] Crear `admin/logout.php`
- [ ] Generar token único para dueños
- [ ] Probar flujo completo

---

¿Quieres que empiece creando estos archivos?

