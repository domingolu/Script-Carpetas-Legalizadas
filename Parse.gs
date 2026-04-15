//Estos son datos sacados del analítico
var carrera = "";
var plan = '';
var titulo = "";
var codigoTitulo = "";
var nombre = "";
var legajo = "";
var tipoIdentificacion = "";
var identificacion = "";
var fechaIngreso = "";
var resolucionMinisterial = "";
var institucionPrevia = '';
var tituloPrevio = '';
var esEgresado = false;  // Nueva variable para egresado
var fechaEgreso = '';

//Estos son datos deducidos en función del analítico
var departamento = '';
var siglasCarrera = '';

//---------------------------------------------------------------------------------//
/**
 * Función para parsear PDF desde Drive usando el ID del archivo y devolver texto extraído
 * @param {string} fileId - ID del archivo PDF en Google Drive
 * @returns {string} Datos extraídos del PDF
 */
function parse(fileId) {
  try {
    // Obtener el archivo PDF de Drive por ID
    const file = DriveApp.getFileById(fileId);
    const fileName = file.getName();

    // Preparar recurso para la conversión a Google Docs
    const resource = {
      name: fileName,
      mimeType: MimeType.GOOGLE_DOCS
    };

    // Opciones para la subida con OCR
    const options = {
      ocr: true,
      ocrLanguage: 'es',
      supportsAllDrives: true
    };

    // Convertir PDF a Google Docs para obtener texto
    const convertedFile = Drive.Files.create(resource, file.getBlob(), { convert: true });
    //  const convertedFile = Drive.Files.create(resource, pdfBlob, options);
    const docId = convertedFile.id;

    // Abrir el documento convertido y obtener el texto
    const doc = DocumentApp.openById(docId);
    const texto = doc.getBody().getText();

    //-------Datos específicos parseados------------------------
    const carreraMatch = texto.match(/Carrera\s*:\s*(.+?)\s*-/i);
    carrera = carreraMatch ? carreraMatch[1].trim() : "No encontrado";
    departamento = (obtenerDeptoYCodigoPorNombre(carrera)).depto;

    const planMatch = texto.match(/PLAN\s+(\d+)/i);
    plan = planMatch ? planMatch[1] : "No encontrado";

    const tituloMatch = texto.match(/Título\s*:\s*([A-Za-z0-9]+)\s*(.+)/i);
    titulo = tituloMatch ? tituloMatch[2].trim() : "No encontrado"; //el grupo 1 es el código de título, y el grupo 2 es el nombre
    codigoCarrera = tituloMatch ? tituloMatch[1].trim() : "No encontrado";

    const nombreMatch = texto.match(/certifica que ([A-ZÁÉÍÓÚÑÜ'\-\s]+, [A-ZÁÉÍÓÚÑÜ\s]+)/i);
    nombre = nombreMatch ? nombreMatch[1].trim() : "No encontrado";

    const legajoMatch = texto.match(/Legajo Nº (\d+)/i);
    legajo = legajoMatch ? legajoMatch[1].trim() : "No encontrado";

    //--------------
    const idMatch = texto.match(/Legajo[^,]*,\s*(.*?)\s*quien ingresó/si);
    if (idMatch) {
      var textoEntre = idMatch[1].trim(); // e.g. "DNI 38181841"
      var palabras = textoEntre.split(/[\s,]+/); // ["DNI", "38181841"]

      tipoIdentificacion = palabras[0] || "No encontrado";
      identificacion = palabras[1] || "No encontrado";
    } else {
      tipoIdentificacion = "No encontrado";
      identificacion = "No encontrado";
    }
    //------------------

    const fechaIngresoMatch = texto.match(/el día\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
    fechaIngreso = fechaIngresoMatch ? fechaIngresoMatch[1].trim() : "No encontrado";

    const resolucionMatch = texto.match(/Resolución Ministerial Nº ([^,]+), dictada/i);
    resolucionMinisterial = resolucionMatch ? resolucionMatch[1].trim() : "No encontrado";

    const secundarioMatch = texto.match(/Secundario\s+([\s\S]*?)\s*-\s*([\s\S]*?)\s*,*\s*registra/i);
    tituloPrevio = secundarioMatch ? secundarioMatch[1].trim() : "No encontrado";
    institucionPrevia = secundarioMatch ? secundarioMatch[2].trim() : "No encontrado";

    //------------------------------------------------------
    if (/egresó/i.test(texto) || /con egreso en la carrera el/i.test(texto)) { // Busca "egresó" O "con egreso en la carrera el"
      esEgresado = true;
      // Buscar la fecha en formato (dd/mm/aaaa)
      const fechaMatch = texto.match(/\((\d{2}\/\d{2}\/\d{4})\)/);
      if (fechaMatch) {
        fechaEgreso = fechaMatch[1];  // Será "28/10/2016"
      }
    }
    console.log({ esEgresado, fechaEgreso });
    //------------------------------------------------------

    // Eliminar archivo google docs temporal
    DriveApp.getFileById(docId).setTrashed(true);

    // Opcional: puedes devolver todo el texto u objetos con los datos parseados
    return texto;

  } catch (e) {
    return 'Error al parsear PDF: ' + e.message;
  }
}

/**
 * Obtiene el departamento y el código correspondiente al nombre de una carrera o título.
 *
 * @param {string} nombreCarrera - El nombre completo de la carrera o título.
 * @return {Object} Objeto con propiedades 'depto' y 'codigo'. Si no se encuentra, ambos son mensajes de error.
 *
 * @example
 * var info = obtenerDeptoYCodigoPorNombre("Licenciatura en Cine y Televisión");
 * Logger.log(info.depto);  // "Cine"
 * Logger.log(info.codigo); // "LCTV"
 */
function obtenerDeptoYCodigoPorNombre(nombreCarrera) {
  // Diccionario con nombre como clave y objeto con depto y codigo como valor
  const lista = {
    "Profesorado en Perfeccionamiento Instrumental (Piano)": { depto: "Música", codigo: "PPI" },
    "Profesorado en Perfeccionamiento Instrumental (Violín)": { depto: "Música", codigo: "PPI" },
    "Profesorado en Perfeccionamiento Instrumental (Viola)": { depto: "Música", codigo: "PPI" },
    "Profesorado en Perfeccionamiento Instrumental (Violoncello)": { depto: "Música", codigo: "PPI" },
    "Licenciatura en Perfeccionamiento Instrumental (Piano)": { depto: "Música", codigo: "LPI" },
    "Licenciatura en Perfeccionamiento Instrumental (Violin)": { depto: "Música", codigo: "LPI" },
    "Licenciatura en Perfeccionamiento Instrumental (Viola)": { depto: "Música", codigo: "LPI" },
    "Licenciatura en Perfeccionamiento Instrumental (Violoncello)": { depto: "Música", codigo: "LPI" },
    "Licenciatura en Interpretación Instrumental": { depto: "Música", codigo: "LII" },
    "Profesorado en Composición Musical": { depto: "Música", codigo: "PCM" },
    "Licenciatura en Composición Musical": { depto: "Música", codigo: "LCM" },
    "Licenciatura en Dirección Coral": { depto: "Música", codigo: "LDC" },
    "Profesorado en Educación Musical": { depto: "Música", codigo: "PEM" },
    "Licenciatura en Educación Musical": { depto: "Música", codigo: "LEM" },
    "Licenciatura en Pintura": { depto: "AV", codigo: "LP" },
    "Licenciatura en Escultura": { depto: "AV", codigo: "LE" },
    "Profesorado Superior de Educación en Artes Plásticas: Pintura": { depto: "AV", codigo: "PSEAP" },
    "Licenciatura en Grabado": { depto: "AV", codigo: "LG" },
    "Profesorado Superior de Educación en Artes Plásticas: Escultura": { depto: "AV", codigo: "PSEAP" },
    "Profesorado Superior de Educación en Artes Plásticas: Grabado": { depto: "AV", codigo: "PSEAP" },
    "Profesorado en Educación Plástica y Visual": { depto: "AV", codigo: "PEPV" },
    "Licenciatura en Artes Visuales": { depto: "AV", codigo: "LAV" },
    "Licenciatura en  Teatro": { depto: "Teatro", codigo: "LT" },
    "Licenciatura en Teatro": { depto: "Teatro", codigo: "LT" },
    "Profesorado de Teatro": { depto: "Teatro", codigo: "PT" },
    "Licenciatura en Cine y Artes Audiovisuales": { depto: "Cine", codigo: "LCAAV" },
    "Licenciatura en Cine y Televisión": { depto: "Cine", codigo: "LCTV" }
  };

  const info = lista[nombreCarrera];

  if (info) {
    return info;
  } else {
    return {
      depto: "Departamento no encontrado",
      codigo: "Código no encontrado"
    };
  }
}

/**
 * Convierte un archivo PDF en un Google Doc con OCR, extrae las tablas que contiene,
 * y las importa a un nuevo Google Sheets organizado con todas las tablas juntas en una hoja,
 * guardado en una carpeta específica.
 * 
 * @param {string} pdfId - ID del archivo PDF en Google Drive que se quiere convertir.
 * @param {string} folderId - ID de la carpeta de Google Drive donde se guardarán los resultados (Google Doc convertido y Google Sheets).
 * @returns {string} ID de la hoja de cálculo con los datos extraídos.
 * 
 * Nota:
 * - Debes tener habilitado el servicio avanzado de Drive API v3 en Apps Script.
 * - La API Google Drive también debe estar habilitada en Cloud Console para tu proyecto.
 */
function importarTablasDePDFaSheets(pdfId, folderId) {
  try {
    // 1. Obtener archivo PDF original y su blob
    const pdfFile = DriveApp.getFileById(pdfId);
    const pdfBlob = pdfFile.getBlob();

    // Nombre base para el Sheet a crear
    const nombreSheet = pdfFile.getName() + '_Tablas';

    // --- Validar si ya existe un archivo con ese nombre en Drive y eliminarlo ---
    // Buscar archivos con ese nombre (pueden ser varios, se eliminan todos)
    const archivosExistentes = DriveApp.getFilesByName(nombreSheet);
    while (archivosExistentes.hasNext()) {
      const archivoExistente = archivosExistentes.next();
      archivoExistente.setTrashed(true);  // Mover a la papelera
      Logger.log('Archivo existente eliminado: ' + archivoExistente.getName() + ' (' + archivoExistente.getId() + ')');
    }

    // 2. Metadata para nuevo Google Doc convertido por OCR
    const resource = {
      name: pdfFile.getName() + '_convertido',
      parents: [folderId],
      mimeType: 'application/vnd.google-apps.document'
    };

    // 3. Crear blob para la subida (asegurarse que tiene nombre)
    const blob = pdfBlob.setName(pdfFile.getName() + '.pdf');

    // 4. Crear el archivo con Drive API avanzado y activar OCR
    const insertFile = Drive.Files.create(
      resource,
      blob,
      {
        convert: true,
        ocr: true,
        ocrLanguage: 'es'  // Opcional, cambiar según idioma
      }
    );

    if (!insertFile || !insertFile.id) {
      Logger.log('Error al convertir el PDF con OCR.');
      return;
    }

    Logger.log('Archivo Google Docs creado con ID: ' + insertFile.id);

    // 5. Abrir Google Docs convertido y obtener el body para buscar tablas
    const doc = DocumentApp.openById(insertFile.id);
    const bodyDoc = doc.getBody();

    // 6. Buscar todas las tablas en el cuerpo del documento
    let tablas = [];
    for (let i = 0; i < bodyDoc.getNumChildren(); i++) {
      let element = bodyDoc.getChild(i);
      if (element.getType() === DocumentApp.ElementType.TABLE) {
        tablas.push(element.asTable());
      }
    }

    if (tablas.length === 0) {
      Logger.log("No se encontraron tablas en el PDF.");
      return;
    }

    // 7. Crear nuevo Google Sheets y moverlo a la carpeta destino
    const ss = SpreadsheetApp.create(nombreSheet);
    const sheetFile = DriveApp.getFileById(ss.getId());
    DriveApp.getFolderById(folderId).addFile(sheetFile);
    DriveApp.getRootFolder().removeFile(sheetFile);

    // 8. Copiar todas las tablas a la primera hoja, una debajo de la otra
    const hoja = ss.getSheets()[0];
    hoja.setName('Tablas_combinadas');

    let filaInicio = 1;  // fila donde se pegará la siguiente tabla

    tablas.forEach(function (tabla) {
      for (let r = 0; r < tabla.getNumRows(); r++) {
        let fila = tabla.getRow(r);
        let filaDatos = [];
        for (let c = 0; c < fila.getNumCells(); c++) {
          filaDatos.push(fila.getCell(c).getText());
        }
        hoja.getRange(filaInicio, 1, 1, filaDatos.length).setValues([filaDatos]);
        filaInicio++;  // subir a la siguiente fila para la próxima iteración
      }
      // Opcional: dejar una fila en blanco entre tablas
      filaInicio++;
    });

    // -- Aquí eliminamos el documento Google Docs convertido --
    DriveApp.getFileById(insertFile.id).setTrashed(true);

    Logger.log('Tablas importadas y guardadas en Google Sheets con ID: ' + ss.getId());
    return ss.getId();

  } catch (e) {
    Logger.log('Error en la función importarTablasDePDFaSheets: ' + e.message);
  }
}
