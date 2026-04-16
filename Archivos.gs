/**
 * Recibe nombre y contenido base64, guarda archivo en Drive y devuelve URL
 * @param {string} fileName Nombre del archivo con extensión
 * @param {string} base64Data Contenido en base64 sin prefijo
 * @return {Object} { url: string, id: string } URL e ID del archivo subido
 */
function subirFileToDrive(fileName, base64Data) {
  try {
    // Convertir base64 a Blob
    const contentType = 'application/pdf';
    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, contentType, fileName);

    // Subir a Drive en la carpeta raíz (puedes cambiar carpeta si quieres)
    const file = DriveApp.createFile(blob);
    const idFileUploaded = file.getId();
    Logger.log('subirFileToDrive: fileId del analitico subido: ' + file.getId());

    // Devolver URL para abrirlo en Drive
    return {
      url: file.getUrl(),
      id: idFileUploaded
    };
  } catch (e) {
    throw new Error('subirFileToDrive: Error al subir archivo: ' + e.message);
  }
}

/**
 * Mueve un archivo a una carpeta específica en Drive
 * Si ya existe un archivo con el mismo nombre en la carpeta destino, lo reemplaza
 * @param {string} fileId ID del archivo a mover
 * @param {string} folderId ID de la carpeta destino
 */
function moveFileToFolder(fileId, folderId) {
  try {
    // Obtener el archivo por su ID
    const file = DriveApp.getFileById(fileId);
    // Obtener la carpeta destino por ID
    const folder = DriveApp.getFolderById(folderId);
    
    // Buscar archivos con el mismo nombre en la carpeta destino
    const filesIterator = folder.getFilesByName(file.getName());
    while (filesIterator.hasNext()) {
      const existingFile = filesIterator.next();
      // Eliminar archivo existente
      existingFile.setTrashed(true);
    }
    
    // Mover el archivo a la carpeta destino
    file.moveTo(folder);
    
    Logger.log(`Archivo con ID ${fileId} movido a carpeta con ID ${folderId}, reemplazando si existía.`);
  } catch (error) {
    Logger.log('Error al mover el archivo: ' + error.message);
  }
}

/**
 * Crea una carpeta con el nombre "nombre - identificacion" dentro de la carpeta indicada por ID.
 * Si ya existe una carpeta con ese nombre en dicha ubicación, devuelve la carpeta existente.
 *
 * @param {string} nombre Nombre extraído del documento
 * @param {string} identificacion Identificación extraída del documento
 * @param {string} [idCarpetaPadre] ID opcional de la carpeta donde crear la nueva carpeta
 * @return {Folder} La carpeta creada o existente
 */
function crearCarpeta(nombre, identificacion, codigoTitulo, idCarpetaPadre) {
  const nombreCarpeta = `${nombre} - ${identificacion} - ${codigoTitulo}`;
  let carpetaPadre;

  if (idCarpetaPadre) {
    carpetaPadre = DriveApp.getFolderById(idCarpetaPadre);
  } else {
    // Si no se especifica carpeta padre, se usa la raíz
    carpetaPadre = DriveApp.getRootFolder();
  }

  // Buscar si ya existe una carpeta con ese nombre dentro de la carpeta padre
  const carpetas = carpetaPadre.getFoldersByName(nombreCarpeta);
  if (carpetas.hasNext()) {
    return carpetas.next(); // Devuelve la carpeta existente
  } else {
    // Crear carpeta nueva dentro de la carpeta padre especificada
    return carpetaPadre.createFolder(nombreCarpeta);
  }
}

/**
 * Copia un archivo de Google Docs a la carpeta especificada por su ID.
 * Verifica que la carpeta destino y el archivo origen existen antes de copiar.
 * Si existe un archivo con el mismo nombre en la carpeta destino, se elimina antes de crear la copia.
 *
 * @param {string} idArchivoOrigen ID del Google Docs a copiar
 * @param {string} idCarpetaDestino ID de la carpeta donde se guardará la copia (debe existir)
 * @return {File|null} Archivo copiado o null si no se encontró origen o carpeta
 */
function copiarDocEnCarpeta(idArchivoOrigen, idCarpetaDestino) {
  try {
    // Obtener carpeta destino por ID
    const carpetaDestino = DriveApp.getFolderById(idCarpetaDestino);
    if (!carpetaDestino) {
      throw new Error('Carpeta destino no encontrada con el ID proporcionado.');
    }

    // Verificar archivo origen existe
    const archivoOrigen = DriveApp.getFileById(idArchivoOrigen);
    if (!archivoOrigen) {
      throw new Error('Archivo origen no encontrado con el ID proporcionado.');
    }

    const nombreArchivo = archivoOrigen.getName();

    // Buscar archivos con el mismo nombre en la carpeta destino
    const archivosExistentes = carpetaDestino.getFilesByName(nombreArchivo);
    while (archivosExistentes.hasNext()) {
      const archivoExistente = archivosExistentes.next();
      archivoExistente.setTrashed(true);  // Mover a la papelera en lugar de eliminar permanentemente
    }

    // Crear copia en la carpeta destino con el mismo nombre que el original
    return archivoOrigen.makeCopy(nombreArchivo, carpetaDestino);

  } catch (error) {
    Logger.log("Error al copiar archivo: " + error.message);
    return null;
  }
}

/**
 * Mueve una carpeta de Google Drive a otra carpeta destino.
 * 
 * Esta función elimina la carpeta de sus carpetas padres actuales y la agrega
 * a la carpeta destino especificada. Luego verifica si la operación fue exitosa.
 *
 * @param {Folder} carpeta - Objeto Folder que representa la carpeta a mover.
 * @param {Folder} carpetaDestino - Objeto Folder que representa la carpeta destino donde se moverá.
 * @return {boolean} Devuelve true si la carpeta fue movida correctamente, false en caso contrario.
 *
 * @example
 * // Supongamos que tienes dos objetos Folder: carpetaA y carpetaDestino
 * const exito = moverCarpeta(carpetaA, carpetaDestino);
 * if (exito) {
 *   Logger.log('Carpeta movida correctamente');
 * } else {
 *   Logger.log('Error al mover la carpeta');
 * }
 */
function moverCarpeta(carpeta, carpetaDestino) {
  // carpeta: objeto Folder que quieres mover
  // carpetaDestino: objeto Folder donde quieres moverla

  // Obtener padres actuales
  const padres = carpeta.getParents();
  while (padres.hasNext()) {
    const padre = padres.next();
    padre.removeFolder(carpeta);  // Quitar carpeta de su padre actual
  }

  // Agregar carpeta a la carpeta destino
  carpetaDestino.addFolder(carpeta);

  // Verificación: comprobar si la carpeta destino ahora contiene la carpeta
  const existeEnDestino = carpetaDestino.getFoldersByName(carpeta.getName()).hasNext();

  if (existeEnDestino) {
    Logger.log("La carpeta se movió correctamente a: " + carpetaDestino.getName());
    return true;
  } else {
    Logger.log("No se pudo mover la carpeta.");
    return false;
  }
}

/**
 * Busca archivos en una carpeta que contengan los strings plan y carrera en su nombre.
 * El argumento depto es opcional.
 * @param {string} folderId ID de la carpeta donde buscar
 * @param {string} depto Departamento a buscar en el nombre del archivo (opcional)
 * @param {string} plan Plan a buscar en el nombre del archivo (obligatorio)
 * @param {string} carrera Carrera a buscar en el nombre del archivo (obligatorio)
 * @return {Array} Lista de objetos con nombre, ID y URL de los archivos encontrados
 */
function buscarArchivosPorNombres(folderId, depto, plan, carrera) {
  // Validar argumentos obligatorios
  if (!folderId || folderId.toString().trim() === "") {
    throw new Error("El argumento 'folderId' es obligatorio y no puede estar vacío.");
  }
  if (!plan || plan.toString().trim() === "") {
    throw new Error("El argumento 'plan' es obligatorio y no puede estar vacío.");
  }
  if (!carrera || carrera.toString().trim() === "") {
    throw new Error("El argumento 'carrera' es obligatorio y no puede estar vacío.");
  }
  
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  var resultados = [];

  // Convertir argumentos a minúsculas para búsqueda case-insensitive
  var deptoLower = (depto && depto.toString().trim() !== "") ? depto.toLowerCase() : null;
  var planLower = plan.toLowerCase();
  var carreraLower = carrera.toLowerCase();

  while (files.hasNext()) {
    var file = files.next();
    var nombre = file.getName().toLowerCase();
    
    var cumpleDepto = deptoLower ? nombre.indexOf(deptoLower) !== -1 : true;
    var cumplePlan = nombre.indexOf(planLower) !== -1;
    var cumpleCarrera = nombre.indexOf(carreraLower) !== -1;
    
    if (cumpleDepto && cumplePlan && cumpleCarrera) {
      resultados.push({
        nombre: file.getName(),
        id: file.getId(),
        url: file.getUrl()
      });
    }
  }
  
  return resultados;
}


/**
 * Renombra un archivo en Google Drive dado su ID.
 *
 * @param {string} fileId - El ID del archivo a renombrar.
 * @param {string} nuevoNombre - El nuevo nombre que quieres asignarle al archivo.
 */
function renombrarArchivoPorId(fileId, nuevoNombre) {
  var archivo = DriveApp.getFileById(fileId);
  archivo.setName(nuevoNombre);
  
  Logger.log('Archivo renombrado a: ' + nuevoNombre);
}
