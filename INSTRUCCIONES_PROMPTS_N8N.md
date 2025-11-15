# Instrucciones para Usar los Prompts en n8n

## 📋 Resumen

Se han creado **2 prompts distintos** para optimizar el uso de tokens en OpenAI:

1. **`PROMPT_DISPONIBLES.md`**: Usar cuando `lista_tipo` es `"disponibles"` (hay ≥ 500 ocupados)
2. **`PROMPT_OCUPADOS.md`**: Usar cuando `lista_tipo` es `"ocupados"` (hay < 500 ocupados)

---

## 🔧 Configuración en n8n

### Paso 1: Nodo HTTP Request (Obtener datos)

**Configuración:**
- **Method:** `GET`
- **URL:** `https://script.google.com/macros/s/AKfycbyqv92NL1d8-0_FORfIiB6eVbbrQ7hiP_XVcALY5Lmr75PYLa2Val4C_LNtphB_xFBm-w/exec`

**Salida esperada:**
```json
{
  "fecha": "2025-11-15T08:10:42.539Z",
  "fecha_formateada": "15/11/2025 09:10:42",
  "tickets_disponibles": 996,
  "tickets_totales": 1000,
  "tickets_ocupados": 4,
  "timestamp": 1763194242,
  "numeros_ocupados": "117,131,158,817",
  "lista_tipo": "ocupados"
}
```

O si hay ≥ 500 ocupados:
```json
{
  "fecha": "2025-11-15T08:10:42.539Z",
  "fecha_formateada": "15/11/2025 09:10:42",
  "tickets_disponibles": 499,
  "tickets_totales": 1000,
  "tickets_ocupados": 501,
  "timestamp": 1763194242,
  "numeros_disponibles": "0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,280,285,290,295,300,305,310,315,320,325,330,335,340,345,350,355,360,365,370,375,380,385,390,395,400,405,410,415,420,425,430,435,440,445,450,455,460,465,470,475,480,485,490,495",
  "lista_tipo": "disponibles"
}
```

---

### Paso 2: Nodo IF (Decidir qué prompt usar)

**Condición:**
```
{{ $json.lista_tipo }} === "ocupados"
```

**Configuración:**
- **Condition:** `String`
- **Value 1:** `{{ $json.lista_tipo }}`
- **Operation:** `Equal`
- **Value 2:** `ocupados`

**Ramas:**
- **TRUE** → Usar `PROMPT_OCUPADOS.md`
- **FALSE** → Usar `PROMPT_DISPONIBLES.md`

---

### Paso 3: Nodo OpenAI (Rama TRUE - Ocupados)

**Prompt System:**
Copia el contenido completo de `PROMPT_OCUPADOS.md` y reemplaza:
```
{{ $json.numeros_ocupados }}
```
con:
```
{{ $json.numeros_ocupados }}
```

**Ejemplo de prompt system:**
```
🎟️ PROMPT LEO RIFA - VENDEDOR INTELIGENTE DE TICKETS (LISTA OCUPADOS)

...

📊 LISTA DE NÚMEROS OCUPADOS

Los siguientes números están OCUPADOS y NO se pueden escoger:

{{ $json.numeros_ocupados }}

...
```

**Prompt User:**
El mensaje del usuario que llega desde WhatsApp/Telegram/etc.

---

### Paso 4: Nodo OpenAI (Rama FALSE - Disponibles)

**Prompt System:**
Copia el contenido completo de `PROMPT_DISPONIBLES.md` y reemplaza:
```
{{ $json.numeros_disponibles }}
```
con:
```
{{ $json.numeros_disponibles }}
```

**Ejemplo de prompt system:**
```
🎟️ PROMPT LEO RIFA - VENDEDOR INTELIGENTE DE TICKETS (LISTA DISPONIBLES)

...

📊 LISTA DE NÚMEROS DISPONIBLES

Los siguientes números están DISPONIBLES y se pueden escoger:

{{ $json.numeros_disponibles }}

...
```

**Prompt User:**
El mensaje del usuario que llega desde WhatsApp/Telegram/etc.

---

## 📊 Flujo Completo

```
1. HTTP Request (GET datos)
   ↓
2. IF (lista_tipo === "ocupados"?)
   ├─ TRUE → OpenAI con PROMPT_OCUPADOS.md
   └─ FALSE → OpenAI con PROMPT_DISPONIBLES.md
   ↓
3. Enviar respuesta al usuario
```

---

## 🔑 Variables Disponibles

En ambos prompts, puedes usar estas variables de n8n:

- `{{ $json.numeros_ocupados }}` - Lista de números ocupados (solo si `lista_tipo` es "ocupados")
- `{{ $json.numeros_disponibles }}` - Lista de números disponibles (solo si `lista_tipo` es "disponibles")
- `{{ $json.lista_tipo }}` - Tipo de lista ("ocupados" o "disponibles")
- `{{ $json.tickets_disponibles }}` - Cantidad de tickets disponibles
- `{{ $json.tickets_ocupados }}` - Cantidad de tickets ocupados
- `{{ $json.tickets_totales }}` - Total de tickets (1000)
- `{{ $json.fecha_formateada }}` - Fecha formateada en español

---

## ⚠️ Notas Importantes

1. **La lista se actualiza automáticamente** cada vez que se ejecuta el HTTP Request
2. **Solo una lista estará presente** en cada respuesta:
   - Si `lista_tipo` es `"ocupados"` → Solo existe `numeros_ocupados`
   - Si `lista_tipo` es `"disponibles"` → Solo existe `numeros_disponibles`
3. **El nodo IF garantiza** que se use el prompt correcto según la lista disponible
4. **Optimización de tokens**: Se envía la lista más corta para reducir costos en OpenAI

---

## 🧪 Prueba del Flujo

1. Ejecuta el nodo HTTP Request
2. Verifica que `lista_tipo` sea "ocupados" o "disponibles"
3. El nodo IF debe dirigir al prompt correcto
4. El prompt debe incluir la lista correspondiente

---

## ✅ Listo

Con esta configuración, tu agente de IA tendrá acceso a la lista actualizada de números (ocupados o disponibles) y podrá verificar correctamente qué números se pueden vender.

