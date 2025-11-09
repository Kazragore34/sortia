<?php
/**
 * Webhook para recibir mensajes de Wasender y reenviarlos a n8n
 * Agrega categoría de vendedormaster o cliente según el número
 */

// 1. Obtener el cuerpo de la solicitud
$raw_input = file_get_contents("php://input");
file_put_contents("log.txt", "--- Nuevo Mensaje ---\n" . date('Y-m-d H:i:s') . "\n" . $raw_input . "\n\n", FILE_APPEND);

// 2. Decodificar el JSON
$data = json_decode($raw_input, true);

if (!$data) {
    file_put_contents("log.txt", "ERROR: No se pudo decodificar el JSON\n\n", FILE_APPEND);
    http_response_code(400);
    echo "Error: JSON inválido";
    exit();
}

// 3. Extraer datos clave del mensaje
$from = null;
$from_me = true; // Asumimos que es nuestro por defecto para seguridad

$key_data = $data['data']['messages']['key'] ?? null;
if ($key_data) {
    $from = $key_data['participant'] ?? $key_data['remoteJid'] ?? null;
    // Comprobamos si el mensaje es nuestro o de otra persona
    $from_me = $key_data['fromMe'] ?? true;
}

// 4. Lista de números VENDEDORMASTER (los 3 números especiales)
$vendedormasters = [
    "34722539447@s.whatsapp.net",  // Reemplaza con el primer número real
    "519674952331@s.whatsapp.net", // Reemplaza con el segundo número real
    // Agrega el tercer número aquí: "NUMERO3@s.whatsapp.net"
];

// 5. Condición: El mensaje NO debe ser nuestro (solo procesamos mensajes entrantes)
if ($from && $from_me === false) {
    
    // 6. Determinar la categoría (vendedormaster o cliente)
    $categoria = in_array($from, $vendedormasters) ? "vendedormaster" : "cliente";
    
    file_put_contents("log.txt", "Decisión: MENSAJE ENTRANTE ($from). Categoría: $categoria. Disparando webhook a n8n...\n\n", FILE_APPEND);
    
    // 7. Agregar el campo vendedormaster al JSON
    $data['vendedormaster'] = $categoria;
    
    // 8. Convertir de nuevo a JSON
    $json_con_categoria = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    // 9. URL del webhook de n8n
    $n8nWebhook = 'https://n8n.wolffilms.es/webhook-test/f474262a-2787-4061-a7ed-89d941d066ea';
    
    // 10. cURL "Disparar y Olvidar" para no causar timeouts
    $ch = curl_init($n8nWebhook);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json_con_categoria);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    // Usamos un timeout de 2 segundos. Es suficiente para enviar sin fallar.
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_setopt($ch, CURLOPT_NOSIGNAL, 1);
    curl_exec($ch);
    curl_close($ch);
    
    // 11. Respondemos a Wasender para que no reintente
    http_response_code(200);
    echo "Webhook reenviado a n8n con categoría: $categoria";
    
} else {
    // Si el mensaje es nuestro, lo ignoramos
    $reason = $from_me ? "MENSAJE PROPIO" : "SIN REMITENTE";
    file_put_contents("log.txt", "Decisión: IGNORADO. Razón: $reason ($from).\n\n", FILE_APPEND);
    http_response_code(200);
    echo "Mensaje ignorado.";
    exit();
}
?>

