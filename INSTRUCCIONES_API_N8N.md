# Instrucciones para Configurar API de Tickets para n8n

## 🔧 Problema Resuelto

El archivo `api-tickets.json` era un archivo HTML que ejecutaba JavaScript en el navegador. n8n necesita JSON puro, no HTML.

**Solución:** Usar Google Apps Script como endpoint que devuelve JSON directamente.

---

## 📝 Paso 1: Actualizar Google Apps Script

1. **Abre tu Google Sheet**
2. **Ve a Extensiones → Apps Script**
3. **Abre el archivo `CODIGO_COMPLETO_ACTUALIZADO.js`** en tu editor
4. **Copia TODO el código** (Ctrl+A, Ctrl+C)
5. **Vuelve al editor de Google Apps Script**
6. **Borra todo el código anterior** (Ctrl+A, Delete)
7. **Pega el código nuevo** (Ctrl+V)
8. **Guarda** (Ctrl+S o icono 💾)

---

## 🚀 Paso 2: Re-desplegar el Script

1. **Haz clic en "Desplegar" → "Gestionar implementaciones"**
2. **Haz clic en el icono de lápiz (✏️)** de la implementación activa
3. **Verifica la configuración:**
   - **Ejecutar como:** "Yo (tu-email@gmail.com)"
   - **Quién tiene acceso:** "Cualquier usuario"
4. **Haz clic en "Implementar"**
5. **Copia la URL de la aplicación web** (algo como):
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

---

## ✅ Paso 3: Verificar que Funciona

Abre la URL en tu navegador. Deberías ver un JSON como este:

```json
{
  "fecha": "2025-11-15T08:30:00.000Z",
  "fecha_formateada": "15/11/2025 09:30:00",
  "tickets_disponibles": 900,
  "tickets_totales": 1000,
  "tickets_ocupados": 100,
  "timestamp": 1734258600,
  "numeros_ocupados": "0,1,2,3,4,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,280,285,290,295,300,305,310,315,320,325,330,335,340,345,350,355,360,365,370,375,380,385,390,395,400,405,410,415,420,425,430,435,440,445,450,455,460,465,470,475",
  "lista_tipo": "ocupados"
}
```

---

## 🔗 Paso 4: Configurar n8n

1. **Abre tu workflow en n8n**
2. **En el nodo "HTTP Request2":**
   - **Method:** `GET`
   - **URL:** Pega la URL de Google Apps Script que copiaste en el Paso 2
     ```
     https://script.google.com/macros/s/AKfycby.../exec
     ```
   - **Authentication:** `None`
   - **Send Query Parameters:** `OFF`
   - **Send Headers:** `OFF`
   - **Send Body:** `OFF`
3. **Haz clic en "Execute step"** para probar

---

## 📊 Formato de Respuesta

El JSON devuelto tiene esta estructura:

### Si hay menos de 500 tickets ocupados:
```json
{
  "fecha": "2025-11-15T08:30:00.000Z",
  "fecha_formateada": "15/11/2025 09:30:00",
  "tickets_disponibles": 900,
  "tickets_totales": 1000,
  "tickets_ocupados": 100,
  "timestamp": 1734258600,
  "numeros_ocupados": "0,1,2,3,4,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,280,285,290,295,300,305,310,315,320,325,330,335,340,345,350,355,360,365,370,375,380,385,390,395,400,405,410,415,420,425,430,435,440,445,450,455,460,465,470,475",
  "lista_tipo": "ocupados"
}
```

### Si hay 500 o más tickets ocupados:
```json
{
  "fecha": "2025-11-15T08:30:00.000Z",
  "fecha_formateada": "15/11/2025 09:30:00",
  "tickets_disponibles": 499,
  "tickets_totales": 1000,
  "tickets_ocupados": 501,
  "timestamp": 1734258600,
  "numeros_disponibles": "0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,280,285,290,295,300,305,310,315,320,325,330,335,340,345,350,355,360,365,370,375,380,385,390,395,400,405,410,415,420,425,430,435,440,445,450,455,460,465,470,475,480,485,490,495",
  "lista_tipo": "disponibles"
}
```

---

## 🎯 Campos Disponibles

- **`fecha`**: Fecha en formato ISO (UTC)
- **`fecha_formateada`**: Fecha formateada en español (dd/MM/yyyy HH:mm:ss)
- **`tickets_disponibles`**: Cantidad de tickets disponibles
- **`tickets_totales`**: Total de tickets (1000)
- **`tickets_ocupados`**: Cantidad de tickets ocupados
- **`timestamp`**: Timestamp Unix (segundos)
- **`numeros_ocupados`**: Lista de números ocupados (solo si `lista_tipo` es "ocupados")
- **`numeros_disponibles`**: Lista de números disponibles (solo si `lista_tipo` es "disponibles")
- **`lista_tipo`**: Indica qué lista está incluida ("ocupados" o "disponibles")

---

## 💡 Uso en tu Agente de IA

En tu prompt del agente de IA, puedes usar:

```
Lista de números {{$json.lista_tipo}}: {{$json.numeros_ocupados || $json.numeros_disponibles}}
```

O simplemente:

```
{{$json.numeros_ocupados || $json.numeros_disponibles}}
```

---

## ⚠️ Notas Importantes

1. **La URL de Google Apps Script es diferente a `api-tickets.json`**
   - ❌ NO uses: `https://sortia.eu/api-tickets.json`
   - ✅ SÍ usa: `https://script.google.com/macros/s/.../exec`

2. **El script lee directamente de Google Sheets**, no necesita API key adicional

3. **La lista se optimiza automáticamente:**
   - Si hay < 500 ocupados → devuelve lista de ocupados
   - Si hay ≥ 500 ocupados → devuelve lista de disponibles
   - Esto reduce tokens en OpenAI

4. **La lista solo contiene números separados por comas**, sin texto adicional

---

## 🐛 Solución de Problemas

### Error: "Invalid JSON in response body"
- Verifica que estés usando la URL de Google Apps Script, no `api-tickets.json`
- Asegúrate de haber re-desplegado el script después de actualizar el código

### Error: "Script function not found: doGet"
- Crea una **nueva implementación** en lugar de editar la existente
- O archiva la implementación anterior y crea una nueva

### No se ven los datos
- Verifica que el Google Sheet tenga datos en las columnas A (número) y D (estado)
- Verifica que el nombre de la hoja sea "Hoja 1" (o ajusta el código)

---

## ✅ Listo

Una vez configurado, n8n podrá leer el JSON directamente sin errores. El formato está optimizado para reducir tokens en OpenAI.

