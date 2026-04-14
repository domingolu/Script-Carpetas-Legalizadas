//--------------------FUNCIONES AUXILIARES------------------------

/**
 * Devuelve una fecha formateada en español con el formato:
 * "dd días del mes de mm del año yyyy" (mes en palabras)
 * 
 * @param {Date} [fecha] - (Opcional) Objeto Date que representa la fecha a formatear. Si no se proporciona, se usa la fecha actual.
 * @return {string} La fecha formateada, por ejemplo: "18 días del mes de julio del año 2025"
 */
function fechaEnPalabras(fecha) {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  if (fecha === undefined) {
    fecha = new Date();
  }

  if (!(fecha instanceof Date)) {
    throw new Error("El argumento debe ser un objeto Date válido");
  }

  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();

  return dia + " días del mes de " + mes + " del año " + anio;
}
