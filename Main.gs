/**
 * script PROGRAMAS
 * PREREQUISITOS: 
 *  drviveapp service instalado
 *  Biblioteca PDFApp instalada id: 1Xmtr5XXEakVql7N6FqwdCNdpdijsJOxgqH173JSB0UOwdb0GJYJbnJLk
 * 
 * web test: https://script.google.com/a/macros/unc.edu.ar/s/AKfycbzRCCViohj3_GessHLhA-DiAb-tFHOix7yF7OISdA8/dev
 */

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
    var carpetaNueva = crearCarpeta(nombre, identificacion, carpetaFuente);
    idCarpetaNueva = carpetaNueva.getId();
    Logger.log("Carpeta creada o encontrada: " + carpetaNueva.getName() + " (ID: " + idCarpetaNueva + ")");

    //Mover analítico subido a la carpeta de trabajo
    moveFileToFolder(idUploadedFile, idCarpetaNueva);

    //copiar plantillas a la carpeta
    idCaratula = (copiarDocEnCarpeta(idPlantillaCaratula, idCarpetaNueva)).getId();
    if (esEgresado){
      idResumenEgresado = (copiarDocEnCarpeta(idPlantillaResumenEgresado, idCarpetaNueva)).getId();
    } else{
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
      valores:  null
    };
  } catch (e) {
    throw new Error("MAIN: Error en backend: " + e.message);
  }
}

/**
 * se ejecuta doGet para publicar la WebApp
 */

//-----------------INTERFAZ GRAFICA--------------------

/**
 * Alternativa: Publicar como Web App
 * Si quieres que el HTML se ejecute como una página web independiente, debes crear la función doGet() en tu archivo .gs:
 * Luego, vas a Publicar > Implementar como aplicación web, eliges permisos y usuarios, y obtienes una URL para acceder a tu página web.
 * https://script.google.com/a/macros/unc.edu.ar/s/AKfycbxVMeLx8gmDu67gzNXM9_1u2qmkgPvTxrHSV8sE0nddz_JHkiSStmxyJJN8c39099EZ/exec 
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

/**
 * función backend que se ejecuta al pulsar el botón
 */
function miFuncionBackend() {
  return "¡Hola, usuario!";
}

//-------------otras formas de aplicar la interfaz-----------

/**
 * Opcional: Crear un menú para llamar a la interfaz fácilmente
 * Puedes agregar un menú personalizado en Google Sheets para desplegar la interfaz, así:
 * Esto agregará un menú llamado "Mi Menú" con la opción "Abrir Interfaz" para mostrar el HTML
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Mi Menú')
    .addItem('Abrir Interfaz', 'showSidebar')
    .addToUi();
}

/**
 * interfaz con HTML y luego mostrarla dentro de un diálogo o barra lateral en Google Sheets o Docs
 * Y en el archivo HTML (Page.html)
 */
function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Page')
      .setTitle('Mi interfaz');
  SpreadsheetApp.getUi().showSidebar(html);
}


