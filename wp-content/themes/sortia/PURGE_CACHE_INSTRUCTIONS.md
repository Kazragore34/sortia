# Instrucciones para Purgar Caché de LiteSpeed Cache

## Problema
El carrusel no funciona porque LiteSpeed Cache está sirviendo una versión antigua del archivo JavaScript.

## Solución: Purgar Caché de LiteSpeed Cache

### Opción 1: Desde el Panel de WordPress
1. Ve a **WordPress Admin** → **LiteSpeed Cache** → **Toolbox**
2. Haz clic en **Purge All** o **Purge All - LSCache**
3. También purga **CSS/JS Cache** específicamente

### Opción 2: Desde el Panel de Hostinger
1. Ve a **hPanel** → **WordPress** → **LiteSpeed Cache**
2. Busca la opción **Purge Cache** o **Limpiar Caché**
3. Haz clic en **Purge All**

### Opción 3: Desactivar temporalmente LiteSpeed Cache
1. Ve a **WordPress Admin** → **Plugins**
2. **Desactiva** temporalmente **LiteSpeed Cache**
3. Recarga la página
4. Si funciona, **reactiva** el plugin y purga la caché

### Opción 4: Forzar recarga en el navegador
1. Abre las **Herramientas de Desarrollador** (F12)
2. Ve a la pestaña **Network** (Red)
3. Marca la casilla **Disable cache** (Deshabilitar caché)
4. Mantén las herramientas abiertas y recarga la página (F5)

### Verificación
Después de purgar la caché, deberías ver en la consola:
```
🔍 ===== INICIANDO CARRUSEL =====
📊 Elementos encontrados:
  - Imágenes: 12
  - Dots: 12
✅ ===== CARRUSEL INICIALIZADO CORRECTAMENTE =====
```

Si ves "Carrusel inicializado con 12 imágenes", significa que todavía está usando la versión en caché.

