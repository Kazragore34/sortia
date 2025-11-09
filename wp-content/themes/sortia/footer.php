    <!-- Footer -->
    <footer class="bg-ceramic-900 text-white py-12 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                    <h3 class="text-2xl font-display font-bold mb-4">SORTIA</h3>
                    <p class="text-ceramic-300">
                        Tu plataforma de sorteos de confianza. Participa y gana premios increíbles.
                    </p>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Enlaces</h4>
                    <ul class="space-y-2 text-ceramic-300">
                        <li><a href="#premio" class="hover:text-white transition">Premio</a></li>
                        <li><a href="#como-funciona" class="hover:text-white transition">Cómo Funciona</a></li>
                        <li><a href="#comprar" class="hover:text-white transition">Comprar Tickets</a></li>
                        <li><a href="#faq" class="hover:text-white transition">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold mb-4">Contacto</h4>
                    <ul class="space-y-2 text-ceramic-300">
                        <li>Email: info@sortia.com</li>
                        <li>Soporte: soporte@sortia.com</li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-ceramic-700 pt-8 text-center text-ceramic-400">
                <p>&copy; <?php echo date('Y'); ?> Sortia. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>

    <!-- Modal de Compra -->
    <div id="purchase-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl transform transition-all">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-display font-bold text-ceramic-900">Confirmar Compra</h3>
                <button id="close-modal" class="text-ceramic-400 hover:text-ceramic-600 transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="bg-ceramic-50 rounded-xl p-4 mb-4">
                    <div class="flex justify-between items-center">
                        <span class="text-ceramic-700 font-medium">Cantidad de Tickets:</span>
                        <span class="text-2xl font-display font-bold text-ceramic-900" id="modal-ticket-amount">2</span>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-ceramic-700 font-medium">Total a pagar:</span>
                        <span class="text-2xl font-display font-bold text-ceramic-800" id="modal-total">16€</span>
                    </div>
                </div>

                <div>
                    <label class="block text-ceramic-700 font-medium mb-2">Nombre *</label>
                    <input type="text" id="customer-name" required class="w-full px-4 py-3 border-2 border-ceramic-300 rounded-xl focus:border-ceramic-500 focus:outline-none" placeholder="Tu nombre">
                </div>

                <div>
                    <label class="block text-ceramic-700 font-medium mb-2">Apellido *</label>
                    <input type="text" id="customer-lastname" required class="w-full px-4 py-3 border-2 border-ceramic-300 rounded-xl focus:border-ceramic-500 focus:outline-none" placeholder="Tu apellido">
                </div>

                <div>
                    <label class="block text-ceramic-700 font-medium mb-2">Número de Teléfono *</label>
                    <input type="tel" id="customer-phone" required class="w-full px-4 py-3 border-2 border-ceramic-300 rounded-xl focus:border-ceramic-500 focus:outline-none" placeholder="722539447">
                </div>

                <button id="send-whatsapp" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition flex items-center justify-center gap-2">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Enviar a WhatsApp
                </button>
            </div>
        </div>
    </div>

    <!-- Botón Flotante WhatsApp -->
    <a href="https://wa.me/722539447?text=Hola,%20me%20interesa%20participar%20en%20el%20sorteo%20de%20la%20Yamaha%20NMAX" 
       target="_blank" 
       class="fixed bottom-6 left-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 animate-pulse-slow">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
    </a>

    <?php wp_footer(); ?>
</body>
</html>

