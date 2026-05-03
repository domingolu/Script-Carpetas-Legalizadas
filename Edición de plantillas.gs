/**
 * Reemplaza todas las ocurrencias de un texto específico por otro texto en un documento de Google Docs.
 *
 * @param {string} idDocumento - El ID del documento de Google Docs donde se realizará el reemplazo.
 * @param {string} textoBuscar - El texto (o patrón) que se desea buscar en el documento (puede incluir expresiones regulares).
 * @param {string} textoReemplazo - El texto que reemplazará las ocurrencias encontradas.
 *
 * @returns {string} Mensaje con el resultado de la operación.
 *
 * @example
 * // Reemplaza todas las ocurrencias de {{IDENTIFICACION}} por DNI en el documento con ID '1a2b3c4d5e'
 * var resultado = reemplazarTextoEnDocumento('1a2b3c4d5e', '{{IDENTIFICACION}}', 'DNI');
 * Logger.log(resultado);
 */
function reemplazarTextoEnDocumento(idDocumento, textoBuscar, textoReemplazo) {
  try {
    // Intenta abrir el documento por su ID
    var documento = DocumentApp.openById(idDocumento);

    // Obtiene el cuerpo principal del documento
    var cuerpo = documento.getBody();

    // Reemplaza todas las ocurrencias del texto especificado
    cuerpo.replaceText(textoBuscar, textoReemplazo);

    // Guarda y cierra el documento para aplicar los cambios
    documento.saveAndClose();

    //Logger.log('Reemplazo completado correctamente.: '+textoBuscar+':'+textoReemplazo);

    return 'Reemplazo completado correctamente.';

  } catch (e) {
    // Captura cualquier error (documento no existe o sin permisos)
    Logger.log('Error: No se pudo abrir el documento. Verifique que el ID sea correcto y que tenga acceso.');
    return 'Error: No se pudo abrir el documento. Verifique que el ID sea correcto y que tenga acceso.';
  }
}

function editarPlantillas() {
  //editar carátula
  reemplazarTextoEnDocumento(idCaratula, '{{NOMBRE}}', nombre);
  reemplazarTextoEnDocumento(idCaratula, '{{TIPOIDENTIFICACION}}', tipoIdentificacion);
  reemplazarTextoEnDocumento(idCaratula, '{{IDENTIFICACION}}', identificacion);
  reemplazarTextoEnDocumento(idCaratula, '{{CARRERA}}', carrera);
  reemplazarTextoEnDocumento(idCaratula, '{{TITULO}}', titulo);
  reemplazarTextoEnDocumento(idCaratula, '{{PLAN}}', plan);
  reemplazarTextoEnDocumento(idCaratula, '{{RM}}', resolucionMinisterial);

  //editar resumen
  if (esEgresado) {
    reemplazarTextoEnDocumento(idResumenEgresado, '{{NOMBRE}}', nombre);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{IDENTIFICACION}}', identificacion);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{TIPOIDENTIFICACION}}', tipoIdentificacion);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{NACIONALIDAD}}', nacionalidad);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{FECHAINGRESO}}', fechaIngreso);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{CARRERA}}', carrera);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{PLAN}}', plan);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{RM}}', resolucionMinisterial);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{TITULO}}', titulo);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{DESTINO}}', destino);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{FECHAEGRESO}}', fechaEgreso);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{TITULOPREVIO}}', tituloPrevio);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{INSTITUCIONPREVIA}}', institucionPrevia);
    reemplazarTextoEnDocumento(idResumenEgresado, '{{FECHA}}', fechaEnPalabras());
    reemplazarTextoEnDocumento(idResumenEgresado, '{{SANCIONADO}}', sancionado);
  } else {
    reemplazarTextoEnDocumento(idResumenAlumno, '{{NOMBRE}}', nombre);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{IDENTIFICACION}}', identificacion);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{TIPOIDENTIFICACION}}', tipoIdentificacion);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{NACIONALIDAD}}', nacionalidad);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{FECHAINGRESO}}', fechaIngreso);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{CARRERA}}', carrera);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{PLAN}}', plan);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{RM}}', resolucionMinisterial);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{TITULOPREVIO}}', tituloPrevio);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{INSTITUCIONPREVIA}}', institucionPrevia);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{DESTINO}}', destino);
    reemplazarTextoEnDocumento(idResumenAlumno, '{{FECHA}}', fechaEnPalabras());
    reemplazarTextoEnDocumento(idResumenAlumno, '{{SANCIONADO}}', sancionado);
  }
}

function editarEscala() {
  //editar escala ----FALTA AGREGAR TÍTULO SI ES EGRESADO!!!
  reemplazarTextoEnDocumento(idEscala, '{{NOMBRE}}', nombre);
  reemplazarTextoEnDocumento(idEscala, '{{TIPOIDENTIFICACION}}', tipoIdentificacion);
  reemplazarTextoEnDocumento(idEscala, '{{IDENTIFICACION}}', identificacion);

  reemplazarTextoEnDocumento(idEscala, '{{EGRESADO}}', esEgresado ? "egresado/a" : "estudiante");

  reemplazarTextoEnDocumento(idEscala, '{{CARRERA}}', carrera);
  reemplazarTextoEnDocumento(idEscala, '{{PLAN}}', plan);
  reemplazarTextoEnDocumento(idEscala, '{{RM}}', resolucionMinisterial);
  reemplazarTextoEnDocumento(idEscala, '{{FECHAINGRESO}}', fechaIngreso);
  reemplazarTextoEnDocumento(idEscala, '{{DESTINO}}', destino);
  reemplazarTextoEnDocumento(idEscala, '{{FECHA}}', fechaEnPalabras());
}

function editarCarga(idDocs) {
  reemplazarTextoEnDocumento(idDocs, '{{NOMBRE}}', nombre);
  reemplazarTextoEnDocumento(idDocs, '{{EGRESADO}}', esEgresado ? "Egresado/a" : "Estudiante");
  reemplazarTextoEnDocumento(idDocs, '{{TIPOIDENTIFICACION}}', tipoIdentificacion);
  reemplazarTextoEnDocumento(idDocs, '{{IDENTIFICACION}}', identificacion);

  reemplazarTextoEnDocumento(idDocs, '{{CARRERA}}', carrera);
  reemplazarTextoEnDocumento(idDocs, '{{PLAN}}', plan);
  reemplazarTextoEnDocumento(idDocs, '{{RM}}', resolucionMinisterial);
  //reemplazarTextoEnDocumento(idDocs,'{{FECHAINGRESO}}',fechaIngreso);
  reemplazarTextoEnDocumento(idDocs, '{{DESTINO}}', destino);
  reemplazarTextoEnDocumento(idDocs, '{{FECHA}}', fechaEnPalabras());
}

/**
 * Extrae los datos de la columna A y G de la hoja 2 de un Google Sheet dado por su ID
 * e inserta esos datos como una tabla en un Google Docs, reemplazando la etiqueta {{TABLA_CARGA}}.
 *
 * @param {string} idHistoria - El ID del Google Sheet de donde se extraen los datos.
 * @param {string} idDocs - El ID del Google Docs donde se insertará la tabla.
 *
 * Funcionalidad:
 * - Lee todas las filas de la columna A y G de la hoja 2 del Google Sheet.
 * - Considera las filas hasta la primera fila vacía en la columna A para fines de extracción.
 * - Busca la etiqueta {{TABLA_CARGA}} en el Google Docs y la reemplaza por la tabla con los datos extraídos.
 * - Si no encuentra la etiqueta, no realiza ninguna inserción.
 * - Si la hoja está vacía o no tiene datos en la columna A, detiene la ejecución.
 *
 * El documento Google Docs se actualiza y guarda automáticamente.
 */

function insertarTablaDesdeSheetEnDoc(idHistoria, idDocs) {

  // Abrir el Google Sheet y seleccionar la hoja 2 (índice 1)
  const ss = SpreadsheetApp.openById(idHistoria);
  const hoja = ss.getSheets()[1];

  // Obtener datos de las columnas A y G
  const datosColA = hoja.getRange("A:A").getValues();
  const datosColH = hoja.getRange("H:H").getValues();

  // Construir array filtrando filas hasta primera vacía en columna A
  const tablaDatos = [];
  tablaDatos.push(["Materia", "Carga horaria (hs)"]); //cabecera de tabla

  for (let i = 0; i < datosColA.length; i++) {
    const valorA = datosColA[i][0];
    const valorH = datosColH[i][0];
    if (valorA !== "" && valorA !== null && valorA !== undefined) {
      tablaDatos.push([valorA, valorH]);
    } else {
      break;
    }
  }

  if (tablaDatos.length === 0) {
    Logger.log("No hay datos para insertar.");
    return;
  }

  // Abrir el documento Google Docs y obtener el cuerpo
  const doc = DocumentApp.openById(idDocs);
  const body = doc.getBody();

  // Buscar etiqueta {{TABLA_CARGA}} en el documento
  const searchResult = body.findText("{{TABLA_CARGA}}");
  if (!searchResult) {
    Logger.log("No se encontró la etiqueta {{TABLA_CARGA}} en el documento.");
    return;
  }

  const element = searchResult.getElement();
  const startOffset = searchResult.getStartOffset();

  // Eliminar la etiqueta del texto
  element.deleteText(startOffset, startOffset + "{{TABLA_CARGA}}".length - 1);

  // Obtener el párrafo padre para insertar la tabla después de él
  const paragraph = element.getParent();

  // Insertar tabla con los datos justo después del párrafo que contenía la etiqueta
  const tabla = body.insertTable(body.getChildIndex(paragraph) + 1);
  for (let i = 0; i < tablaDatos.length; i++) {
    const fila = tabla.appendTableRow();
    fila.appendTableCell(tablaDatos[i][0].toString());
    fila.appendTableCell(tablaDatos[i][1].toString());
  }
  //estilo de tabla
  tabla.getRow(0).editAsText().setBold(true);
  Logger.log("ancho columna 1: " + tabla.getColumnWidth(0));
  Logger.log("ancho columna 2: " + tabla.getColumnWidth(1));
  tabla.setColumnWidth(1, 44);

  // Guardar y cerrar el documento
  doc.saveAndClose();

  Logger.log("Tabla insertada exitosamente.");
}
