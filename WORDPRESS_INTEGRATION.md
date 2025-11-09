# 🔧 Guía de Integración WordPress - Sortia

## 📋 Estado Actual

Tu proyecto tiene:
- ✅ Sitio estático (`index.html`) funcionando correctamente
- ✅ WordPress instalado en la misma raíz
- ⚠️ Dos proyectos separados sin integrar

## ⚠️ Problemas Detectados

### 1. Seguridad Crítica
**`wp-config.php` contiene credenciales expuestas**
- Las credenciales de la base de datos están visibles
- **ACCIÓN REQUERIDA**: Asegúrate de que este archivo NO esté en el repositorio público
- Añade `wp-config.php` al `.gitignore` si usas Git

### 2. Conflicto de Archivos
- WordPress prioriza `index.php` sobre `index.html`
- Si WordPress crea un `index.php` en la raíz, tu sitio estático no se mostrará
- **Solución**: Crear un tema personalizado o usar una página estática de WordPress

### 3. Rutas de Assets
- Las rutas relativas (`css/style.css`, `images/`, `js/main.js`) funcionan bien
- Si mueves el sitio a WordPress, necesitarás usar `get_template_directory_uri()`

## ✅ Lo que está bien

1. **Estructura de archivos**: Los assets están organizados correctamente
2. **Código limpio**: No hay errores de linting
3. **Rutas relativas**: Funcionan correctamente para el sitio estático

## 🎯 Opciones de Integración

### Opción 1: Crear un Tema Personalizado (Recomendado)

1. Crear carpeta: `wp-content/themes/sortia/`
2. Mover archivos:
   - `index.html` → `wp-content/themes/sortia/index.php`
   - `css/` → `wp-content/themes/sortia/css/`
   - `js/` → `wp-content/themes/sortia/js/`
   - `images/` → `wp-content/themes/sortia/images/`

3. Crear `style.css` con headers de tema:
```css
/*
Theme Name: Sortia
Description: Tema personalizado para Sortia - Sorteo Yamaha NMAX
Version: 1.0
*/
```

4. Actualizar rutas en `index.php`:
```php
<?php get_header(); ?>
<!-- Tu contenido HTML aquí -->
<?php get_footer(); ?>
```

### Opción 2: Mantener Sitio Estático Separado

1. Mover WordPress a subcarpeta: `wordpress/`
2. Mantener `index.html` en la raíz
3. Configurar WordPress en subdirectorio

### Opción 3: Usar WordPress como Backend

1. Crear tema personalizado
2. Usar WordPress solo para gestión de contenido
3. Mantener el diseño actual

## 🔒 Seguridad

**IMPORTANTE**: Antes de hacer commit:

1. Añade a `.gitignore`:
```
wp-config.php
wp-content/uploads/
wp-content/cache/
```

2. Crea `wp-config-sample.php` sin credenciales reales

3. Nunca subas credenciales al repositorio

## 📝 Próximos Pasos Recomendados

1. ✅ Decidir estrategia de integración (Opción 1, 2 o 3)
2. ✅ Proteger `wp-config.php`
3. ✅ Crear tema personalizado si eliges Opción 1
4. ✅ Probar que todo funcione correctamente
5. ✅ Configurar `.gitignore` apropiadamente

## 🆘 ¿Necesitas ayuda?

Si quieres que te ayude a implementar alguna de estas opciones, solo dímelo y te guío paso a paso.

