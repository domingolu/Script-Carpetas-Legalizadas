/**
 * Procesa una hoja de cálculo dada su ID duplicando la hoja activa y filtrando filas.
 * 
 * Pasos que realiza la función:
 * 1. Verifica que el archivo de Google Sheets con el ID dado exista y que tengas acceso a él.
 * 2. Duplica la hoja activa dentro del mismo archivo de hoja de cálculo, la reemplaza si ya existe la copia
 * 3. En la copia, elimina filas vacías (todas las celdas vacías).
 * 4. En la copia, elimina filas donde la primera columna contenga la palabra "asignatura" (insensible a mayúsculas).
 * 5. En la copia, elimina filas donde la tercera columna contenga la palabra "reprobado" (insensible a mayúsculas).
 * 6. en la copia, remplaza las fechas de la columna 2 por el año de la fecha
 * 
 * @param {string} idSheet - ID del archivo de Google Sheets a procesar.
 * @return {string} Mensaje con resultado del proceso.
 */
function procesarHoja(idSheet) {

  try {
    // Intentar abrir el archivo de Google Sheets con el ID dado
    // Si no existe o no hay permisos, esta línea lanzará un error
    var ss = SpreadsheetApp.openById(idSheet);
  } catch (e) {
    Logger.log('No se pudo abrir el archivo. Verifica que el ID sea correcto y que tengas permisos.');
    return 'Archivo no encontrado o sin acceso';
  }

  // Obtener la hoja activa del archivo
  var hojaOriginal = ss.getActiveSheet();

  // Crear una copia de la hoja activa para trabajar sin modificar la original
  var hojaCopia = hojaOriginal.copyTo(ss);

  //----------------
  // Verificar si existe una hoja con ese nombre y eliminarla
  var hojaExistente = ss.getSheetByName(hojaOriginal.getName() + '_Copia');
  if (hojaExistente) {
    ss.deleteSheet(hojaExistente);
  }
  //-----------------
  // Renombrar la hoja copiada para distinguirla
  hojaCopia.setName(hojaOriginal.getName() + '_Copia');

  // Hacer que la hoja copiada sea la hoja activa para facilitar operaciones
  ss.setActiveSheet(hojaCopia);

  // Obtener todos los datos de la hoja copiada
  var datos = hojaCopia.getDataRange().getValues();

  // Array donde almacenaremos solo las filas que cumplen las condiciones para mantener
  var filasParaMantener = [];

  for (var i = 0; i < datos.length; i++) {
    var fila = datos[i];

    // Verificar si la fila está vacía (todas las celdas vacías o null)
    var filaVacia = fila.every(function (celda) {
      return celda === '' || celda === null;
    });
    if (filaVacia) {
      // Omitir fila vacía
      continue;
    }

    // Revisar si la primera columna contiene la palabra "asignatura" sin importar mayúsculas o minúsculas
    var primeraColumna = (fila[0] || '').toString().toLowerCase();
    if (primeraColumna.includes('asignatura')) {
      // Omitir esta fila si contiene "asignatura" en la primera columna
      continue;
    }

    // Revisar si la tercera columna contiene la palabra "reprobado" sin importar mayúsculas o minúsculas
    var terceraColumna = (fila[2] || '').toString().toLowerCase();
    if (terceraColumna.includes('reprobado')) {
      // Omitir esta fila si contiene "reprobado" en la tercera columna
      continue;
    }

    // Si la fila no fue omitida por ninguno de los filtros, la agregamos a la lista para mantener
    filasParaMantener.push(fila);
  }

  // Limpiar contenido de la hoja copiada para pegar solo las filas filtradas
  hojaCopia.clearContents();

  // Pegar las filas que quedaron después del filtro
  if (filasParaMantener.length > 0) {
    hojaCopia.getRange(1, 1, filasParaMantener.length, filasParaMantener[0].length).setValues(filasParaMantener);
  }

  //6. revisar fechas -> años
  var rango = hojaCopia.getRange("B1:B" + hojaCopia.getLastRow());
  var valores = rango.getValues();

  // Cambiar formato de la columna B a automático (texto general)
  hojaCopia.getRange("B1:B" + hojaCopia.getLastRow()).setNumberFormat("@");

  for (var i = 0; i < valores.length; i++) {
    var valor = valores[i][0];
    if (valor instanceof Date) {
      // Obtener el año
      var anio = valor.getFullYear();
      // Setear el año en la misma celda
      hojaCopia.getRange(i + 1, 2).setValue(anio); // Columna 2 es la B
    }// Si no es fecha, no hace nada
  }

  return 'Proceso completado exitosamente';
}
