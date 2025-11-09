<?php
/**
 * Sortia Theme Functions
 *
 * @package Sortia
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Enqueue scripts and styles
 */
function sortia_enqueue_scripts() {
    $theme_version = wp_get_theme()->get('Version');
    
    // Tailwind CSS CDN
    wp_enqueue_script('tailwind-cdn', 'https://cdn.tailwindcss.com', array(), null, false);
    
    // Google Fonts
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap', array(), null);
    
    // Custom CSS - con versión para evitar caché (agregar ?v=timestamp)
    $css_version = filemtime(get_template_directory() . '/css/style.css');
    wp_enqueue_style('sortia-style', get_template_directory_uri() . '/css/style.css', array(), $css_version);
    
    // Custom JavaScript - con versión para evitar caché (agregar ?v=timestamp)
    $js_version = filemtime(get_template_directory() . '/js/main.js');
    wp_enqueue_script('sortia-main', get_template_directory_uri() . '/js/main.js', array(), $js_version, true);
    
    // Tailwind Config
    wp_add_inline_script('tailwind-cdn', "
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'ceramic': {
                            50: '#f8f9fa',
                            100: '#e9ecef',
                            200: '#dee2e6',
                            300: '#ced4da',
                            400: '#adb5bd',
                            500: '#868e96',
                            600: '#495057',
                            700: '#343a40',
                            800: '#212529',
                            900: '#1a1d20',
                        },
                        'accent': {
                            light: '#f1f3f5',
                            DEFAULT: '#e9ecef',
                            dark: '#ced4da',
                        }
                    },
                    fontFamily: {
                        'sans': ['Inter', 'system-ui', 'sans-serif'],
                        'display': ['Poppins', 'system-ui', 'sans-serif'],
                    },
                }
            }
        }
    ", 'before');
}
add_action('wp_enqueue_scripts', 'sortia_enqueue_scripts');

/**
 * Theme setup
 */
function sortia_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
    
    // Set content width
    $GLOBALS['content_width'] = 1200;
}
add_action('after_setup_theme', 'sortia_setup');

/**
 * Remove WordPress version from head
 */
remove_action('wp_head', 'wp_generator');

/**
 * Deshabilitar caché de LiteSpeed Cache para archivos JS/CSS del tema (solo desarrollo)
 * Comentar esta función en producción
 */
function sortia_disable_litespeed_cache_for_theme_assets() {
    // Deshabilitar caché de LiteSpeed Cache para archivos del tema
    if (defined('LSCWP_V')) {
        // Agregar headers para evitar caché
        header('Cache-Control: no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
    }
}
// Descomentar la siguiente línea si necesitas deshabilitar la caché temporalmente
// add_action('wp_enqueue_scripts', 'sortia_disable_litespeed_cache_for_theme_assets', 1);

