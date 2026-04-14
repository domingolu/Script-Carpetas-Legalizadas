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


/**
 * Busca y copia archivos cuyo nombre contenga simultáneamente un código y un año,
 * agregando al comienzo del nombre copiado un número de conteo que empieza en 05.
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
  var countCopiados = 5; // empieza en 05

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


////////////////////funcion original sin número de prefijo///////////////////////////////////////7

/****
    Función copiarArchivosPorCodigoYAnio
    Esta función realiza una búsqueda recursiva en una carpeta de Google Drive y todas sus subcarpetas,
    copiando a la carpeta destino todos los archivos cuyo nombre contenga simultáneamente un código y un año especificados.
    Parámetros:
    @param {string} codigo - Código que debe estar presente en el nombre de los archivos a copiar.
    @param {string} anio - Año que debe estar presente en el nombre de los archivos a copiar.
    @param {string} idCarpetaOrigen - ID de la carpeta origen en Google Drive donde se realizará la búsqueda.
    @param {string} idCarpetaDestino - ID de la carpeta destino en Google Drive donde se copiarán los archivos encontrados.
    Funcionamiento:
        Obtiene las referencias a las carpetas origen y destino a partir de sus IDs.
        Define una función recursiva 'buscarYCopiarEnCarpeta' que:
        Busca todos los archivos en la carpeta actual.
        Para cada archivo, verifica si su nombre contiene simultáneamente el código y el año buscados.
    text
     En caso afirmativo, realiza una copia del archivo en la carpeta destino.
        Luego, obtiene todas las subcarpetas de la carpeta actual y llama recursivamente a la función sobre cada una.
        Inicia el proceso recursivo desde la carpeta origen.
        Al finalizar, registra en el log la cantidad total de archivos copiados.
    Uso típico:
    copiarArchivosPorCodigoYAnio("ABC123", "2024", "id_carpeta_origen", "id_carpeta_destino");
*//**
function copiarArchivosPorCodigoYAnio(codigo, anio, idCarpetaOrigen, idCarpetaDestino) {
  var carpetaOrigen = DriveApp.getFolderById(idCarpetaOrigen);
  var carpetaDestino = DriveApp.getFolderById(idCarpetaDestino);
  var countCopiados = 0;


  // Función recursiva para buscar y copiar archivos en carpeta y subcarpetas
  function buscarYCopiarEnCarpeta(carpeta) {
    // Buscar archivos en la carpeta actual
    var archivos = carpeta.getFiles();
    while (archivos.hasNext()) {
      var archivo = archivos.next();
      var nombreArchivo = archivo.getName();
      if (nombreArchivo.indexOf(codigo) !== -1 && nombreArchivo.indexOf(anio) !== -1) {
        archivo.makeCopy(nombreArchivo, carpetaDestino);
        countCopiados++;
      }
    }


    // Buscar subcarpetas y llamar recursivamente
    var subCarpetas = carpeta.getFolders();
    while (subCarpetas.hasNext()) {
      var subCarpeta = subCarpetas.next();
      buscarYCopiarEnCarpeta(subCarpeta);
    }
  }


  // Inicio de la búsqueda recursiva
  buscarYCopiarEnCarpeta(carpetaOrigen);


  Logger.log('Archivos copiados: ' + countCopiados);
}

*/