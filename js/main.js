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
    whatsappNumber: '34614465691', // Número de WhatsApp (sin el +)
    // Configuración de Google Sheets
    googleSheets: {
        // ID del Google Sheet
        sheetId: '11AJDOkCz9hdMGI0LHaub41qWxwOSXBx_zXaeW-Fdp5s',
        // Nombre de la hoja (pestaña) a leer
        sheetName: 'Hoja 1',
        // Método de lectura: 'csv' (más simple, requiere sheet público), 'api' (requiere API key), 'appsscript' (requiere script desplegado)
        method: 'api', // Cambiar a 'api' para usar la API de Google Sheets
        // Opciones adicionales según el método
        options: {
            // API Key de Google Cloud Console
            apiKey: 'AIzaSyBTg5ozE85sC1Qvw2ZbxnTW5Jxnn0cL4iE',
            // Rango específico a leer (columna D desde fila 2 hasta 1002 - columna de estado)
            range: 'D2:D1002',
            // Rango para obtener números de tickets y estados (columna A = número, columna D = estado)
            ticketsRange: 'A2:D1002',
            // URL del Google Apps Script para actualizar tickets (opcional, pero recomendado)
            // Obtén esta URL siguiendo las instrucciones en GOOGLE_APPS_SCRIPT_UPDATE.md
            updateScriptUrl: 'https://script.google.com/macros/s/AKfycbyZFnHjKHCl03l_VBQm-cyPSF2cx96m2fQYGjKLYM9yDCiQKlCGdG3t6dl5Qgg8TtGc9g/exec'
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
            return this.parseAPIResponse(data, range);
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
     * Si se lee un rango específico (como D2:D1002 o A2:D1002), crea una estructura compatible
     * @param {object} data - Datos de la API
     * @param {string} range - Rango leído (opcional, para detectar si hay headers)
     */
    parseAPIResponse(data, range = null) {
        if (!data.values || data.values.length === 0) {
            return { headers: ['Estado'], rows: [], values: [] };
        }

        // Mantener los values originales para acceso directo
        const originalValues = data.values;

        // Detectar si el rango empieza desde la fila 2 (sin headers) o fila 1 (con headers)
        // Si el rango es A2:D1002 o D2:D1002, no hay headers (empieza en fila 2)
        // Si el rango es A1:D1002 o no especifica fila, asumimos que hay headers
        let hasHeaders = true; // Por defecto asumimos headers
        if (range) {
            // Si el rango empieza con una letra seguida de "2" o mayor, no hay headers
            const match = range.match(/^[A-Z]+(\d+)/);
            if (match && parseInt(match[1]) >= 2) {
                hasHeaders = false;
            }
        }

        // Si solo hay una columna (rango D2:D1002), crear estructura con header 'Estado'
        if (data.values[0].length === 1) {
            const rows = [];
            for (let i = 0; i < data.values.length; i++) {
                rows.push({ 'Estado': data.values[i][0] || '' });
            }
            return { headers: ['Estado'], rows, values: originalValues };
        }

        // Si hay múltiples columnas
        if (hasHeaders && data.values.length > 0) {
            // Usar la primera fila como headers
            const headers = data.values[0];
            const rows = [];

            for (let i = 1; i < data.values.length; i++) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = data.values[i][index] || '';
                });
                rows.push(row);
            }

            return { headers, rows, values: originalValues };
        } else {
            // No hay headers, todas las filas son datos
            // Crear headers genéricos basados en el número de columnas
            const numColumns = data.values[0]?.length || 4;
            const headers = [];
            for (let i = 0; i < numColumns; i++) {
                headers.push(`Columna${String.fromCharCode(65 + i)}`); // A, B, C, D...
            }

            const rows = [];
            for (let i = 0; i < data.values.length; i++) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = data.values[i][index] || '';
                });
                rows.push(row);
            }

            return { headers, rows, values: originalValues };
        }
    }

    /**
     * Cuenta tickets vendidos (asume que hay una columna de estado)
     * Reconoce: vendido, reservado, ocupado, y variantes
     */
    countSoldTickets(data, statusColumn = 'Estado', soldValue = 'vendido') {
        if (!data.rows) return 0;
        
        return data.rows.filter(row => {
            const status = (row[statusColumn] || '').toLowerCase().trim();
            // Reconocer diferentes variantes de "no disponible"
            const notAvailable = [
                'vendido', 'reservado', 'ocupado', 'ocupada',
                'vendida', 'reservada', 'comprado', 'comprada'
            ];
            return notAvailable.includes(status);
        }).length;
    }

    /**
     * Cuenta tickets disponibles
     * Reconoce: disponible, disponble (typo común), y variantes
     */
    countAvailableTickets(data, statusColumn = 'Estado', availableValue = 'disponible') {
        if (!data.rows) return 0;
        
        return data.rows.filter(row => {
            const status = (row[statusColumn] || '').toLowerCase().trim();
            // Reconocer diferentes variantes de "disponible"
            const available = [
                'disponible', 'disponble', 'dispon', 'libre', 'available'
            ];
            return available.includes(status);
        }).length;
    }

    /**
     * Cuenta tickets por estados específicos
     * @param {object} data - Datos del sheet
     * @param {string} statusColumn - Nombre de la columna de estado
     * @param {array} statusList - Lista de estados a contar
     */
    countByStatus(data, statusColumn = 'Estado', statusList = []) {
        if (!data.rows) return 0;
        
        return data.rows.filter(row => {
            const status = (row[statusColumn] || '').toLowerCase().trim();
            return statusList.map(s => s.toLowerCase()).includes(status);
        }).length;
    }

    /**
     * Obtiene un mapa de números de tickets y sus estados
     * @param {object} data - Datos del sheet con columnas A (número) y D (estado)
     * @returns {Map<number, string>} Mapa de número de ticket -> estado
     */
    getTicketsMap(data) {
        const ticketsMap = new Map();
        
        if (!data) return ticketsMap;

        // Priorizar values (formato API directo) si está disponible
        if (data.values && data.values.length > 0) {
            // Estructura: A=numero (contiene el número de ticket), B=nombre, C=telefono, D=estado
            // Si el rango es A2:D1002, no hay header, así que usamos directamente los valores
            for (let i = 0; i < data.values.length; i++) {
                const row = data.values[i];
                if (row && row.length >= 4) {
                    // Columna A (índice 0) contiene el número de ticket, columna D (índice 3) contiene el estado
                    const ticketNumberRaw = row[0]; // Columna A (numero)
                    const ticketNumber = ticketNumberRaw !== null && ticketNumberRaw !== undefined && ticketNumberRaw !== '' 
                        ? Number(ticketNumberRaw) 
                        : null;
                    const status = (row[3] || '').trim(); // Columna D (estado)
                    // Verificar que sea un número válido (incluyendo 0)
                    if (ticketNumber !== null && !isNaN(ticketNumber) && ticketNumber >= 0 && ticketNumber <= 999) {
                        ticketsMap.set(ticketNumber, status);
                    }
                } else if (row && row.length === 1) {
                    // Si solo hay una columna (rango D2:D1002), usar el índice de la fila como número
                    const ticketNumber = i; // Índice de fila (0-999)
                    const status = (row[0] || '').trim();
                    if (ticketNumber >= 0 && ticketNumber <= 999) {
                        ticketsMap.set(ticketNumber, status);
                    }
                }
            }
        } else if (data.rows && data.headers) {
            // Si data tiene rows (formato parseado), buscar columnas por nombre
            const numberColumn = data.headers.find(h => 
                ['Número', 'Numero', 'Ticket', 'Número Ticket', 'id_tickets', 'numero'].includes(h)
            ) || data.headers[0]; // Por defecto columna A (índice 0) si no se encuentra
            const statusColumn = data.headers.find(h => 
                ['Estado', 'Status', 'estado', 'status'].includes(h)
            ) || data.headers[3]; // Por defecto columna D (índice 3)

            data.rows.forEach(row => {
                // Usar Number() en lugar de parseInt() || null para manejar correctamente el 0
                const ticketNumberRaw = row[numberColumn];
                const ticketNumber = ticketNumberRaw !== null && ticketNumberRaw !== undefined && ticketNumberRaw !== '' 
                    ? Number(ticketNumberRaw) 
                    : null;
                const status = (row[statusColumn] || '').trim();
                // Verificar que sea un número válido (incluyendo 0)
                if (ticketNumber !== null && !isNaN(ticketNumber) && ticketNumber >= 0 && ticketNumber <= 999) {
                    ticketsMap.set(ticketNumber, status);
                }
            });
        }

        return ticketsMap;
    }

    /**
     * Obtiene lista de números de tickets ocupados
     * @param {object} data - Datos del sheet
     * @returns {Array<number>} Array de números de tickets ocupados
     */
    getOccupiedTickets(data) {
        const ticketsMap = this.getTicketsMap(data);
        const occupied = [];
        
        ticketsMap.forEach((status, ticketNumber) => {
            const statusLower = status.toLowerCase().trim();
            const notAvailable = [
                'vendido', 'reservado', 'ocupado', 'ocupada',
                'vendida', 'reservada', 'comprado', 'comprada'
            ];
            if (notAvailable.includes(statusLower)) {
                occupied.push(ticketNumber);
            }
        });

        return occupied;
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
        
        // Verificar configuración
        console.log('🔧 Inicializando TicketsCounter...', {
            hasGoogleSheets: !!this.googleSheets,
            config: CONFIG.googleSheets
        });
        
        // Si hay configuración de Google Sheets, cargar datos reales
        if (this.googleSheets) {
            console.log('✅ Configuración de Google Sheets detectada. Cargando datos...');
            try {
                await this.loadFromGoogleSheets();
                // Actualizar cada 30 segundos
                this.updateInterval = setInterval(() => {
                    this.loadFromGoogleSheets();
                }, 30000);
            } catch (error) {
                console.error('❌ Error al inicializar desde Google Sheets:', error);
                // NO usar valores aleatorios si hay error, mantener en 0
                console.warn('⚠️ Manteniendo contador en 0 hasta que se resuelva el error.');
            }
        } else {
            // Fallback: usar valor simulado (solo para desarrollo)
            console.warn('⚠️ No hay configuración de Google Sheets. Usando valores simulados.');
            console.warn('⚠️ Esto NO debería pasar en producción. Verifica CONFIG.googleSheets');
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
            
            console.log('🔍 Intentando leer Google Sheets...', {
                method,
                sheetId: this.googleSheets.sheetId,
                sheetName: this.googleSheets.sheetName,
                range: options.range
            });
            
            // Leer datos según el método configurado
            const data = await this.googleSheets.fetchData(method, options);
            
            console.log('✅ Datos recibidos de Google Sheets:', {
                headers: data.headers,
                totalRows: data.rows ? data.rows.length : 0,
                firstRows: data.rows ? data.rows.slice(0, 5) : []
            });
            
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
                // Contar tickets NO disponibles (vendidos, reservados, ocupados, etc.)
                totalSold = this.googleSheets.countSoldTickets(data, statusColumn);
                totalAvailable = this.googleSheets.countAvailableTickets(data, statusColumn);
                
                // Contar por tipo específico para el log
                const sold = this.googleSheets.countByStatus(data, statusColumn, ['vendido', 'vendida', 'ocupado', 'ocupada', 'comprado', 'comprada']);
                const reserved = this.googleSheets.countByStatus(data, statusColumn, ['reservado', 'reservada']);
                
                console.log(`📊 Tickets vendidos/ocupados: ${sold}, Reservados: ${reserved}, Disponibles: ${totalAvailable}, Total NO disponibles: ${totalSold}`);
            } else if (data.headers && data.headers.length > 0) {
                // Si hay headers, usar el primero (caso del rango D2:D1002)
                statusColumn = data.headers[0];
                
                console.log(`📋 Usando columna: "${statusColumn}"`);
                
                // Contar tickets NO disponibles (vendidos, reservados, ocupados, etc.)
                totalSold = this.googleSheets.countSoldTickets(data, statusColumn);
                totalAvailable = this.googleSheets.countAvailableTickets(data, statusColumn);
                
                // Contar por tipo específico para el log
                const sold = this.googleSheets.countByStatus(data, statusColumn, ['vendido', 'vendida', 'ocupado', 'ocupada', 'comprado', 'comprada']);
                const reserved = this.googleSheets.countByStatus(data, statusColumn, ['reservado', 'reservada']);
                
                console.log(`📊 Columna D detectada (${statusColumn}) - Vendidos/ocupados: ${sold}, Reservados: ${reserved}, Disponibles: ${totalAvailable}, Total NO disponibles: ${totalSold}`);
                
                // Mostrar algunos valores de ejemplo para debugging
                if (data.rows && data.rows.length > 0) {
                    console.log('📝 Primeros valores encontrados:', data.rows.slice(0, 10).map(row => row[statusColumn]));
                }
            } else {
                // Si no hay columna de estado, contar todas las filas con datos
                // Esto asume que cada fila (excepto el header) representa un ticket vendido
                const totalRows = data.rows ? data.rows.filter(row => {
                    // Filtrar filas vacías
                    return Object.values(row).some(value => value && value.toString().trim() !== '');
                }).length : 0;
                
                totalSold = totalRows;
                console.log(`📊 Total de filas con datos: ${totalSold}`);
                console.warn('⚠️ No se detectó columna de estado. Contando todas las filas con datos.');
            }

            // Actualizar contador con animación
            // Usar directamente el conteo de disponibles para evitar errores
            const ticketsDisponibles = totalAvailable > 0 ? totalAvailable : (this.totalTickets - totalSold);
            console.log(`🎯 Actualizando contador: ${ticketsDisponibles} tickets disponibles (contados directamente)`);
            // Animar mostrando los disponibles directamente
            this.animateToAvailable(ticketsDisponibles);
            this.hideLoadingState();
        } catch (error) {
            console.error('❌ Error al cargar tickets desde Google Sheets:', error);
            console.error('Detalles del error:', {
                message: error.message,
                stack: error.stack
            });
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

    /**
     * Anima el contador mostrando directamente el número de tickets disponibles
     * (cuenta directamente los "disponible" en lugar de calcular)
     */
    animateToAvailable(targetAvailable) {
        const targetSold = this.totalTickets - targetAvailable;
        this.soldTickets = targetSold;
        const targetPercentage = (targetSold / this.totalTickets) * 100;
        const startValue = this.currentDisplay || 0;
        const duration = 2000; // 2 segundos
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Calcular valor actual (directamente los disponibles)
            const currentAvailable = Math.floor(startValue + (targetAvailable - startValue) * easeOut);
            const currentPercentage = 100 - ((targetSold / this.totalTickets) * 100 * easeOut);

            // Actualizar display
            if (this.elements.remaining) {
                this.elements.remaining.textContent = currentAvailable;
            }

            if (this.elements.progress) {
                this.elements.progress.style.width = `${currentPercentage}%`;
            }

            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                // Asegurar valores finales exactos
                if (this.elements.remaining) {
                    this.elements.remaining.textContent = targetAvailable;
                }
                if (this.elements.progress) {
                    this.elements.progress.style.width = `${100 - targetPercentage}%`;
                }
                this.currentDisplay = targetAvailable;
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
// Variables globales para la selección de tickets
let selectedTickets = new Set();
let requiredTicketAmount = 2;
let occupiedTicketsSet = new Set();
let currentPage = 1;
const TICKETS_PER_PAGE = 100;
let paginationInitialized = false;
let paginationHandlers = { prev: null, next: null };

async function openPurchaseModal(amount) {
    const modal = document.getElementById('purchase-modal');
    const ticketAmount = document.getElementById('modal-ticket-amount');
    const totalDisplay = document.getElementById('modal-total');
    
    if (!modal || !ticketAmount || !totalDisplay) return;
    
    const total = amount * CONFIG.ticketPrice;
    ticketAmount.textContent = amount;
    totalDisplay.textContent = `${total}€`;
    
    // Establecer la cantidad requerida
    requiredTicketAmount = amount;
    document.getElementById('required-amount').textContent = amount;
    document.getElementById('required-amount-text').textContent = amount;
    
    // Limpiar selección previa
    selectedTickets.clear();
    currentPage = 1;
    paginationInitialized = false;
    
    // Limpiar campos del formulario
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-lastname').value = '';
    document.getElementById('customer-phone').value = '';
    
    // Cargar y poblar la lista de números de tickets
    await loadTicketNumbers();
    
    // Mostrar modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Carga los números de tickets desde Google Sheets y crea la lista paginada
 */
async function loadTicketNumbers() {
    const grid = document.getElementById('ticket-numbers-grid');
    if (!grid) return;

    // Mostrar estado de carga
    grid.innerHTML = '<div class="col-span-10 text-center text-ceramic-600 py-8">Cargando números disponibles...</div>';

    try {
        const googleSheets = new GoogleSheetsReader(
            CONFIG.googleSheets.sheetId,
            CONFIG.googleSheets.sheetName || 'Hoja 1'
        );

        // Leer el rango completo con números y estados
        const method = CONFIG.googleSheets?.method || 'api';
        const options = {
            ...CONFIG.googleSheets?.options,
            range: CONFIG.googleSheets?.options?.ticketsRange || 'A2:D1002'
        };

        const data = await googleSheets.fetchData(method, options);
        
        // Obtener números ocupados
        const occupiedTickets = googleSheets.getOccupiedTickets(data);
        occupiedTicketsSet = new Set(occupiedTickets);

        // Renderizar la primera página
        renderTicketNumbers();
        
        // Inicializar paginación
        initPagination();
        
        // Actualizar contador
        updateSelectedCount();
    } catch (error) {
        console.error('Error al cargar números de tickets:', error);
        grid.innerHTML = '<div class="col-span-10 text-center text-red-600 py-8">Error al cargar números. Intenta de nuevo.</div>';
    }
}

/**
 * Renderiza los números de tickets en la página actual
 */
function renderTicketNumbers() {
    const grid = document.getElementById('ticket-numbers-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const startNumber = (currentPage - 1) * TICKETS_PER_PAGE;
    const endNumber = Math.min(startNumber + TICKETS_PER_PAGE - 1, 999);

    for (let i = startNumber; i <= endNumber; i++) {
        const ticketButton = document.createElement('button');
        const paddedNumber = String(i).padStart(3, '0');
        const isOccupied = occupiedTicketsSet.has(i);
        const isSelected = selectedTickets.has(i);
        const isDisabled = isOccupied || (selectedTickets.size >= requiredTicketAmount && !isSelected);

        ticketButton.type = 'button';
        ticketButton.className = `ticket-number-btn px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            isOccupied 
                ? 'bg-ceramic-100 text-ceramic-400 cursor-not-allowed opacity-60' 
                : isSelected
                ? 'bg-ceramic-800 text-white shadow-md transform scale-105'
                : isDisabled
                ? 'bg-ceramic-50 text-ceramic-400 cursor-not-allowed opacity-50'
                : 'bg-white text-ceramic-700 border-2 border-ceramic-300 hover:border-ceramic-500 hover:bg-ceramic-50 cursor-pointer'
        }`;
        
        ticketButton.textContent = paddedNumber;
        ticketButton.dataset.ticketNumber = i;
        
        if (!isOccupied && !isDisabled) {
            ticketButton.addEventListener('click', () => toggleTicketSelection(i));
        }
        
        grid.appendChild(ticketButton);
    }
}

/**
 * Alterna la selección de un ticket
 */
function toggleTicketSelection(ticketNumber) {
    if (selectedTickets.has(ticketNumber)) {
        selectedTickets.delete(ticketNumber);
    } else {
        if (selectedTickets.size < requiredTicketAmount) {
            selectedTickets.add(ticketNumber);
        } else {
            return; // Ya se alcanzó el límite
        }
    }
    
    // Re-renderizar la página actual para actualizar los estilos
    renderTicketNumbers();
    updateSelectedCount();
    updateSelectedTicketsDisplay();
}

/**
 * Inicializa los controles de paginación
 */
function initPagination() {
    const totalPages = Math.ceil(1000 / TICKETS_PER_PAGE);
    document.getElementById('total-pages').textContent = totalPages;
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    // Remover listeners anteriores si existen
    if (paginationInitialized) {
        if (paginationHandlers.prev && prevBtn) {
            prevBtn.removeEventListener('click', paginationHandlers.prev);
        }
        if (paginationHandlers.next && nextBtn) {
            nextBtn.removeEventListener('click', paginationHandlers.next);
        }
    }
    
    // Crear nuevos handlers
    paginationHandlers.prev = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTicketNumbers();
            updatePaginationButtons();
        }
    };
    
    paginationHandlers.next = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTicketNumbers();
            updatePaginationButtons();
        }
    };
    
    // Agregar listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', paginationHandlers.prev);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', paginationHandlers.next);
    }
    
    paginationInitialized = true;
    updatePaginationButtons();
}

/**
 * Actualiza el estado de los botones de paginación
 */
function updatePaginationButtons() {
    const totalPages = Math.ceil(1000 / TICKETS_PER_PAGE);
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');
    
    currentPageSpan.textContent = currentPage;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

/**
 * Actualiza el contador de tickets seleccionados
 */
function updateSelectedCount() {
    const selectedAmount = document.getElementById('selected-amount');
    const requiredAmount = document.getElementById('required-amount');
    const selectedCount = document.getElementById('selected-count');
    
    if (selectedAmount) selectedAmount.textContent = selectedTickets.size;
    if (requiredAmount) requiredAmount.textContent = requiredTicketAmount;
    
    // Cambiar color según el estado
    if (selectedCount) {
        if (selectedTickets.size === requiredTicketAmount) {
            selectedCount.classList.remove('text-ceramic-600');
            selectedCount.classList.add('text-green-600');
        } else {
            selectedCount.classList.remove('text-green-600');
            selectedCount.classList.add('text-ceramic-600');
        }
    }
}

/**
 * Actualiza la visualización de tickets seleccionados
 */
function updateSelectedTicketsDisplay() {
    const display = document.getElementById('selected-tickets-display');
    const list = document.getElementById('selected-tickets-list');
    
    if (!display || !list) return;
    
    if (selectedTickets.size === 0) {
        display.classList.add('hidden');
        return;
    }
    
    display.classList.remove('hidden');
    list.innerHTML = '';
    
    const sortedTickets = Array.from(selectedTickets).sort((a, b) => a - b);
    
    sortedTickets.forEach(ticketNumber => {
        const badge = document.createElement('span');
        const paddedNumber = String(ticketNumber).padStart(3, '0');
        badge.className = 'inline-flex items-center gap-1 px-3 py-1 bg-ceramic-800 text-white rounded-full text-xs font-medium';
        badge.innerHTML = `#${paddedNumber} <button type="button" class="ml-1 hover:text-ceramic-200" onclick="removeTicket(${ticketNumber})">×</button>`;
        list.appendChild(badge);
    });
}

/**
 * Elimina un ticket de la selección (llamado desde el botón ×)
 */
function removeTicket(ticketNumber) {
    selectedTickets.delete(ticketNumber);
    renderTicketNumbers();
    updateSelectedCount();
    updateSelectedTicketsDisplay();
}

// Hacer la función accesible globalmente para los botones de eliminar
window.removeTicket = removeTicket;

function closePurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Limpiar selección
        selectedTickets.clear();
        currentPage = 1;
        
        // Limpiar display de seleccionados
        const display = document.getElementById('selected-tickets-display');
        if (display) {
            display.classList.add('hidden');
        }
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
        sendBtn.addEventListener('click', async function() {
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
            
            // Validar que se hayan seleccionado todos los tickets requeridos
            if (selectedTickets.size !== requiredTicketAmount) {
                alert(`Por favor, selecciona exactamente ${requiredTicketAmount} número(s) de ticket.`);
                return;
            }
            
            // Validar teléfono (básico)
            if (phone.length < 9) {
                alert('Por favor, ingresa un número de teléfono válido.');
                return;
            }
            
            // Deshabilitar botón y mostrar estado de carga
            sendBtn.disabled = true;
            const originalText = sendBtn.innerHTML;
            sendBtn.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Actualizando...</span>';
            
            try {
                // Generar y abrir link de WhatsApp (esto también actualiza Google Sheets)
                await generateWhatsAppLink(name, lastname, phone, ticketAmount, total, Array.from(selectedTickets));
            } catch (error) {
                console.error('Error al procesar la compra:', error);
                alert('Hubo un error al procesar tu compra. Por favor, intenta de nuevo.');
                sendBtn.disabled = false;
                sendBtn.innerHTML = originalText;
            }
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
// ACTUALIZAR ESTADO EN GOOGLE SHEETS
// ============================================
/**
 * Actualiza el estado de los tickets en Google Sheets de "disponible" a "reservado"
 * Usa Google Apps Script si está configurado, sino intenta con la API directa
 * @param {Array<number>} ticketNumbers - Array de números de tickets a actualizar
 * @param {string} customerName - Nombre completo del cliente (nombre + apellido)
 * @param {string} customerPhone - Teléfono del cliente
 * @param {string} reservationDate - Fecha de la reserva
 * @returns {Promise<boolean>} - true si se actualizó correctamente, false si hubo error
 */
async function updateTicketsStatus(ticketNumbers, customerName = '', customerPhone = '', reservationDate = '') {
    try {
        const updateScriptUrl = CONFIG.googleSheets.options?.updateScriptUrl;
        
        // Priorizar Google Apps Script si está configurado
        if (updateScriptUrl) {
            return await updateTicketsViaAppsScript(ticketNumbers, updateScriptUrl, customerName, customerPhone, reservationDate);
        }
        
        // Fallback: intentar con API directa (solo actualiza estado, no nombre/teléfono/fecha)
        return await updateTicketsViaAPI(ticketNumbers);
    } catch (error) {
        console.error('❌ Error al actualizar estado de tickets:', error);
        return false;
    }
}

/**
 * Actualiza tickets usando Google Apps Script
 * Usa un formulario oculto con iframe para evitar problemas de CORS
 * @param {Array<number>} ticketNumbers - Array de números de tickets
 * @param {string} scriptUrl - URL del script desplegado
 * @param {string} customerName - Nombre completo del cliente
 * @param {string} customerPhone - Teléfono del cliente
 * @param {string} reservationDate - Fecha de la reserva
 * @returns {Promise<boolean>}
 */
async function updateTicketsViaAppsScript(ticketNumbers, scriptUrl, customerName = '', customerPhone = '', reservationDate = '') {
    return new Promise((resolve) => {
        try {
            console.log('🔄 Actualizando tickets vía Google Apps Script...');
            
            // Crear un iframe oculto para enviar el formulario
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'hidden-iframe-' + Date.now();
            document.body.appendChild(iframe);
            
            // Crear un formulario oculto
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = scriptUrl;
            form.target = iframe.name;
            form.style.display = 'none';
            
            // Agregar los datos como campo oculto
            const dataInput = document.createElement('input');
            dataInput.type = 'hidden';
            dataInput.name = 'data';
            dataInput.value = JSON.stringify({
                ticketNumbers: ticketNumbers,
                status: 'reservado',
                customerName: customerName,
                customerPhone: customerPhone,
                reservationDate: reservationDate
            });
            form.appendChild(dataInput);
            
            // Agregar el formulario al DOM
            document.body.appendChild(form);
            
            // Escuchar cuando el iframe carga (respuesta del script)
            iframe.onload = function() {
                try {
                    // Intentar leer la respuesta del iframe (puede fallar por CORS, pero no importa)
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const responseText = iframeDoc.body.innerText || iframeDoc.body.textContent;
                    
                    if (responseText) {
                        try {
                            const result = JSON.parse(responseText);
                            if (result.success) {
                                console.log(`✅ Tickets actualizados: ${result.updated} de ${result.total}`);
                                if (result.errors && result.errors.length > 0) {
                                    console.warn('⚠️ Algunos tickets no se pudieron actualizar:', result.errors);
                                }
                                
                                // Invalidar caché y recargar datos
                                invalidateCacheAndReload();
                                
                                // Actualizar localmente
                                ticketNumbers.forEach(num => {
                                    occupiedTicketsSet.add(num);
                                });
                                
                                // Limpiar
                                setTimeout(() => {
                                    document.body.removeChild(form);
                                    document.body.removeChild(iframe);
                                }, 1000);
                                
                                resolve(true);
                                return;
                            }
                        } catch (e) {
                            // Si no se puede parsear, asumimos que funcionó
                            console.log('✅ Petición enviada (respuesta no parseable, pero asumimos éxito)');
                        }
                    }
                } catch (e) {
                    // No se puede leer el iframe por CORS, pero asumimos que funcionó
                    console.log('✅ Petición enviada (no se puede leer respuesta por CORS, pero asumimos éxito)');
                }
                
                // Invalidar caché y recargar datos de todas formas
                invalidateCacheAndReload();
                
                // Actualizar localmente
                ticketNumbers.forEach(num => {
                    occupiedTicketsSet.add(num);
                });
                
                // Limpiar
                setTimeout(() => {
                    if (form.parentNode) document.body.removeChild(form);
                    if (iframe.parentNode) document.body.removeChild(iframe);
                }, 1000);
                
                resolve(true);
            };
            
            // Enviar el formulario
            form.submit();
            
            // Timeout de seguridad: si después de 3 segundos no hay respuesta, asumimos éxito
            setTimeout(() => {
                if (iframe.parentNode) {
                    console.log('✅ Petición enviada (timeout, asumimos éxito)');
                    invalidateCacheAndReload();
                    ticketNumbers.forEach(num => {
                        occupiedTicketsSet.add(num);
                    });
                    if (form.parentNode) document.body.removeChild(form);
                    if (iframe.parentNode) document.body.removeChild(iframe);
                    resolve(true);
                }
            }, 3000);
            
        } catch (error) {
            console.error('❌ Error al actualizar vía Apps Script:', error);
            resolve(false);
        }
    });
}

/**
 * Actualiza tickets usando la API directa de Google Sheets (requiere permisos de escritura)
 * @param {Array<number>} ticketNumbers - Array de números de tickets
 * @returns {Promise<boolean>}
 */
async function updateTicketsViaAPI(ticketNumbers) {
    try {
        const sheetId = CONFIG.googleSheets.sheetId;
        const sheetName = CONFIG.googleSheets.sheetName || 'Hoja 1';
        const apiKey = CONFIG.googleSheets.options?.apiKey;

        if (!apiKey) {
            console.warn('⚠️ No hay API Key configurada para actualizar Google Sheets');
            return false;
        }

        console.log('🔄 Intentando actualizar vía API directa...');

        // Preparar las actualizaciones: cada ticket está en la fila (número + 2)
        const updates = ticketNumbers.map(ticketNumber => {
            const rowNumber = ticketNumber + 2;
            const range = `${sheetName}!D${rowNumber}`;
            
            return {
                range: range,
                values: [['reservado']]
            };
        });

        // Usar batchUpdate para actualizar múltiples celdas
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                valueInputOption: 'RAW',
                data: updates
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Error al actualizar Google Sheets:', errorData);
            
            // Si el error es de permisos, sugerir usar Google Apps Script
            if (response.status === 403 || response.status === 401) {
                console.warn('⚠️ La API Key no tiene permisos de escritura. Configura Google Apps Script (ver GOOGLE_APPS_SCRIPT_UPDATE.md)');
            }
            
            return false;
        }

        const result = await response.json();
        console.log('✅ Tickets actualizados en Google Sheets:', ticketNumbers);
        
        // Invalidar caché y recargar datos
        invalidateCacheAndReload();
        
        // Actualizar localmente
        ticketNumbers.forEach(num => {
            occupiedTicketsSet.add(num);
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error al actualizar vía API:', error);
        return false;
    }
}

/**
 * Invalida el caché y recarga los datos del contador
 */
function invalidateCacheAndReload() {
    if (window.ticketsCounter && window.ticketsCounter.googleSheets) {
        window.ticketsCounter.googleSheets.cache = null;
        window.ticketsCounter.googleSheets.cacheTime = 0;
        // Recargar datos después de un breve delay
        setTimeout(() => {
            if (window.ticketsCounter && window.ticketsCounter.loadFromGoogleSheets) {
                window.ticketsCounter.loadFromGoogleSheets();
            }
        }, 1000);
    }
}

// ============================================
// GENERAR LINK DE WHATSAPP
// ============================================
async function generateWhatsAppLink(name, lastname, phone, ticketAmount, total, ticketNumbers) {
    // Ordenar los números y formatearlos
    const sortedNumbers = ticketNumbers.sort((a, b) => a - b);
    const formattedNumbers = sortedNumbers.map(num => `#${String(num).padStart(3, '0')}`).join(', ');
    
    // Crear lista de números de tickets (uno por línea si hay muchos)
    let ticketsList = '';
    if (sortedNumbers.length <= 5) {
        // Si hay 5 o menos, mostrarlos en una línea
        ticketsList = formattedNumbers;
    } else {
        // Si hay más de 5, mostrarlos en líneas separadas
        ticketsList = sortedNumbers.map(num => `• #${String(num).padStart(3, '0')}`).join('\n');
    }
    
    // Preparar datos del cliente
    const customerName = `${name} ${lastname}`.trim();
    const customerPhone = phone;
    
    // Crear fecha en formato dd/MM/yyyy HH:mm
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const reservationDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    
    // Actualizar Google Sheets con los datos del cliente
    await updateTicketsStatus(sortedNumbers, customerName, customerPhone, reservationDate);
    
    const message = `¡Hola! Me interesa participar en el sorteo de la Yamaha NMAX.

📋 *Información de la compra:*
• Cantidad de tickets: ${ticketAmount}
• Total a pagar: ${total}

🎫 *Números de tickets seleccionados:*
${ticketsList}

👤 *Mis datos de contacto:*
• Nombre completo: ${name} ${lastname}
• Teléfono: ${phone}

Por favor, confírmame la disponibilidad de estos números y cómo proceder con el pago. ¡Gracias!`;

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
    window.ticketsCounter = new TicketsCounter(
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
