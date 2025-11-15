# Solución al Error: Bot dice que 999 está vendido cuando debería estar disponible

## Problema Identificado

El bot está diciendo que el número 999 está vendido cuando debería estar disponible. Esto indica que:

1. **El prompt está recibiendo la lista correctamente** (porque el 257 sí lo verifica bien)
2. **El problema está en cómo el agente interpreta la lista** o en cómo se está pasando la lista al prompt

## Causa Raíz

En n8n, cuando usas un agente de LangChain, el `systemMessage` puede no interpolar correctamente las variables `{{ $json.numeros_disponibles }}` o `={{ $json.numeros_disponibles }}` dentro de strings largos.

## Solución Recomendada

### Opción 1: Usar un nodo "Code" antes del agente (RECOMENDADO)

Agregar un nodo "Code" antes de cada agente ("bot de venta" y "bot de venta dispo") para construir el prompt completo con la lista ya interpolada:

```javascript
// Para "bot de venta dispo" (disponibles)
const lista = $input.item.json.numeros_disponibles || '';
const promptBase = `LEO - Vendedor de Tickets (Lista Disponibles)

═══════════════════════════════════════════════════════════
CONFIGURACIÓN (Modificar según sea necesario)
═══════════════════════════════════════════════════════════
IBAN: XXXXXXXXXXXXXXXXXXX
═══════════════════════════════════════════════════════════

IDENTIDAD
Eres LEO, vendedor de tickets de la Rifa Yamaha NMAX-tech Max 125cc 2025. Vende 1000 tickets (000-999) a 8€ c/u, mínimo 2 tickets (16€). Objetivo: vender todos.

PREMIO
Yamaha NMAX-tech Max 125cc 2025 | 0km | Cerámic Grey | 1000 tickets (000-999) | 8€/ticket | Mínimo 2 tickets

REGLA CRÍTICA ⚠️
Lista DISPONIBLES: ${lista}

⚠️ FORMATO DE LA LISTA: Es una lista separada por comas (ejemplo genérico: "[AAA],[BBB],[CCC],...,[YYY],[ZZZ]")
⚠️ CÓMO BUSCAR: Divide la lista por comas y busca el número exacto en cada elemento

[... resto del prompt ...]`;

return [{
  json: {
    ...$input.item.json,
    systemMessage: promptBase
  }
}];
```

Luego, en el agente, usar `={{ $json.systemMessage }}` en lugar del prompt hardcodeado.

### Opción 2: Verificar que la variable esté disponible

Asegurarse de que el nodo "Edit Fields7" esté pasando correctamente `numeros_disponibles` al agente. Verificar en el flujo que la variable esté disponible cuando el agente la necesite.

### Opción 3: Usar el campo "text" del agente para pasar la lista

En lugar de usar `systemMessage`, pasar la lista como parte del `text` del agente:

```
text: ={{ $('Edit Fields').item.json.body.data.messages.message.conversation }}\n\nLista DISPONIBLES: {{ $json.numeros_disponibles }}
```

Y modificar el prompt para que lea la lista del mensaje del usuario.

## Verificación

Para verificar que la lista se está pasando correctamente:

1. Agregar un nodo "Code" después de "Edit Fields7" para hacer `console.log($input.item.json.numeros_disponibles)`
2. Verificar en los logs de n8n que la lista contiene el número 999
3. Verificar que el prompt del agente está recibiendo la lista completa

## Nota Importante

El problema puede ser que el agente de IA no está parseando correctamente la lista cuando es muy larga. Asegúrate de que:

1. La lista se está pasando como string separado por comas
2. El prompt está instruyendo correctamente al agente sobre cómo buscar en la lista
3. El agente está buscando hasta el final de la lista (no se detiene antes)

