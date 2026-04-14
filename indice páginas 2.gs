// Función principal que escanea la carpeta y retorna un arreglo con la estructura solicitada
function escanearArchivosCarpeta(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const archivos = folder.getFiles();
  const resultados = [];

  while (archivos.hasNext()) {
    const file = archivos.next();
    const fileId = file.getId();
    const nombre = file.getName();
    const mimeType = file.getMimeType();
    let tipoArchivo = 'Desconocido';
    let paginas = -1;

    // Determinar tipo y contar páginas
    if (mimeType === MimeType.PDF) {
      tipoArchivo = 'PDF';
      paginas = contarPaginasPDF(fileId); // Asíncrono, se maneja en consola o callback
    } else if (mimeType === MimeType.GOOGLE_DOCS) {
      tipoArchivo = 'Google Docs';
      paginas = contarPaginasGoogleDocs(fileId);
    } else if (mimeType === MimeType.MICROSOFT_WORD ||
      mimeType === MimeType.MICROSOFT_WORD_LEGACY ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      tipoArchivo = 'Word (DOCX)';
      paginas = contarPaginasWord(fileId);
    }

    // Agregar a la estructura (páginas PDF asíncronas se loguean)
    resultados.push({
      nombre: nombre,
      tipo: tipoArchivo,
      paginas: paginas
    });

    console.log(`Procesado: ${nombre} (${tipoArchivo}, ${paginas} páginas)`);
  }

  console.log('Resultados completos:', JSON.stringify(resultados));
  return resultados;
}

// Función MODIFICADA: contarPaginas ahora retorna la estructura completa
function contarPaginas(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const nombre = file.getName();
    const mimeType = file.getMimeType();
    let tipoArchivo = 'Desconocido';
    let paginas = -1;

    if (mimeType === MimeType.PDF) {
      tipoArchivo = 'PDF';
      // Para PDF, usa la versión sync o maneja promesa
      contarPaginasPDF(fileId).then(numPaginas => {
        console.log(`PDF ${nombre}: ${numPaginas} páginas`);
        paginas = numPaginas;
      }).catch(e => {
        console.error(`Error PDF ${nombre}:`, e);
        paginas = -1;
      });
      // Nota: paginas se actualiza asíncronamente, no bloquea
    } else if (mimeType === MimeType.GOOGLE_DOCS) {
      tipoArchivo = 'Google Docs';
      paginas = contarPaginasGoogleDocs(fileId);
    } else if (mimeType === MimeType.MICROSOFT_WORD ||
      mimeType === MimeType.MICROSOFT_WORD_LEGACY ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      tipoArchivo = 'Word (DOCX)';
      paginas = contarPaginasWord(fileId);
    } else {
      console.log(`Tipo no soportado para ${nombre}: ${mimeType}`);
      return null;
    }

    // Retorna estructura inmediata (para no-PDF)
    const estructura = { nombre, tipo: tipoArchivo, paginas };
    console.log(`Archivo: ${JSON.stringify(estructura)}`);
    return estructura;
  } catch (e) {
    console.log(`Error procesando ${fileId}: ${e.toString()}`);
    return null;
  }
}

// Las otras funciones permanecen iguales
function contarPaginasGoogleDocs(fileId) {
  try {
    const doc = DocumentApp.openById(fileId);
    const blob = doc.getAs('application/pdf');
    const data = blob.getDataAsString();
    const match = data.match(/\/Count (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  } catch (e) {
    Logger.log('Error Google Docs: ' + e.toString());
    return -1;
  }
}

function contarPaginasWord(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    if (file.getMimeType() !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      throw new Error('No es DOCX.');
    }
    const blob = file.getBlob().getAs('application/pdf');
    const data = blob.getDataAsString();
    const match = data.match(/\/Count (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  } catch (e) {
    Logger.log('Error Word: ' + e.toString());
    return -1;
  }
}

async function contarPaginasPDF(fileId) {
  const file = DriveApp.getFileById(fileId);
  const blob = file.getBlob();
  const cdnjs = "https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js";
  eval(UrlFetchApp.fetch(cdnjs).getContentText());
  const pdfData = await PDFLib.PDFDocument.load(new Uint8Array(blob.getBytes()));
  const numPaginas = pdfData.getPageCount();
  console.log(`PDF páginas: ${numPaginas}`);
  return numPaginas;
}

// USO EJEMPLO:
// const datos = escanearArchivosCarpeta('TU_FOLDER_ID');
// console.log(datos); // Arreglo con [{nombre: '...', tipo: '...', paginas: 5}, ...]
function explorar() {
  const datos = escanearArchivosCarpeta('1rJ0zgn6iVK6JQkm-tk23hq4rBqKupn4I');
  console.log(datos); // Arreglo con [{nombre: '...', tipo: '...', paginas: 5}, ...]
}

//----------------------------------------
