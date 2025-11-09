/**
 * SORTIA - Landing Page de Sorteos
 * JavaScript Principal
 */

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    deadline: new Date('2025-12-21T23:59:59'), // 21 de diciembre a media noche
    totalTickets: 1000, // Tickets del 000 al 999
    ticketPrice: 8, // euros
    minTickets: 2,
    whatsappNumber: '722539447' // Número de WhatsApp
};

// ============================================
// CONTADOR DE TIEMPO
// ============================================
class CountdownTimer {
    constructor(deadline) {
        this.deadline = deadline;
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
        this.interval = null;
        this.init();
    }

    init() {
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date().getTime();
        const distance = this.deadline.getTime() - now;

        if (distance < 0) {
            this.stop();
            this.showExpired();
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.updateElement(this.elements.days, days);
        this.updateElement(this.elements.hours, hours);
        this.updateElement(this.elements.minutes, minutes);
        this.updateElement(this.elements.seconds, seconds);
    }

    updateElement(element, value) {
        if (!element) return;
        const formattedValue = String(value).padStart(2, '0');
        if (element.textContent !== formattedValue) {
            element.classList.add('updated');
            element.textContent = formattedValue;
            setTimeout(() => element.classList.remove('updated'), 500);
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    showExpired() {
        Object.values(this.elements).forEach(el => {
            if (el) el.textContent = '00';
        });
    }
}

// ============================================
// CONTADOR DE TICKETS
// ============================================
class TicketsCounter {
    constructor(totalTickets) {
        this.totalTickets = totalTickets;
        this.soldTickets = 0; // Esto debería venir de una API en producción
        this.currentDisplay = 0; // Valor actual mostrado (para animación)
        this.elements = {
            remaining: document.getElementById('tickets-remaining'),
            progress: document.getElementById('tickets-progress')
        };
        this.animationFrame = null;
        this.init();
    }

    init() {
        // Iniciar en 0
        this.currentDisplay = 0;
        this.soldTickets = 0;
        
        // Simulación: En producción esto vendría de una API
        // Por ahora, usar un valor de ejemplo. Luego se conectará a Excel
        const targetSold = Math.floor(Math.random() * 200); // Simulación
        
        // Animar desde 0 hasta el valor objetivo
        this.animateToValue(targetSold);
        
        // Simular ventas aleatorias (solo para demo)
        // En producción, esto se actualizaría desde el servidor
        // setInterval(() => this.simulateSale(), 5000);
    }

    animateToValue(targetSold) {
        this.soldTickets = targetSold;
        const targetRemaining = Math.max(0, this.totalTickets - targetSold);
        const targetPercentage = (targetSold / this.totalTickets) * 100;
        const startValue = 0;
        const duration = 2000; // 2 segundos
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Calcular valor actual
            const currentRemaining = Math.floor(startValue + (targetRemaining - startValue) * easeOut);
            const currentPercentage = 100 - ((targetSold / this.totalTickets) * 100 * easeOut);

            // Actualizar display
            if (this.elements.remaining) {
                this.elements.remaining.textContent = currentRemaining;
            }

            if (this.elements.progress) {
                this.elements.progress.style.width = `${currentPercentage}%`;
            }

            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                // Asegurar valores finales exactos
                if (this.elements.remaining) {
                    this.elements.remaining.textContent = targetRemaining;
                }
                if (this.elements.progress) {
                    this.elements.progress.style.width = `${100 - targetPercentage}%`;
                }
            }
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    simulateSale() {
        if (this.soldTickets < this.totalTickets) {
            const newSold = this.soldTickets + Math.floor(Math.random() * 3) + 1;
            this.animateToValue(newSold);
        }
    }

    update() {
        const remaining = Math.max(0, this.totalTickets - this.soldTickets);
        const percentage = (this.soldTickets / this.totalTickets) * 100;

        if (this.elements.remaining) {
            this.elements.remaining.textContent = remaining;
        }

        if (this.elements.progress) {
            this.elements.progress.style.width = `${100 - percentage}%`;
        }
    }

    getRemaining() {
        return Math.max(0, this.totalTickets - this.soldTickets);
    }
}

// ============================================
// CALCULADORA DE TICKETS PERSONALIZADOS
// ============================================
class CustomTicketCalculator {
    constructor() {
        this.input = document.getElementById('custom-amount');
        this.totalDisplay = document.getElementById('custom-total');
        this.init();
    }

    init() {
        if (this.input && this.totalDisplay) {
            this.input.addEventListener('input', () => this.calculate());
            this.input.addEventListener('change', () => this.validate());
            this.calculate();
        }
    }

    validate() {
        const value = parseInt(this.input.value) || 0;
        if (value < CONFIG.minTickets) {
            this.input.value = CONFIG.minTickets;
        }
        this.calculate();
    }

    calculate() {
        const amount = parseInt(this.input.value) || CONFIG.minTickets;
        const total = amount * CONFIG.ticketPrice;
        if (this.totalDisplay) {
            this.totalDisplay.textContent = `${total}€`;
        }
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}


// ============================================
// MANEJO DE COMPRA DE TICKETS
// ============================================
function initTicketPurchase() {
    // Botones de packs predefinidos
    document.querySelectorAll('[data-ticket-pack]').forEach(button => {
        button.addEventListener('click', function() {
            const amount = parseInt(this.dataset.ticketPack);
            handlePurchase(amount);
        });
    });

    // Botón de cantidad personalizada
    const customButton = document.getElementById('custom-purchase-btn');
    if (customButton) {
        customButton.addEventListener('click', function() {
            const input = document.getElementById('custom-amount');
            if (!input) {
                console.error('No se encontró el input de cantidad personalizada');
                return;
            }
            const amount = parseInt(input.value) || CONFIG.minTickets;
            handlePurchase(amount);
        });
    } else {
        console.error('No se encontró el botón de compra personalizada');
    }
}

function handlePurchase(amount) {
    if (amount < CONFIG.minTickets) {
        alert(`El mínimo de tickets es ${CONFIG.minTickets}`);
        return;
    }

    // Abrir modal de compra
    openPurchaseModal(amount);
}

// ============================================
// MODAL DE COMPRA
// ============================================
function openPurchaseModal(amount) {
    const modal = document.getElementById('purchase-modal');
    const ticketAmount = document.getElementById('modal-ticket-amount');
    const totalDisplay = document.getElementById('modal-total');
    
    if (!modal || !ticketAmount || !totalDisplay) return;
    
    const total = amount * CONFIG.ticketPrice;
    ticketAmount.textContent = amount;
    totalDisplay.textContent = `${total}€`;
    
    // Limpiar campos del formulario
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-lastname').value = '';
    document.getElementById('customer-phone').value = '';
    
    // Mostrar modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function initPurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    const closeBtn = document.getElementById('close-modal');
    const sendBtn = document.getElementById('send-whatsapp');
    
    // Cerrar al hacer click fuera del modal
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePurchaseModal();
            }
        });
    }
    
    // Botón cerrar
    if (closeBtn) {
        closeBtn.addEventListener('click', closePurchaseModal);
    }
    
    // Botón enviar a WhatsApp
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            const name = document.getElementById('customer-name').value.trim();
            const lastname = document.getElementById('customer-lastname').value.trim();
            const phone = document.getElementById('customer-phone').value.trim();
            const ticketAmount = document.getElementById('modal-ticket-amount').textContent;
            const total = document.getElementById('modal-total').textContent;
            
            // Validar campos
            if (!name || !lastname || !phone) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }
            
            // Validar teléfono (básico)
            if (phone.length < 9) {
                alert('Por favor, ingresa un número de teléfono válido.');
                return;
            }
            
            // Generar y abrir link de WhatsApp
            generateWhatsAppLink(name, lastname, phone, ticketAmount, total);
        });
    }
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePurchaseModal();
        }
    });
}

// ============================================
// GENERAR LINK DE WHATSAPP
// ============================================
function generateWhatsAppLink(name, lastname, phone, ticketAmount, total) {
    const message = `¡Hola! Me interesa participar en el sorteo de la Yamaha NMAX.

📋 *Información de la compra:*
• Cantidad de tickets: ${ticketAmount}
• Total a pagar: ${total}

👤 *Mis datos:*
• Nombre: ${name} ${lastname}
• Teléfono: ${phone}

Por favor, confírmame la disponibilidad y cómo proceder con el pago. ¡Gracias!`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Cerrar modal después de un breve delay
    setTimeout(() => {
        closePurchaseModal();
    }, 500);
}

// ============================================
// CARRUSEL DE IMÁGENES - VERSIÓN SIMPLIFICADA
// ============================================
class ImageCarousel {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.dots = [];
        this.prevBtn = null;
        this.nextBtn = null;
        this.autoPlayInterval = null;
        this.init();
    }

    init() {
        // Esperar a que el DOM esté completamente cargado
        const initCarousel = () => {
            console.log('🔍 ===== INICIANDO CARRUSEL =====');
            console.log('Estado del documento:', document.readyState);
            
            // Buscar imágenes con la nueva clase
            this.images = Array.from(document.querySelectorAll('.moto-carousel-img'));
            this.dots = Array.from(document.querySelectorAll('.carousel-dot'));
            this.prevBtn = document.getElementById('carousel-prev');
            this.nextBtn = document.getElementById('carousel-next');

            console.log('📊 Elementos encontrados:');
            console.log('  - Imágenes:', this.images.length);
            console.log('  - Dots:', this.dots.length);
            console.log('  - Botón prev:', this.prevBtn ? '✅' : '❌');
            console.log('  - Botón next:', this.nextBtn ? '✅' : '❌');

            if (this.images.length === 0) {
                console.error('❌ ERROR: No se encontraron imágenes del carrusel');
                console.log('Buscando elementos con clase .moto-carousel-img...');
                const allImages = document.querySelectorAll('img');
                console.log('Total de imágenes en la página:', allImages.length);
                return;
            }

            // Verificar que todas las imágenes estén cargadas
            let loadedImages = 0;
            this.images.forEach((img, index) => {
                if (img.complete) {
                    loadedImages++;
                    console.log(`✅ Imagen ${index + 1} ya cargada:`, img.src);
                } else {
                    img.addEventListener('load', () => {
                        loadedImages++;
                        console.log(`✅ Imagen ${index + 1} cargada:`, img.src);
                    });
                    img.addEventListener('error', () => {
                        console.error(`❌ Error cargando imagen ${index + 1}:`, img.src);
                    });
                }
            });

            // Event listeners para botones
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('⬅️ Click en botón anterior');
                    this.prev();
                });
            } else {
                console.warn('⚠️ Botón prev no encontrado');
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('➡️ Click en botón siguiente');
                    this.next();
                });
            } else {
                console.warn('⚠️ Botón next no encontrado');
            }

            // Event listeners para dots
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🔘 Click en dot ${index}`);
                    this.goTo(index);
                });
            });

            // Mostrar primera imagen después de un pequeño delay para asegurar que todo esté listo
            setTimeout(() => {
                this.showImage(0);
            }, 100);

            // Auto-play cada 5 segundos
            this.startAutoPlay();

            // Pausar auto-play al hacer hover
            const carousel = document.getElementById('moto-carousel');
            if (carousel) {
                carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
                carousel.addEventListener('mouseleave', () => this.startAutoPlay());
            }

            console.log('✅ ===== CARRUSEL INICIALIZADO CORRECTAMENTE =====');
            console.log(`📸 Total de imágenes: ${this.images.length}`);
            console.log(`🔘 Total de dots: ${this.dots.length}`);
        };

        // Esperar a que el DOM esté listo - con múltiples intentos
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initCarousel, 200);
            });
        } else {
            // Si el DOM ya está listo, esperar un poco más para asegurar que todo esté renderizado
            setTimeout(initCarousel, 300);
        }
    }

    showImage(index) {
        if (this.images.length === 0) {
            console.warn('⚠️ No hay imágenes para mostrar');
            return;
        }

        // Asegurar que el índice sea válido
        if (index < 0) index = this.images.length - 1;
        if (index >= this.images.length) index = 0;

        console.log(`🖼️ ===== CAMBIANDO IMAGEN =====`);
        console.log(`📊 Índice: ${index} de ${this.images.length - 1}`);
        console.log(`📸 URL de la imagen:`, this.images[index].src);
        console.log(`🖼️ Elemento imagen:`, this.images[index]);

        // Cambiar todas las imágenes
        this.images.forEach((img, i) => {
            if (i === index) {
                // Imagen activa - VISIBLE
                console.log(`✅ Activando imagen ${i + 1}`);
                console.log(`   - Antes: opacity=${img.style.opacity}, zIndex=${img.style.zIndex}, visibility=${img.style.visibility}`);
                
                // Aplicar estilos directamente
                img.setAttribute('style', 'position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; object-fit: contain !important; display: block !important; opacity: 1 !important; z-index: 10 !important; visibility: visible !important;');
                
                console.log(`   - Después: opacity=${img.style.opacity}, zIndex=${img.style.zIndex}, visibility=${img.style.visibility}`);
                console.log(`   - Computed opacity:`, window.getComputedStyle(img).opacity);
                console.log(`   - Computed z-index:`, window.getComputedStyle(img).zIndex);
                console.log(`   - Computed visibility:`, window.getComputedStyle(img).visibility);
            } else {
                // Imágenes inactivas - OCULTAS
                img.setAttribute('style', 'position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; object-fit: contain !important; display: block !important; opacity: 0 !important; z-index: 1 !important; visibility: hidden !important;');
            }
        });

        // Actualizar dots
        this.dots.forEach((dot, i) => {
            if (i === index) {
                dot.setAttribute('style', 'width: 12px !important; height: 12px !important; border-radius: 50% !important; background: white !important; cursor: pointer !important; display: block !important;');
            } else {
                dot.setAttribute('style', 'width: 8px !important; height: 8px !important; border-radius: 50% !important; background: rgba(255, 255, 255, 0.5) !important; cursor: pointer !important; display: block !important;');
            }
        });

        this.currentIndex = index;
        console.log(`✅ ===== IMAGEN ${index + 1} MOSTRADA =====`);
    }

    next() {
        if (this.images.length === 0) return;
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showImage(nextIndex);
        this.resetAutoPlay();
    }

    prev() {
        if (this.images.length === 0) return;
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.showImage(prevIndex);
        this.resetAutoPlay();
    }

    goTo(index) {
        if (this.images.length === 0) return;
        if (index >= 0 && index < this.images.length) {
            this.showImage(index);
            this.resetAutoPlay();
        }
    }

    startAutoPlay() {
        this.stopAutoPlay();
        if (this.images.length > 1) {
            this.autoPlayInterval = setInterval(() => {
                this.next();
            }, 5000);
        }
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}

// ============================================
// ANIMACIONES AL SCROLL (Entrada y salida) - OPTIMIZADO
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                entry.target.classList.remove('animated-out');
            } else {
                // Cuando sale del viewport, añadir clase de salida
                if (entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated-out');
                    entry.target.classList.remove('animated');
                }
            }
        });
    }, observerOptions);

    // Observar todos los elementos con clases de animación
    document.querySelectorAll('.animate-on-scroll, .animate-from-right, .animate-from-left').forEach(element => {
        observer.observe(element);
    });
}

// ============================================
// EFECTO PARALLAX (Simplificado - solo si es necesario)
// ============================================
function initParallax() {
    // Parallax desactivado por defecto - se puede activar si se necesita
    // El efecto parallax puede causar problemas de rendimiento
    return;
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar contador de tiempo
    const countdown = new CountdownTimer(CONFIG.deadline);
    
    // Inicializar contador de tickets
    const ticketsCounter = new TicketsCounter(CONFIG.totalTickets);
    
    // Inicializar calculadora personalizada
    const calculator = new CustomTicketCalculator();
    
    // Inicializar carrusel de imágenes
    const carousel = new ImageCarousel();
    
    // Inicializar smooth scroll
    initSmoothScroll();
    
    // Inicializar animaciones al scroll
    initScrollAnimations();
    
    // Parallax desactivado para mejor rendimiento
    // initParallax();
    
    // Inicializar compra de tickets
    initTicketPurchase();
    
    // Inicializar modal de compra
    initPurchaseModal();
    
    console.log('✅ Sortia Landing Page inicializada correctamente');
});

// ============================================
// UTILIDADES
// ============================================
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('es-ES').format(number);
}
