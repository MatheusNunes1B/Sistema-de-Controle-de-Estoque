/** Preenche um número com zeros à esquerda até o tamanho desejado. Ex: pad(7, 3) -> "007" */
function pad(numero, tamanho) {
  return String(numero).padStart(tamanho, '0');
}

/** Valida o formato completo FFF.TTT.PPPP */
function validarCodigoCompleto(codigo) {
  return /^\d{3}\.\d{3}\.\d{4}$/.test(codigo);
}

module.exports = { pad, validarCodigoCompleto };
