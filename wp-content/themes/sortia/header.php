<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Participa en el sorteo de una Yamaha NMAX-tech Max 125cc 2025. Compra tus tickets ahora y gana esta increíble moto.">
    <?php wp_head(); ?>
</head>
<body <?php body_class('font-sans relative'); ?>>
    <!-- Fondo con diseño -->
    <div class="fixed inset-0 -z-10 background-pattern"></div>
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-ceramic-50 via-white to-ceramic-100 opacity-90"></div>
    
    <!-- Header -->
    <header class="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-ceramic-200">
        <nav class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="text-2xl font-display font-bold text-ceramic-800">
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="bg-gradient-to-r from-ceramic-700 to-ceramic-500 bg-clip-text text-transparent">
                        SORTIA
                    </a>
                </div>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="#premio" class="text-ceramic-700 hover:text-ceramic-900 font-medium transition">Premio</a>
                    <a href="#como-funciona" class="text-ceramic-700 hover:text-ceramic-900 font-medium transition">Cómo Funciona</a>
                    <a href="#comprar" class="text-ceramic-700 hover:text-ceramic-900 font-medium transition">Comprar Tickets</a>
                    <a href="#faq" class="text-ceramic-700 hover:text-ceramic-900 font-medium transition">FAQ</a>
                </div>
                <button class="md:hidden text-ceramic-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </nav>
    </header>

