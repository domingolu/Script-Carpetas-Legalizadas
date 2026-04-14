const LOG_SHEET_NAME = 'Logs';

// Función para agregar un mensaje a los logs (guarda en la hoja)
function agregarLog(mensaje) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  hoja.appendRow([new Date(), mensaje]);
}

// Función para obtener todos los logs (leer filas de la hoja)
function obtenerLogs() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  const datos = hoja.getDataRange().getValues();
  // Devolver como lista de strings combinando fecha y mensaje
  return datos.map(fila => Utilities.formatDate(fila[0], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss") + " - " + fila[1]);
}

// Ejemplo: función backend que agrega un log y devuelve un mensaje
function obtenerMensaje() {
  agregarLog("hola desde el backend");
  return "Hola Mundo desde backend";
}

      //PARTE DE LOGS NO IMPLENENTADO esto va en el script del index
      /*
      function mostrarMensajeYLogs() {
        // Pedir saludo al backend y mostrarlo
        google.script.run.withSuccessHandler(function(mensaje) {
          document.getElementById('mensaje').innerText = mensaje;
          
          // Luego pedir logs y mostrar
          google.script.run.withSuccessHandler(function(logs) {
            document.getElementById('logs').innerText = logs.join('\n');
          }).obtenerLogs();
          
        }).obtenerMensaje();
      }
      window.onload = mostrarMensajeYLogs;
      */