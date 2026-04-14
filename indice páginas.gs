function explorar() {
  escanearCarpetaConEspera('1rJ0zgn6iVK6JQkm-tk23hq4rBqKupn4I');
}

function escanearCarpetaConEspera(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const archivos = folder.getFiles();
  const promesas = [];

  // Recolectar todas las promesas primero
  while (archivos.hasNext()) {
    const file = archivos.next();
    const fileId = file.getId();
    const nombre = file.getName();
    
    promesas.push(
      procesarArchivo(fileId, nombre).catch(error => {
        console.error(`Error en ${nombre}:`, error);
        return { nombre, tipo: 'Error', paginas: -1 };
      })
    );
  }

  // ESPERAR todas las promesas y luego mostrar resultados
  Promise.all(promesas).then(resultados => {
    console.log('=== RESULTADOS COMPLETOS ===');
    console.log(JSON.stringify(resultados, null, 2));
    
    // Opcional: guardar en Sheet
    guardarEnSheet(resultados);
    
    return resultados;
  }).catch(error => {
    console.error('Error general:', error);
  });
}

// Función auxiliar que retorna PROMISE con la estructura completa
function procesarArchivo(fileId, nombre) {
  return new Promise((resolve) => {
    const file = DriveApp.getFileById(fileId);
    const mimeType = file.getMimeType();
    
    if (mimeType === MimeType.PDF) {
      contarPaginasPDF(fileId).then(paginas => {
        resolve({ nombre, tipo: 'PDF', paginas });
      }).catch(() => resolve({ nombre, tipo: 'PDF', paginas: -1 }));
      
    } else if (mimeType === MimeType.GOOGLE_DOCS) {
      const paginas = contarPaginasGoogleDocs(fileId);
      resolve({ nombre, tipo: 'Google Docs', paginas });
      
    } else if (mimeType === MimeType.MICROSOFT_WORD ||
               mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const paginas = contarPaginasWord(fileId);
      resolve({ nombre, tipo: 'Word (DOCX)', paginas });
      
    } else {
      resolve({ nombre, tipo: 'No soportado', paginas: -1 });
    }
  });
}

//////////////auxiliares 

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


// Función BONUS: guardar en Google Sheet
function guardarEnSheet(resultados) {
  const sheet = SpreadsheetApp.create('Reporte Archivos - ' + new Date().toLocaleDateString());
  const data = [['Nombre', 'Tipo', 'Páginas']];
  
  resultados.forEach(r => {
    data.push([r.nombre, r.tipo, r.paginas]);
  });
  
  sheet.getRange(1, 1, data.length, 3).setValues(data);
  console.log('Sheet creado:', sheet.getUrl());
}
