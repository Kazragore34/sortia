# ✅ Configuración Completada - Google Sheets API

## 🔑 API Key Configurada

Tu API Key ya está configurada en el código:
- **API Key**: `AIzaSyBTg5ozE85sC1Qvw2ZbxnTW5Jxnn0cL4iE`
- **Método**: API de Google Sheets
- **Rango**: D2:D1002 (columna D, filas 2 a 1002)

## 📊 Estructura del Google Sheet

Tu Google Sheet tiene esta estructura:
- **Columna A**: Número del ticket (0, 1, 2, 3...)
- **Columna B**: Nombre (disponible, ocupado, etc.)
- **Columna C**: Teléfono
- **Columna D**: Estado (esta es la que se lee)

## ⚙️ Configuración Actual

El código está configurado para:
- ✅ Leer la columna D desde la fila 2 hasta la 1002
- ✅ Reconocer estados: `disponible`, `disponble` (typo), `ocupado`, `vendido`, `reservado`
- ✅ Actualizar el contador cada 30 segundos automáticamente
- ✅ Mostrar tickets disponibles = 1000 - (vendidos + reservados + ocupados)

## 🔍 Valores Reconocidos

### Estados que cuentan como NO DISPONIBLES:
- `vendido`, `vendida`
- `reservado`, `reservada`
- `ocupado`, `ocupada`
- `comprado`, `comprada`

### Estados que cuentan como DISPONIBLES:
- `disponible`
- `disponble` (typo común)
- `dispon`
- `libre`
- `available`

## 📝 Nota sobre el Nombre de la Hoja

El código está configurado para leer la hoja llamada **"Sheet1"**.

Si tu hoja tiene otro nombre (por ejemplo, "Hoja 1", "tickets", etc.), necesitas cambiarlo en `js/main.js` línea 20:

```javascript
sheetName: 'Hoja 1', // Cambia 'Sheet1' por el nombre real de tu pestaña
```

## ✅ Próximos Pasos

1. **Verifica el nombre de la hoja**: Si no se llama "Sheet1", cámbialo en el código
2. **Asegúrate de que la columna D tenga datos**: El código lee D2:D1002
3. **Haz el Sheet público** (si aún no lo está):
   - Compartir → "Cambiar a cualquier persona con el enlace" → "Lector"
4. **Prueba la página**: Abre la consola del navegador (F12) y verifica que no haya errores

## 🧪 Cómo Probar

1. Abre tu página web
2. Abre la consola del navegador (F12)
3. Deberías ver mensajes como:
   ```
   📊 Columna D detectada (Estado) - Vendidos: X, Reservados: Y, Disponibles: Z, Total vendidos/reservados: W
   ```
4. El contador en la página debería mostrar los tickets disponibles correctamente

## ❌ Si No Funciona

### Error: "API key not valid"
- Verifica que la API Key sea correcta
- Verifica que la API de Google Sheets esté habilitada en Google Cloud Console

### Error: "The caller does not have permission"
- Haz el Sheet público (Compartir → "Cualquier persona con el enlace")

### Error: "Unable to parse range"
- Verifica que el nombre de la hoja sea correcto
- Verifica que el rango D2:D1002 exista

### El contador muestra 0
- Verifica que la columna D tenga datos
- Abre la consola (F12) y revisa los mensajes de error
- Verifica que los valores en la columna D sean reconocidos (disponible, ocupado, etc.)

## 🔄 Actualización Automática

El contador se actualiza automáticamente cada **30 segundos** sin necesidad de recargar la página.

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que el Sheet sea público
3. Verifica que la columna D tenga datos
4. Verifica que el nombre de la hoja sea correcto

