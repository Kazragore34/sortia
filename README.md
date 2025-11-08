# 🏍️ Sortia - Landing Page de Sorteos

Landing page premium para sorteos de motos. Diseñada con un enfoque moderno, atractivo y optimizado para conversión.

## 📋 Descripción del Proyecto

Sortia es una plataforma de sorteos que permite a los usuarios participar en sorteos de productos premium. Esta landing page está diseñada específicamente para el sorteo de una **Yamaha NMAX-tech Max 125cc 2025**.

### Características del Sorteo Actual

- **Premio**: Yamaha NMAX-tech Max 125cc 2025
- **Color**: Cerámic Grey
- **Estado**: 0 kilómetros, completamente nueva
- **Fecha Límite**: 21 de diciembre de 2025 a las 00:00
- **Total de Tickets**: 999 (numerados del 000 al 998)
- **Precio por Ticket**: 8€
- **Mínimo**: 2 tickets por persona
- **Máximo**: Sin límite
- **Método de Sorteo**: Últimas 3 cifras de la Lotería de Navidad 2025

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Estilos personalizados y animaciones
- **Tailwind CSS**: Framework CSS utility-first (vía CDN)
- **JavaScript (Vanilla)**: Funcionalidad interactiva sin dependencias

### Fuentes
- **Google Fonts**:
  - Inter (texto general)
  - Poppins (títulos y elementos destacados)

### Características Técnicas
- ✅ Diseño responsive (mobile-first)
- ✅ Optimizado para SEO
- ✅ Animaciones suaves y transiciones
- ✅ Contador de tiempo en tiempo real
- ✅ Contador de tickets disponibles
- ✅ Calculadora de tickets personalizados
- ✅ Smooth scroll navigation
- ✅ Efectos glassmorphism
- ✅ Paleta de colores Cerámic Grey

## 📁 Estructura de Carpetas

```
sortia/
├── index.html          # Página principal
├── css/
│   └── style.css      # Estilos personalizados
├── js/
│   └── main.js        # JavaScript principal
├── images/            # Imágenes del proyecto
│   └── (aquí irán las imágenes de la moto)
├── fonts/             # Fuentes personalizadas (si aplica)
├── LICENSE            # Licencia MIT
└── README.md          # Este archivo
```

## 🎨 Paleta de Colores

La paleta está basada en el color **Cerámic Grey** de la moto:

- **Ceramic 50**: `#f8f9fa` - Fondos muy claros
- **Ceramic 100**: `#e9ecef` - Fondos claros
- **Ceramic 200**: `#dee2e6` - Bordes y separadores
- **Ceramic 300**: `#ced4da` - Elementos secundarios
- **Ceramic 400**: `#adb5bd` - Texto secundario
- **Ceramic 500**: `#868e96` - Texto medio
- **Ceramic 600**: `#495057` - Texto principal
- **Ceramic 700**: `#343a40` - Texto destacado
- **Ceramic 800**: `#212529` - Texto muy oscuro / Botones
- **Ceramic 900**: `#1a1d20` - Fondos oscuros

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web (para desarrollo local) o hosting (Hostinger)

### Instalación Local

1. Clona o descarga el repositorio
2. Abre `index.html` en tu navegador o usa un servidor local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

3. Accede a `http://localhost:8000`

### Despliegue en Hostinger

1. Sube todos los archivos a la carpeta `public_html` de tu hosting
2. Asegúrate de que `index.html` esté en la raíz
3. Verifica que las rutas de CSS y JS sean correctas
4. Añade las imágenes de la moto en la carpeta `images/`

## 📝 Personalización

### Cambiar la Fecha Límite

Edita el archivo `js/main.js`:

```javascript
const CONFIG = {
    deadline: new Date('2025-12-21T23:59:59'), // Cambia esta fecha
    // ...
};
```

### Actualizar Información del Premio

Edita la sección "Premio" en `index.html`:

```html
<div class="flex items-center justify-between py-3 border-b border-ceramic-200">
    <span class="text-ceramic-600 font-medium">Marca</span>
    <span class="text-ceramic-900 font-bold text-lg">Yamaha</span>
</div>
```

### Conectar con Sistema de Pago

En `js/main.js`, modifica la función `handlePurchase()`:

```javascript
function handlePurchase(amount) {
    // Integra con tu pasarela de pago
    window.location.href = `/checkout?tickets=${amount}`;
}
```

### Actualizar Tickets Vendidos

Conecta con tu API para obtener los tickets vendidos en tiempo real:

```javascript
async function updateTicketsSold() {
    const response = await fetch('/api/tickets/sold');
    const data = await response.json();
    ticketsCounter.soldTickets = data.sold;
    ticketsCounter.update();
}
```

## 🎯 Secciones de la Landing Page

1. **Header**: Navegación fija con menú
2. **Hero**: Título principal, contador de tiempo y tickets
3. **Premio**: Información detallada de la moto
4. **Comprar Tickets**: Packs predefinidos y calculadora personalizada
5. **Cómo Funciona**: Proceso en 3 pasos
6. **FAQ**: Preguntas frecuentes
7. **Footer**: Información de contacto y enlaces

## 🔧 Optimizaciones Implementadas

- ✅ Tailwind CSS vía CDN (optimizado)
- ✅ Google Fonts con preconnect
- ✅ Lazy loading de imágenes (preparado)
- ✅ Código JavaScript modular
- ✅ CSS separado por secciones
- ✅ Animaciones con CSS (mejor rendimiento)
- ✅ Scroll suave nativo
- ✅ Meta tags para SEO

## 📱 Responsive Design

La página está optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

## 🌐 Compatibilidad de Navegadores

- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**Sortia Team**

## 📞 Contacto

- Email: info@sortia.com
- Soporte: soporte@sortia.com

## 🔮 Próximas Mejoras

- [ ] Integración con pasarela de pago
- [ ] Panel de administración
- [ ] Sistema de notificaciones por email
- [ ] Galería de imágenes de la moto
- [ ] Video del premio
- [ ] Testimonios de ganadores anteriores
- [ ] Compartir en redes sociales
- [ ] Modo oscuro

## 📚 Recursos Utilizados

- [Tailwind CSS](https://tailwindcss.com/)
- [Google Fonts](https://fonts.google.com/)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [Poppins Font](https://fonts.google.com/specimen/Poppins)

---

**Nota**: Esta es una landing page estática. Para producción, necesitarás integrar un backend para manejar las compras, pagos y gestión de tickets.

