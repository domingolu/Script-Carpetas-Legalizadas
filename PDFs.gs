/**
 * Combina todos los archivos contenidos en una carpeta dada (Google Docs, PDFs, y JPG)
 * en un único archivo PDF ordenado alfabéticamente por nombre, guardado en la misma carpeta.
 *
 * Para cada archivo en la carpeta:
 * - Si es un Google Docs, lo convierte a PDF.
 * - Si es un PDF, lo agrega tal cual.
 * - Si es un JPG, lo convierte a un PDF con la imagen en una página.
 *
 * Usa la biblioteca PDFApp para unir los PDFs generados.
 *
 * @param {string} folderId - ID de la carpeta de Google Drive que contiene los archivos.
 *
 * Requiere añadir la biblioteca PDFApp con clave:
 * 1Xmtr5XXEakVql7N6FqwdCNdpdijsJOxgqH173JSB0UOwdb0GJYJbnJLk
 */
function mergeFolderPdf(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const filesIter = folder.getFiles();

  // Extraer todos los archivos en un array para luego ordenar
  const files = [];
  while (filesIter.hasNext()) {
    files.push(filesIter.next());
  }

  // Ordenar archivos alfabéticamente por nombre
  files.sort((a, b) => a.getName().localeCompare(b.getName(), 'es', { sensitivity: 'base' }));

  const pdfBlobs = [];

  files.forEach(file => {
    const mimeType = file.getMimeType();
    const name = file.getName();

    if (mimeType === MimeType.GOOGLE_DOCS) {
      // Convertir Google Docs a PDF
      const doc = DocumentApp.openById(file.getId());
      const pdfBlob = doc.getAs('application/pdf').setName(name + '.pdf');
      pdfBlobs.push(pdfBlob);

    } else if (mimeType === MimeType.PDF) {
      // PDF ya existente
      pdfBlobs.push(file.getBlob());

    } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      // Convertir JPG a PDF simple con imagen como única página
      const imgBlob = file.getBlob();
      const pdfBlob = imageBlobToPdf(imgBlob, name);
      pdfBlobs.push(pdfBlob);
    }
    // Puedes agregar otros tipos si quieres
  });

  if (pdfBlobs.length === 0) {
    Logger.log("No se encontraron archivos compatibles para unir.");
    return;
  }

  // Unir los PDFs con PDFApp (adaptar según su API, aquí ejemplo con promesas)
  PDFApp.mergePDFs(pdfBlobs)
    .then(combinedBlob => {
      const combinedFile = folder.createFile(combinedBlob.setName('Archivo_Combinado.pdf'));
      Logger.log('PDF combinado creado. ID del archivo: ' + combinedFile.getId());
    })
    .catch(err => {
      Logger.log('Error al combinar PDFs: ' + err);
    });
}

/**
 * Convierte un blob de imagen JPG a un blob PDF simple con la imagen en una página.
 * 
 * @param {Blob} imageBlob - Blob de la imagen JPG.
 * @param {string} fileName - Nombre para asignar al PDF resultado.
 * @return {Blob} - Blob del PDF generado.
 */
function imageBlobToPdf(imageBlob, fileName) {
  // Crear un documento vacío de Google Docs temporal
  const doc = DocumentApp.create('tempDocForImageToPdf');
  const body = doc.getBody();

  // Insertar la imagen en el documento
  body.appendImage(imageBlob);

  // Guardar y obtener el PDF resultante
  const pdfBlob = DriveApp.getFileById(doc.getId()).getAs('application/pdf').setName(fileName + '.pdf');

  // Borrar el documento temporal para no dejar basura
  DriveApp.getFileById(doc.getId()).setTrashed(true);

  return pdfBlob;
}