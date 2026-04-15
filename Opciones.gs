/**
 * Procesa las opciones seleccionadas para el archivo PDF dado.
 * @param {string[]} opciones Opciones seleccionadas
 */
function procesarOpciones(opciones) {
  opciones.forEach(opcion => {
    switch (opcion) {
      case 'plan de estudios':
        //  buscar TO Plan y copiar archivo en carpeta destino
        var siglasCarrera = (obtenerDeptoYCodigoPorNombre(carrera)).codigo;
        var archivosEncontrados = buscarArchivosPorNombres(idTextosOrdenados, null, plan, siglasCarrera);
        Logger.log('Incluye: Plan de estudios: ');
        //------
        if (archivosEncontrados.length === 0) {
          Logger.log("No se encontraron archivos con ambos strings en el nombre.");
        } else {
          Logger.log("Archivos encontrados:");
          //copia CADA TO encontrado en la carpeta del estudiante
          archivosEncontrados.forEach(function (archivo) {
            Logger.log("Nombre: " + archivo.nombre + ", ID: " + archivo.id + ", URL: " + archivo.url);
            // Nuevo nombre para el archivo copiado
            let nuevoNombre = `03- Plan de estudios ${archivo.nombre}`;

            // Buscar si ya existe un archivo con ese nombre en la carpeta destino
            var carpetaDestino = DriveApp.getFolderById(idCarpetaNueva);
            var archivosExistentes = carpetaDestino.getFilesByName(nuevoNombre);

            // Si existe, eliminarlo
            while (archivosExistentes.hasNext()) {
              var archivoExistente = archivosExistentes.next();
              archivoExistente.setTrashed(true);
              Logger.log("Archivo existente eliminado: " + archivoExistente.getName());
            }

            // Copiar y renombrar archivo
            let planCopiado = copiarDocEnCarpeta(archivo.id, idCarpetaNueva);
            renombrarArchivoPorId(planCopiado.getId(), nuevoNombre);
          });
        }
        //------
        break;

      case 'carga horaria':
        Logger.log('Incluye: Carga horaria');
        // 1- copio plantilla de carga horaria
        idCargaHoraria = (copiarDocEnCarpeta(idPlantillaCargaHoraria, idCarpetaNueva)).getId();
        // 2- se buscan los datos de la carrera
        var siglasCarrera = (obtenerDeptoYCodigoPorNombre(carrera)).codigo;
        // 3- se copia la carga horaria del sheet repo 'idcargas' al sheet de trabajo 'idhistoria'
        //se construye la carga horaria en el sheet
        copiarDatosConMapa(idCargas, idHistoria, siglasCarrera + plan);
        // 4- se copia la carga al docs final
        insertarTablaDesdeSheetEnDoc(idHistoria, idCargaHoraria);
        // 5- se completa la carga con los datos principales
        editarCarga(idCargaHoraria);
        break;

      case 'escala de calificaciones':
        idEscala = (copiarDocEnCarpeta(idPlantillaEscala, idCarpetaNueva)).getId(); //copio escala
        editarEscala();
        Logger.log('Incluye: Escala de calificaciones');
        break;

      case 'programas':
        //file.setDescription((file.getDescription() || '') + '\nIncluye: Programas');
        buscarProgramas(idCarpetaProgramas, departamento, idCarpetaNueva);
        Logger.log('Incluye: Programas');
        break;

      default:
        Logger.log('Opción no reconocida: ' + opcion);
    }
  });
}


