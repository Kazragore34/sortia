/**
 * SORTIA - Landing Page de Sorteos
 * JavaScript Principal
 */

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    deadline: new Date('2025-12-21T23:59:59'), // 21 de diciembre a media noche
    totalTickets: 999,
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
        this.elements = {
            remaining: document.getElementById('tickets-remaining'),
            progress: document.getElementById('tickets-progress')
        };
        this.init();
    }

    init() {
        // Simulación: En producción esto vendría de una API
        this.soldTickets = Math.floor(Math.random() * 200); // Simulación
        this.update();
        
        // Simular ventas aleatorias (solo para demo)
        // En producción, esto se actualizaría desde el servidor
        // setInterval(() => this.simulateSale(), 5000);
    }

    simulateSale() {
        if (this.soldTickets < this.totalTickets) {
            this.soldTickets += Math.floor(Math.random() * 3) + 1;
            this.update();
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
// ANIMACIONES AL SCROLL
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section > div').forEach(section => {
        observer.observe(section);
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
    const customButton = document.querySelector('#comprar button:last-of-type');
    if (customButton) {
        customButton.addEventListener('click', function() {
            const input = document.getElementById('custom-amount');
            const amount = parseInt(input.value) || CONFIG.minTickets;
            handlePurchase(amount);
        });
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
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar contador de tiempo
    const countdown = new CountdownTimer(CONFIG.deadline);
    
    // Inicializar contador de tickets
    const ticketsCounter = new TicketsCounter(CONFIG.totalTickets);
    
    // Inicializar calculadora personalizada
    const calculator = new CustomTicketCalculator();
    
    // Inicializar smooth scroll
    initSmoothScroll();
    
    // Inicializar animaciones
    initScrollAnimations();
    
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

