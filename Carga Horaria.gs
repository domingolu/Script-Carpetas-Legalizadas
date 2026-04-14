/**
 * Copia valores desde un sheet en idCargas a un sheet en idHistoria basado en claves encontradas con regex.
 * Este script realiza las siguientes acciones:
    Verifica si el sheet nombreHoja existe en el spreadsheet con ID idCargas.
    Construye un mapa con clave en columna A y valor en columna G de nombreHoja.
    Abre la segunda hoja del spreadsheet idHistoria.
    Escanea la columna A en esa hoja buscando coincidencias con la expresión regular 95-[A-Za-z0-9]+(?= -).
    Si encuentra una clave del mapa en la columna A, copia su valor asociado en la columna H (columna 8).
 * 
 *
 * @param {string} idCargas - ID del spreadsheet origen.
 * @param {string} idHistoria - ID del spreadsheet destino.
 * @param {string} nombreHoja - Nombre de la hoja en idCargas que contiene datos clave-valor.
 */
function copiarDatosConMapa(idCargas, idHistoria, nombreHoja) {
  // Expresión regular para extraer el código 95-xxxx antes de " -"
  const regexCodigo = /95-[A-Za-z0-9]+(?= -)/;

  // Abrir los spreadsheets
  const ssCargas = SpreadsheetApp.openById(idCargas);
  const ssHistoria = SpreadsheetApp.openById(idHistoria);

  // Verificar que la hoja 'nombreHoja' existe en idCargas
  const sheetCargas = ssCargas.getSheetByName(nombreHoja);
  if (!sheetCargas) {
    throw new Error(`La hoja '${nombreHoja}' no existe en el spreadsheet idCargas.`);
  }

  // Obtener la segunda hoja en idHistoria
  const sheetsHistoria = ssHistoria.getSheets();
  if (sheetsHistoria.length < 2) {
    throw new Error(`El spreadsheet idHistoria no tiene al menos dos hojas.`);
  }
  const sheetHistoria = sheetsHistoria[1]; // índice 1 = segunda hoja

  // Crear mapa clave-valor usando columna A (clave) y columna G (valor) de nombreHoja
  // Obtener datos desde la hoja de origen
  const dataCargas = sheetCargas.getRange(1, 1, sheetCargas.getLastRow(), 7).getValues();
  const mapaDatos = new Map();

  dataCargas.forEach(row => {
    const clave = row[0];   // Columna A (índice 0)
    const valor = row[6];   // Columna G (índice 6)
    if (clave !== "" && valor !== "") {
      mapaDatos.set(clave.toString(), valor);
    }
  });

  // Obtener datos de la segunda hoja de idHistoria para buscar claves
  const lastRowHistoria = sheetHistoria.getLastRow();
  if (lastRowHistoria < 1) return; // No hay datos, nada que hacer
  const columnaA_Historia = sheetHistoria.getRange(1, 1, lastRowHistoria).getValues();

  // Recorrer cada fila de idHistoria para buscar la clave en columna A con regex
  columnaA_Historia.forEach((fila, i) => {
    const celdaTexto = fila[0].toString();
    const match = celdaTexto.match(regexCodigo);
    
    if (match) {
      const codigoEncontrado = match[0];
      // Si la clave existe en el mapa, actualizar columna H (7)
      if (mapaDatos.has(codigoEncontrado)) {
        const valorParaEscribir = mapaDatos.get(codigoEncontrado);
        sheetHistoria.getRange(i + 1, 8).setValue(valorParaEscribir);
      }
    }
  });
}
