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
    whatsappNumber: '722539447', // Número de WhatsApp
    // Configuración de Google Sheets
    googleSheets: {
        // ID del Google Sheet
        sheetId: '11AJDOkCz9hdMGI0LHaub41qWxwOSXBx_zXaeW-Fdp5s',
        // Nombre de la hoja (pestaña) a leer. Por defecto 'Sheet1'
        sheetName: 'Sheet1',
        // Método de lectura: 'csv' (más simple, requiere sheet público), 'api' (requiere API key), 'appsscript' (requiere script desplegado)
        method: 'api', // Cambiar a 'api' para usar la API de Google Sheets
        // Opciones adicionales según el método
        options: {
            // API Key de Google Cloud Console (OBTÉN ESTA KEY - ver instrucciones abajo)
            apiKey: 'TU_API_KEY_AQUI',
            // Rango específico a leer (columna D desde fila 2 hasta 1002)
            range: 'D2:D1002'
        }
    }
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
// LECTOR DE GOOGLE SHEETS
// ============================================
class GoogleSheetsReader {
    constructor(sheetId, sheetName = 'Sheet1') {
        // Extraer el ID del sheet de la URL completa
        // URL formato: https://docs.google.com/spreadsheets/d/SHEET_ID/edit...
        this.sheetId = sheetId.includes('/d/') 
            ? sheetId.split('/d/')[1].split('/')[0] 
            : sheetId;
        this.sheetName = sheetName;
        this.cache = null;
        this.cacheTime = 0;
        this.cacheDuration = 30000; // 30 segundos de caché
    }

    /**
     * Lee los datos del Google Sheet usando Google Apps Script como endpoint público
     * Opción 1: Si tienes un Google Apps Script desplegado
     */
    async fetchFromAppsScript(scriptUrl) {
        try {
            const response = await fetch(scriptUrl, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al leer desde Google Apps Script:', error);
            throw error;
        }
    }

    /**
     * Lee los datos del Google Sheet publicándolo como CSV
     * Opción 2: Más simple, pero requiere que el sheet sea público
     */
    async fetchFromCSV() {
        try {
            const csvUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(this.sheetName)}`;
            
            const response = await fetch(csvUrl, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.error('Error al leer CSV de Google Sheets:', error);
            throw error;
        }
    }

    /**
     * Lee los datos usando la API de Google Sheets (requiere API key pública)
     * Opción 3: Usando la API pública de Google Sheets
     * @param {string} apiKey - API Key de Google Cloud Console
     * @param {string} range - Rango específico a leer (ej: 'D2:D1002')
     */
    async fetchFromAPI(apiKey, range = null) {
        try {
            // Si se especifica un rango, leer solo ese rango
            // Si no, leer toda la hoja
            const rangeParam = range ? `!${range}` : '';
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${encodeURIComponent(this.sheetName)}${rangeParam}?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            return this.parseAPIResponse(data);
        } catch (error) {
            console.error('Error al leer desde Google Sheets API:', error);
            throw error;
        }
    }

    /**
     * Método principal: Intenta leer usando el método más adecuado
     * @param {string} method - Método a usar: 'csv', 'api', o 'appsscript'
     * @param {object} options - Opciones según el método
     * @param {string} options.apiKey - API Key (para método 'api')
     * @param {string} options.scriptUrl - URL del script (para método 'appsscript')
     * @param {string} options.range - Rango específico a leer (ej: 'D2:D1002')
     */
    async fetchData(method = 'csv', options = {}) {
        // Verificar caché
        const now = Date.now();
        if (this.cache && (now - this.cacheTime) < this.cacheDuration) {
            return this.cache;
        }

        let data;
        try {
            switch (method) {
                case 'appsscript':
                    if (!options.scriptUrl) {
                        throw new Error('Se requiere scriptUrl para el método appsscript');
                    }
                    data = await this.fetchFromAppsScript(options.scriptUrl);
                    break;
                case 'api':
                    if (!options.apiKey) {
                        throw new Error('Se requiere apiKey para el método api');
                    }
                    data = await this.fetchFromAPI(options.apiKey, options.range || null);
                    break;
                case 'csv':
                default:
                    data = await this.fetchFromCSV();
                    break;
            }

            // Actualizar caché
            this.cache = data;
            this.cacheTime = now;
            
            return data;
        } catch (error) {
            console.error('Error al obtener datos de Google Sheets:', error);
            // Si hay caché, devolverlo aunque esté desactualizado
            if (this.cache) {
                console.warn('Usando datos en caché debido a error');
                return this.cache;
            }
            throw error;
        }
    }

    /**
     * Parsea CSV a objeto JavaScript
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) return { rows: [] };

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            rows.push(row);
        }

        return { headers, rows };
    }

    /**
     * Parsea una línea CSV considerando comillas
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        return values;
    }

    /**
     * Parsea respuesta de la API de Google Sheets
     * Si se lee un rango específico (como D2:D1002), crea una estructura compatible
     */
    parseAPIResponse(data) {
        if (!data.values || data.values.length === 0) {
            return { headers: ['Estado'], rows: [] };
        }

        // Si solo hay una columna (rango D2:D1002), crear estructura con header 'Estado'
        if (data.values[0].length === 1) {
            const rows = [];
            for (let i = 0; i < data.values.length; i++) {
                rows.push({ 'Estado': data.values[i][0] || '' });
            }
            return { headers: ['Estado'], rows };
        }

        // Si hay múltiples columnas, usar la primera fila como headers
        const headers = data.values[0];
        const rows = [];

        for (let i = 1; i < data.values.length; i++) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = data.values[i][index] || '';
            });
            rows.push(row);
        }

        return { headers, rows };
    }

    /**
     * Cuenta tickets vendidos (asume que hay una columna de estado)
     */
    countSoldTickets(data, statusColumn = 'Estado', soldValue = 'vendido') {
        if (!data.rows) return 0;
        
        return data.rows.filter(row => {
            const status = (row[statusColumn] || '').toLowerCase().trim();
            return status === soldValue.toLowerCase() || status === 'reservado';
        }).length;
    }

    /**
     * Cuenta tickets disponibles
     */
    countAvailableTickets(data, statusColumn = 'Estado', availableValue = 'disponible') {
        if (!data.rows) return 0;
        
        return data.rows.filter(row => {
            const status = (row[statusColumn] || '').toLowerCase().trim();
            return status === availableValue.toLowerCase();
        }).length;
    }
}

// ============================================
// CONTADOR DE TICKETS
// ============================================
class TicketsCounter {
    constructor(totalTickets, googleSheetsConfig = null) {
        this.totalTickets = totalTickets;
        this.soldTickets = 0;
        this.currentDisplay = 0;
        this.elements = {
            remaining: document.getElementById('tickets-remaining'),
            progress: document.getElementById('tickets-progress')
        };
        this.animationFrame = null;
        this.googleSheets = googleSheetsConfig ? new GoogleSheetsReader(
            googleSheetsConfig.sheetId,
            googleSheetsConfig.sheetName || 'Sheet1'
        ) : null;
        this.updateInterval = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        // Iniciar en 0
        this.currentDisplay = 0;
        this.soldTickets = 0;
        
        // Si hay configuración de Google Sheets, cargar datos reales
        if (this.googleSheets) {
            await this.loadFromGoogleSheets();
            // Actualizar cada 30 segundos
            this.updateInterval = setInterval(() => {
                this.loadFromGoogleSheets();
            }, 30000);
        } else {
            // Fallback: usar valor simulado (solo para desarrollo)
            console.warn('⚠️ No hay configuración de Google Sheets. Usando valores simulados.');
            const targetSold = Math.floor(Math.random() * 200);
            this.animateToValue(targetSold);
        }
    }

    async loadFromGoogleSheets() {
        if (!this.googleSheets || this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            // Obtener método y opciones de la configuración
            const method = CONFIG.googleSheets?.method || 'csv';
            const options = CONFIG.googleSheets?.options || {};
            
            // Leer datos según el método configurado
            const data = await this.googleSheets.fetchData(method, options);
            
            // Intentar detectar la columna de estado automáticamente
            // Buscar columnas comunes: 'Estado', 'Status', 'estado', 'status', etc.
            const statusColumns = ['Estado', 'Status', 'estado', 'status', 'ESTADO', 'STATUS', 'Estado del Ticket'];
            let statusColumn = null;
            
            if (data.headers) {
                statusColumn = data.headers.find(h => statusColumns.includes(h));
            }

            let totalSold = 0;
            let totalAvailable = 0;

            if (statusColumn) {
                // Contar tickets vendidos y reservados
                const sold = this.googleSheets.countSoldTickets(data, statusColumn, 'vendido');
                const reserved = this.googleSheets.countSoldTickets(data, statusColumn, 'reservado');
                totalSold = sold + reserved;
                totalAvailable = this.googleSheets.countAvailableTickets(data, statusColumn, 'disponible');
                
                console.log(`📊 Tickets vendidos: ${sold}, Reservados: ${reserved}, Disponibles: ${totalAvailable}, Total vendidos/reservados: ${totalSold}`);
            } else if (data.headers && data.headers.length > 0 && data.headers[0] === 'Estado') {
                // Si la columna se llama 'Estado' (caso del rango D2:D1002)
                statusColumn = 'Estado';
                const sold = this.googleSheets.countSoldTickets(data, statusColumn, 'vendido');
                const reserved = this.googleSheets.countSoldTickets(data, statusColumn, 'reservado');
                totalSold = sold + reserved;
                totalAvailable = this.googleSheets.countAvailableTickets(data, statusColumn, 'disponible');
                
                console.log(`📊 Columna D detectada - Vendidos: ${sold}, Reservados: ${reserved}, Disponibles: ${totalAvailable}, Total vendidos/reservados: ${totalSold}`);
            } else {
                // Si no hay columna de estado, contar todas las filas con datos
                // Esto asume que cada fila (excepto el header) representa un ticket vendido
                const totalRows = data.rows ? data.rows.filter(row => {
                    // Filtrar filas vacías
                    return Object.values(row).some(value => value && value.toString().trim() !== '');
                }).length : 0;
                
                totalSold = totalRows;
                console.log(`📊 Total de filas con datos: ${totalSold}`);
            }

            // Actualizar contador con animación
            this.animateToValue(totalSold);
            this.hideLoadingState();
        } catch (error) {
            console.error('❌ Error al cargar tickets desde Google Sheets:', error);
            this.hideLoadingState();
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    showLoadingState() {
        if (this.elements.remaining) {
            this.elements.remaining.textContent = '...';
        }
    }

    hideLoadingState() {
        // El estado de carga se oculta cuando se actualiza el valor
    }

    showErrorState() {
        // Mantener el último valor conocido en caso de error
        console.warn('⚠️ No se pudo actualizar el contador. Mostrando último valor conocido.');
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
// CARRUSEL DE IMÁGENES
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
        // Esperar a que el DOM esté listo
        setTimeout(() => {
            this.images = Array.from(document.querySelectorAll('.moto-carousel-img'));
            this.dots = Array.from(document.querySelectorAll('.carousel-dot'));
            this.prevBtn = document.getElementById('carousel-prev');
            this.nextBtn = document.getElementById('carousel-next');

            console.log('🔍 Inicializando carrusel principal...');
            console.log('📸 Imágenes encontradas:', this.images.length);
            console.log('🔘 Dots encontrados:', this.dots.length);
            console.log('⬅️ Botón prev:', this.prevBtn ? '✅' : '❌');
            console.log('➡️ Botón next:', this.nextBtn ? '✅' : '❌');

            if (this.images.length === 0) {
                console.error('❌ ERROR: No se encontraron imágenes del carrusel');
                console.log('Buscando elementos con clase .moto-carousel-img...');
                return;
            }

            // Event listeners para botones
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.prev();
                });
            } else {
                console.warn('Botón anterior no encontrado');
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.next();
                });
            } else {
                console.warn('Botón siguiente no encontrado');
            }

            // Event listeners para dots
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.goTo(index);
                });
            });

            // Mostrar primera imagen
            this.showImage(0);

            // Auto-play cada 5 segundos
            this.startAutoPlay();

            // Pausar auto-play al hacer hover
            const carousel = document.getElementById('moto-carousel');
            if (carousel) {
                carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
                carousel.addEventListener('mouseleave', () => this.startAutoPlay());
            }

            console.log('✅ ===== CARRUSEL PRINCIPAL INICIALIZADO =====');
            console.log(`📸 Total de imágenes: ${this.images.length}`);
            console.log(`🔘 Total de dots: ${this.dots.length}`);
        }, 100);
    }

    showImage(index) {
        if (this.images.length === 0) {
            console.warn('⚠️ No hay imágenes para mostrar');
            return;
        }

        // Asegurar que el índice sea válido
        if (index < 0) index = this.images.length - 1;
        if (index >= this.images.length) index = 0;

        console.log(`🖼️ Cambiando a imagen ${index + 1} de ${this.images.length}`);

        // Cambiar todas las imágenes usando estilos inline (como el carrusel de prueba)
        this.images.forEach((img, i) => {
            if (i === index) {
                // Imagen activa - VISIBLE
                img.style.opacity = '1';
                img.style.zIndex = '10';
                img.style.visibility = 'visible';
                img.style.display = 'block';
                console.log(`✅ Imagen ${i + 1} ACTIVA`);
            } else {
                // Imágenes inactivas - OCULTAS
                img.style.opacity = '0';
                img.style.zIndex = '1';
                img.style.visibility = 'hidden';
                img.style.display = 'block';
            }
        });

        // Actualizar dots
        this.dots.forEach((dot, i) => {
            if (i === index) {
                dot.style.background = 'white';
                dot.style.width = '12px';
                dot.style.height = '12px';
            } else {
                dot.style.background = 'rgba(255, 255, 255, 0.5)';
                dot.style.width = '8px';
                dot.style.height = '8px';
            }
        });

        this.currentIndex = index;
        console.log(`✅ Imagen ${index + 1} mostrada correctamente`);
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
    
    // Inicializar contador de tickets con configuración de Google Sheets
    const ticketsCounter = new TicketsCounter(
        CONFIG.totalTickets,
        CONFIG.googleSheets ? {
            sheetId: CONFIG.googleSheets.sheetId,
            sheetName: CONFIG.googleSheets.sheetName || 'Sheet1'
        } : null
    );
    
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
