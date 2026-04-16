/**
 * script PROGRAMAS
 * PREREQUISITOS: 
 *  drviveapp service instalado
 *  Biblioteca PDFApp instalada id: 1Xmtr5XXEakVql7N6FqwdCNdpdijsJOxgqH173JSB0UOwdb0GJYJbnJLk
 * 
 * web test: https://script.google.com/a/macros/artes.unc.edu.ar/s/AKfycbyyWUfJrnu2_j1JrqBEbVXiwMTU4FC23DD93MqY2Vk/dev
 */

/**
 * Punto de entrada de la Web App.
 * Esta función se ejecuta ante solicitudes GET.
 * Retorna el archivo HTML llamado "Index" como interfaz principal.
 *
 * Requiere que el proyecto sea implementado como aplicación web.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

/**
 * Función main en backend para procesar archivo y opciones
 * 
 * @param {string} fileName Nombre del archivo subido
 * @param {string} base64Data Contenido del archivo en base64
 * @param {string[]} opciones Array con las opciones seleccionadas (checkboxes)
 * @return {Object} Resultado con idHistoria, valores y opcionesRecibidas
 */
function main(fileName, base64Data, opciones) {
  try {
    //recibe datos del front form
    // Extraer nacionalidad y destino de las opciones
    opciones.forEach(function (opcion) {
      if (opcion.startsWith('nacionalidad: ')) {
        nacionalidad = opcion.replace('nacionalidad: ', '').trim();
      } else if (opcion.startsWith('destino: ')) {
        destino = opcion.replace('destino: ', '').trim();
      } else if (opcion === "egresado") {
        esEgresado = true;  // Marca que el checkbox egresado fue tildado
      } else if (opcion === "sancionado") {
        sancionado = "SÍ registra sanciones";  // Marca que el checkbox egresado fue tildado
      }
    });

    //Subir analítico a drive
    idUploadedFile = (subirFileToDrive(fileName, base64Data)).id;   //id del analítico

    //parsear
    parse(idUploadedFile);

    // Crear carpeta con nombre "nombre - identificacion"
    var carpetaNueva = crearCarpeta(nombre, identificacion, codigoTitulo, carpetaFuente);
    idCarpetaNueva = carpetaNueva.getId();
    var urlCarpeta = `https://drive.google.com/drive/folders/${idCarpetaNueva}`;
    Logger.log("Carpeta creada o encontrada: " + carpetaNueva.getName() + " (ID: " + idCarpetaNueva + ")");


    //Mover analítico subido a la carpeta de trabajo
    //var nombreAnalitico = `02- Analítico ${nombre} - ${codigoTitulo}`
    //renombrarArchivoPorId(idUploadedFile, nombreAnalitico);
    //moveFileToFolder(idUploadedFile, idCarpetaNueva);

    ///////////subo analítico a la carpeta nueva///////////
    // Mover analítico subido a la carpeta de trabajo
    var nombreAnalitico = `02- Analítico ${nombre} - ${codigoTitulo}`;
    // Buscar y eliminar archivos con el mismo nombre en la carpeta nueva
    var archivosExistentes = carpetaNueva.getFilesByName(nombreAnalitico);
    while (archivosExistentes.hasNext()) {
      var archivoExistente = archivosExistentes.next();
      archivoExistente.setTrashed(true);  // Envía a la papelera
    }
    renombrarArchivoPorId(idUploadedFile, nombreAnalitico);
    moveFileToFolder(idUploadedFile, idCarpetaNueva);
    //////////////////////7


    //copiar plantillas a la carpeta
    idCaratula = (copiarDocEnCarpeta(idPlantillaCaratula, idCarpetaNueva)).getId();
    if (esEgresado) {
      idResumenEgresado = (copiarDocEnCarpeta(idPlantillaResumenEgresado, idCarpetaNueva)).getId();
    } else {
      idResumenAlumno = (copiarDocEnCarpeta(idPlantillaResumenAlumno, idCarpetaNueva)).getId();
    }
    // reemplaza datos parseados del analítico en las plantillas copiadas 
    editarPlantillas();

    //parsear tabla: pasa las tablas del analítico a un sheet
    idHistoria = importarTablasDePDFaSheets(idUploadedFile, idCarpetaNueva);
    //procesar hoja: limpia los datos del sheet HA
    procesarHoja(idHistoria);

    //Procesar opciones mediante función externa
    procesarOpciones(opciones);

    Logger.log('MAIN: idHistoria: ' + idHistoria + '\n');

    // Guarda info de opciones como archivo de texto separado (opcional)
    const opcionesTexto = opciones.join('\n');

    return {
      idHistoria: idHistoria,
      opciones: opcionesTexto,
      urlCarpeta: urlCarpeta,
      valores: null
    };
  } catch (e) {
    throw new Error("MAIN: Error en backend: " + e.message);
  }
}

