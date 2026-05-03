/**
 * Busca y copia programas de estudios desde una carpeta origen a una carpeta destino, según código de materia y año del programa.
 * 
 * @param {string} idCarpetaOrigen - ID de la carpeta de Google Drive que contiene las subcarpetas por departamento de Programas Digitalizados
 * @param {string} nombreDepartamento - Nombre exacto de la carpeta departamento a buscar dentro de origen (Música, Artes Visuales, Teatro, Cine)
 * @param {string} idCarpetaDestino - ID de la carpeta de Google Drive donde se copiarán los programas encontrados. Folder de la carpeta del estudiante
 * @returns {void} No retorna valor, copia archivos directamente en la carpeta destino
 */
function buscarProgramas(idCarpetaOrigen, nombreDepartamento, idCarpetaDestino) {
  try {
    // Buscar la carpeta del departamento dentro de la carpeta origen
    const carpetaDepartamento = buscarCarpetaPorNombre(idCarpetaOrigen, nombreDepartamento);
    if (!carpetaDepartamento) {
      throw new Error(`No se encontró la carpeta "${nombreDepartamento}" en la carpeta origen`);
    }
    
    Logger.log(`buscarProgramas: Encontrada carpeta "${nombreDepartamento}" (ID: ${carpetaDepartamento.getId()})`);

    // Llamar a generarMapaCodigoAnio para obtener el mapa código->año
    const mapaCodigoAnio = generarMapaCodigoAnio();

    Logger.log("buscarProgramas: buscando programas....");

    // Para cada elemento en el mapa, llamar a copiarArchivosPorCodigoYAnio usando la carpeta departamento
    for (const codigo in mapaCodigoAnio) {
      if (mapaCodigoAnio.hasOwnProperty(codigo)) {
        const anio = mapaCodigoAnio[codigo];
        copiarArchivosPorCodigoYAnio(codigo, anio, carpetaDepartamento.getId(), idCarpetaDestino);
      }
    }

    Logger.log("buscarProgramas: Proceso completado.");
  } catch (e) {
    throw new Error("buscarProgramas: Error - " + e.message);
  }
}

/**
 * Busca una subcarpeta por nombre exacto dentro de una carpeta padre.
 * 
 * @param {string} idCarpetaPadre - ID de la carpeta donde buscar
 * @param {string} nombreCarpeta - Nombre exacto de la carpeta a encontrar
 * @returns {Folder|null} La carpeta encontrada o null si no existe
 */
function buscarCarpetaPorNombre(idCarpetaPadre, nombreCarpeta) {
  const carpetaPadre = DriveApp.getFolderById(idCarpetaPadre);
  const carpetas = carpetaPadre.getFolders();
  
  while (carpetas.hasNext()) {
    const carpeta = carpetas.next();
    if (carpeta.getName() === nombreCarpeta) {
      return carpeta;
    }
  }
  return null;
}


/**
 * Lee la segunda hoja de un Google Sheet, extrae el código entre guiones '-' 
 * de la primera columna y el año de la segunda columna, y crea un mapa código-año.
 * 
 * @param {string} idHistoria - ID del Google Sheet con la historia académica aprobada y sus años.
 * @returns {Object} - Mapa clave-valor con código extraído como clave y año como valor.
 */
function generarMapaCodigoAnio() {
  //idSheet='1BkYdCBPrc8EUMxATJ0A7701pHwKK7qZLRnQ_SXMen7A';
  //idsheet = idHistoria;
  var ss = SpreadsheetApp.openById(idHistoria);
  var hoja = ss.getSheets()[1];
  var rango = hoja.getRange(1, 1, hoja.getLastRow(), 2);
  var datos = rango.getValues();
  
  var mapa = {};
  
  datos.forEach(function(fila) {
    var codigoNombre = fila[0];
    var anio = fila[1];
    
    if (codigoNombre && anio) {
      // Extraer el código entre guiones
      // Ejemplo: "95-03531 - SEMINARIO ..." -> extraer "03531"
      var partes = codigoNombre.toString().split("-");
      
      if (partes.length >= 2) {
        var codigo = partes[1].trim();
        mapa[codigo] = anio.toString();
      } else {
        // Si no tiene guiones, opcional: guardar con clave tal cual
        mapa[codigoNombre.toString().trim()] = anio;
      }
    }
  });
  
  Logger.log(mapa);
  return mapa;
}

//////////////////////////////////////////////////////////////////
/**
 * Busca y copia archivos cuyo nombre contenga simultáneamente un código y un año,
 * agregando al comienzo del nombre copiado un número de conteo que empieza en 05.
 *
 * @param {string} codigo - Código que debe aparecer en el nombre del archivo.
 * @param {string} anio - Año que debe aparecer en el nombre del archivo.
 * @param {string} idCarpetaOrigen - ID de la carpeta origen en Google Drive.
 * @param {string} idCarpetaDestino - ID de la carpeta destino en Google Drive.
 */
/**
function copiarArchivosPorCodigoYAnio(codigo, anio, idCarpetaOrigen, idCarpetaDestino) {
  var carpetaOrigen = DriveApp.getFolderById(idCarpetaOrigen);
  var carpetaDestino = DriveApp.getFolderById(idCarpetaDestino);

  // Contador que se mantiene para toda la recursión
  var countCopiados = 10; // empieza en 05

  // Función recursiva para buscar y copiar archivos en carpeta y subcarpetas
  function buscarYCopiarEnCarpeta(carpeta) {
    var archivos = carpeta.getFiles();
    while (archivos.hasNext()) {
      var archivo = archivos.next();
      var nombreArchivo = archivo.getName();

      if (nombreArchivo.indexOf(codigo) !== -1 && nombreArchivo.indexOf(anio) !== -1) {
        // Generar prefijo tipo "05", "06", etc.
        var numeroPrefijo = ("0" + countCopiados).slice(-2);
        var nuevoNombre = numeroPrefijo + "-" + nombreArchivo;

        var archivoCopiado = archivo.makeCopy(nombreArchivo, carpetaDestino);
        archivoCopiado.setName(nuevoNombre);

        countCopiados++; // Aumenta solo cuando se copia un archivo
      }
    }

    // Recorrer subcarpetas
    var subCarpetas = carpeta.getFolders();
    while (subCarpetas.hasNext()) {
      var subCarpeta = subCarpetas.next();
      buscarYCopiarEnCarpeta(subCarpeta);
    }
  }

  // Iniciar la búsqueda recursiva
  buscarYCopiarEnCarpeta(carpetaOrigen);

  Logger.log('Total archivos copiados: ' + (countCopiados - 5));
}
*/
//--------------------función que solo toma PDF y no otro formato----------------
/**
 * Busca y copia archivos PDF cuyo nombre contenga simultáneamente un código y un año,
 * agregando al comienzo del nombre copiado un número de conteo que empieza en 10.
 *
 * @param {string} codigo - Código que debe aparecer en el nombre del archivo.
 * @param {string} anio - Año que debe aparecer en el nombre del archivo.
 * @param {string} idCarpetaOrigen - ID de la carpeta origen en Google Drive.
 * @param {string} idCarpetaDestino - ID de la carpeta destino en Google Drive.
 */
function copiarArchivosPorCodigoYAnio(codigo, anio, idCarpetaOrigen, idCarpetaDestino) {
  var carpetaOrigen = DriveApp.getFolderById(idCarpetaOrigen);
  var carpetaDestino = DriveApp.getFolderById(idCarpetaDestino);

  // Contador que se mantiene para toda la recursión
  var countCopiados = 10; // empieza en 10 (no 05)

  // Función recursiva para buscar y copiar archivos en carpeta y subcarpetas
  function buscarYCopiarEnCarpeta(carpeta) {
    var archivos = carpeta.getFiles();
    while (archivos.hasNext()) {
      var archivo = archivos.next();
      var nombreArchivo = archivo.getName();

      // Solo procesar archivos cuyo nombre termina en .pdf (cualquier caso)
      if (!/\.pdf$/i.test(nombreArchivo)) continue;

      // Verificar que contenga código y año
      if (nombreArchivo.indexOf(codigo) !== -1 && nombreArchivo.indexOf(anio) !== -1) {
        // Generar prefijo tipo "10", "11", etc.
        var numeroPrefijo = ("0" + countCopiados).slice(-2);
        var nuevoNombre = numeroPrefijo + "-" + nombreArchivo;

        var archivoCopiado = archivo.makeCopy(nombreArchivo, carpetaDestino);
        archivoCopiado.setName(nuevoNombre);

        countCopiados++; // Aumenta solo cuando se copia un archivo
      }
    }

    // Recorrer subcarpetas
    var subCarpetas = carpeta.getFolders();
    while (subCarpetas.hasNext()) {
      var subCarpeta = subCarpetas.next();
      buscarYCopiarEnCarpeta(subCarpeta);
    }
  }

  // Iniciar la búsqueda recursiva
  buscarYCopiarEnCarpeta(carpetaOrigen);

  Logger.log('Total archivos copiados: ' + (countCopiados - 10));
}
