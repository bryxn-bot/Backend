// Error con un código fijo, para que la API de tu compañero lo convierta en una respuesta HTTP
class ErrorCrud extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
  }
}

module.exports = { ErrorCrud };