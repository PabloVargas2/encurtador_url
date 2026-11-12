const crypto = require('node:crypto');

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Códigos aceitos: letras, números, hífen e sublinhado, de 3 a 32 caracteres.
const CODE_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;

// Palavras que não podem virar código, pois colidem com rotas da aplicação.
const RESERVED = new Set(['api', 'health', 'index.html', 'static']);

function generateCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return code;
}

function isValidUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidCode(value) {
  return (
    typeof value === 'string' &&
    CODE_PATTERN.test(value) &&
    !RESERVED.has(value.toLowerCase())
  );
}

module.exports = { generateCode, isValidUrl, isValidCode, ALPHABET };
